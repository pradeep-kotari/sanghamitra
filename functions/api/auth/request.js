import { isAdminEmail, json, normalizeEmail, sha256Hex } from "../../lib/auth.js";
import { sendAdminCode } from "../../lib/email.js";

function randomCode() {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
  return String(n).padStart(6, "0");
}

export async function onRequestPost(context) {
  const { env } = context;
  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Send JSON" }, 400);
  }
  const email = normalizeEmail(body.email);
  const generic = { ok: true, message: "If that address is an admin, a code is on its way." };

  if (!email || !isAdminEmail(email)) return json(generic);

  const ip = context.request.headers.get("CF-Connecting-IP") || "local";
  const rateKey = `otp-rate:${email}:${ip}`;
  const count = Number((await env.ADMIN.get(rateKey)) || "0");
  if (count >= 5) return json({ error: "Too many codes. Wait 15 minutes." }, 429);
  await env.ADMIN.put(rateKey, String(count + 1), { expirationTtl: 15 * 60 });

  const previous = await env.ADMIN.get(`otp:${email}`);
  const code = randomCode();
  const hash = await sha256Hex(`${email}:${code}`);
  await env.ADMIN.put(`otp:${email}`, hash, { expirationTtl: 10 * 60 });

  const sent = await sendAdminCode(env, email, code);

  // Local development has no mail provider bound, so the code can never arrive by email and sign-in
  // is impossible. When BOTH providers are absent — which is only ever true on a developer machine,
  // production has both — print the code to the server log so the developer can sign in. The code is
  // never put in the HTTP response, so this cannot leak to a browser even if it somehow ran in production.
  if (!sent.ok && !env.RESEND_API_KEY && !env.BREVO_API_KEY) {
    console.log(`[local dev] no mail provider configured. Sign-in code for ${email}: ${code}`);
    return json(generic);
  }

  if (!sent.ok) {
    if (previous) {
      await env.ADMIN.put(`otp:${email}`, previous, { expirationTtl: 24 * 60 * 60 });
    } else {
      await env.ADMIN.delete(`otp:${email}`);
    }
    return json({ error: "Could not send email. Try again in a minute." }, 502);
  }
  return json(generic);
}
