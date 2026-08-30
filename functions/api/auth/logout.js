import { json } from "../../lib/auth.js";

export async function onRequestPost(context) {
  const secure = new URL(context.request.url).protocol === "https:";
  const cookie = [
    "sm_session=",
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (secure) cookie.push("Secure");
  return json({ ok: true }, 200, { "Set-Cookie": cookie.join("; ") });
}
