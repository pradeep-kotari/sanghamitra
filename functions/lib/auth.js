export const ADMINS = {
  "ainapura@yahoo.com": { name: "Sreenivasa Ainapurapu" },
  "pradeep.kotari@gmail.com": { name: "Pradeep Kotari" },
};

export const ADMIN_EMAILS = Object.keys(ADMINS);

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}

export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function isAdminEmail(email) {
  return Object.prototype.hasOwnProperty.call(ADMINS, normalizeEmail(email));
}

function b64url(bytes) {
  let bin = "";
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i += 1) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s) {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

export async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacSign(secret, payload) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return b64url(sig);
}

export async function makeSession(email, secret) {
  const payload = b64url(new TextEncoder().encode(JSON.stringify({
    email: normalizeEmail(email),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  })));
  const sig = await hmacSign(secret, payload);
  return `${payload}.${sig}`;
}

export function cookieHeader(token, request) {
  const secure = new URL(request.url).protocol === "https:";
  const parts = [
    `sm_session=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${7 * 24 * 60 * 60}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export async function readSession(request, env) {
  const raw = request.headers.get("Cookie") || "";
  const match = raw.match(/(?:^|;\s*)sm_session=([^;]+)/);
  if (!match || !env.SESSION_SECRET) return null;
  const [payload, sig] = match[1].split(".");
  if (!payload || !sig) return null;
  const expected = await hmacSign(env.SESSION_SECRET, payload);
  if (expected.length !== sig.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  if (diff !== 0) return null;
  try {
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    const email = normalizeEmail(data.email);
    if (!data.exp || data.exp < Date.now() || !isAdminEmail(email)) return null;
    return { email, name: ADMINS[email].name };
  } catch {
    return null;
  }
}

export async function requireAdmin(context) {
  const user = await readSession(context.request, context.env);
  if (!user) return { user: null, response: json({ error: "Sign in required" }, 401) };
  return { user, response: null };
}
