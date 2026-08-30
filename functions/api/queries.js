import { json, requireAdmin } from "../lib/auth.js";
import { notifyAdminsOfQuery } from "../lib/email.js";
import { insertQuery, listQueries } from "../lib/db.js";

export async function onRequestGet(context) {
  const gate = await requireAdmin(context);
  if (gate.response) return gate.response;
  try {
    return json({ queries: await listQueries(context.env) });
  } catch (err) {
    return json({ error: err.message || "Could not load questions" }, err.status || 500);
  }
}

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Send JSON" }, 400);
  }
  const KINDS = new Set(["enroll", "donate", "volunteer", "talk", "poetry", "contact", "rsvp"]);
  const name = String(body.name || "").trim().slice(0, 80);
  const email = String(body.email || "").trim().slice(0, 120);
  const phone = String(body.phone || "").trim().slice(0, 40);
  const kind = KINDS.has(String(body.kind || "").trim()) ? String(body.kind).trim() : "contact";
  const message = String(body.message || "").trim().slice(0, 4000);
  if (!name || !message) return json({ error: "Name and a note are required" }, 400);

  const item = {
    id: crypto.randomUUID(),
    name,
    email,
    phone,
    kind,
    message,
    createdAt: new Date().toISOString(),
    replies: [],
  };
  try {
    await insertQuery(context.env, item);
  } catch (err) {
    return json({ error: err.message || "Could not save" }, err.status || 500);
  }
  context.waitUntil(notifyAdminsOfQuery(context.env, item).catch(() => null));
  return json({ ok: true, id: item.id });
}
