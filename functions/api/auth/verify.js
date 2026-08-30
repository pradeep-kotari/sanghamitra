import { cookieHeader, isAdminEmail, json, makeSession, normalizeEmail, sha256Hex } from "../../lib/auth.js";

export async function onRequestPost(context) {
  const { env, request } = context;
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Send JSON" }, 400);
  }
  const email = normalizeEmail(body.email);
  const code = String(body.code || "").replace(/\s/g, "");
  if (!isAdminEmail(email) || !/^\d{6}$/.test(code)) {
    return json({ error: "That code is not valid." }, 401);
  }
  if (!env.SESSION_SECRET) return json({ error: "Server is missing SESSION_SECRET" }, 500);

  const expected = await env.ADMIN.get(`otp:${email}`);
  const got = await sha256Hex(`${email}:${code}`);
  if (!expected || expected !== got) return json({ error: "That code is not valid." }, 401);

  await env.ADMIN.delete(`otp:${email}`);
  const token = await makeSession(email, env.SESSION_SECRET);
  return json(
    { ok: true, email },
    200,
    { "Set-Cookie": cookieHeader(token, request) },
  );
}
