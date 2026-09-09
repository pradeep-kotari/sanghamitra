import { cookieHeader, isAdminEmail, json, makeSession, normalizeEmail, sha256Hex } from "../../lib/auth.js";

// Two ways in, both checked here.
//
//   1. A standing sign-in code, stored hashed at `admincode:<email>`. It is not consumed, so the same
//      code works every time. This is what Sreenivasa and Pradeep use day to day.
//   2. A one-time emailed code at `otp:<email>`, consumed on use. Kept working so that when mail is
//      repaired the emailed path still functions, and so a standing code can be reset by email.
//
// A standing code is a password, so it is rate limited: ten wrong tries per address and address-plus-IP
// in fifteen minutes and this endpoint refuses, whatever the code. Without that, six digits is guessable.

const MAX_ATTEMPTS = 10;
const WINDOW_SECONDS = 15 * 60;

async function tooManyAttempts(env, email, ip) {
  for (const key of [`verify-fail:${email}`, `verify-fail:${email}:${ip}`]) {
    if (Number((await env.ADMIN.get(key)) || "0") >= MAX_ATTEMPTS) return true;
  }
  return false;
}

async function recordFailure(env, email, ip) {
  for (const key of [`verify-fail:${email}`, `verify-fail:${email}:${ip}`]) {
    const n = Number((await env.ADMIN.get(key)) || "0") + 1;
    await env.ADMIN.put(key, String(n), { expirationTtl: WINDOW_SECONDS });
  }
}

async function clearFailures(env, email, ip) {
  await env.ADMIN.delete(`verify-fail:${email}`);
  await env.ADMIN.delete(`verify-fail:${email}:${ip}`);
}

export async function onRequestPost(context) {
  const { env, request } = context;
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Send JSON" }, 400);
  }
  const email = normalizeEmail(body.email);
  const code = String(body.code || "").trim();
  if (!isAdminEmail(email) || code.length < 6 || code.length > 64) {
    return json({ error: "That code is not valid." }, 401);
  }
  if (!env.SESSION_SECRET) return json({ error: "Server is missing SESSION_SECRET" }, 500);

  const ip = request.headers.get("CF-Connecting-IP") || "local";
  if (await tooManyAttempts(env, email, ip)) {
    return json({ error: "Too many wrong codes. Wait fifteen minutes." }, 429);
  }

  const got = await sha256Hex(`${email}:${code}`);

  // The standing code first, because it is the one they use.
  const standing = await env.ADMIN.get(`admincode:${email}`);
  if (standing && standing === got) {
    await clearFailures(env, email, ip);
    const token = await makeSession(email, env.SESSION_SECRET);
    return json({ ok: true, email }, 200, { "Set-Cookie": cookieHeader(token, request) });
  }

  // Then a one-time emailed code, which is consumed.
  const once = await env.ADMIN.get(`otp:${email}`);
  if (once && once === got) {
    await env.ADMIN.delete(`otp:${email}`);
    await clearFailures(env, email, ip);
    const token = await makeSession(email, env.SESSION_SECRET);
    return json({ ok: true, email }, 200, { "Set-Cookie": cookieHeader(token, request) });
  }

  await recordFailure(env, email, ip);
  return json({ error: "That code is not valid." }, 401);
}
