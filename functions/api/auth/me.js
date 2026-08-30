import { json, readSession } from "../../lib/auth.js";

export async function onRequestGet(context) {
  const user = await readSession(context.request, context.env);
  if (!user) return json({ signedIn: false }, 401);
  return json({ signedIn: true, ...user });
}
