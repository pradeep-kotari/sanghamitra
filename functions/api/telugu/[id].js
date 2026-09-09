import { json, requireAdmin, readSession } from "../../lib/auth.js";

// Recovered Telugu articles from the old magazine, and Sreenivasa's proofreading of them.
//
// The machine-read DRAFT lives in the repo (site/data/telugu/<id>.json). What he types and whether he
// has approved it lives here, one KV key per article (telugu:<id>) so two saves can never clobber each
// other the way a shared list would.
//
// The one rule this file exists to enforce: a public reader NEVER receives text he has not approved.
// GET without an admin session returns the text only when status is "approved". Everything else
// about the record — that it exists, that it is being proofread — is fine to say out loud.

const ID = /^[a-z0-9][a-z0-9_-]{1,80}$/;
const MAX_TEXT = 60_000;

async function load(env, id) {
  const raw = await env.ADMIN.get(`telugu:${id}`);
  return raw ? JSON.parse(raw) : null;
}

export async function onRequestGet(context) {
  const id = String(context.params.id || "");
  if (!ID.test(id)) return json({ error: "Unknown article" }, 404);
  const rec = await load(context.env, id);
  const admin = await readSession(context.request, context.env);
  if (admin) {
    return json({ id, status: rec?.status || "draft", text: rec?.text ?? null, updatedAt: rec?.updatedAt || null,
                  updatedBy: rec?.updatedBy || null, approvedAt: rec?.approvedAt || null }, 200, { "cache-control": "no-store" });
  }
  if (rec && rec.status === "approved" && rec.text) {
    return json({ id, status: "approved", text: rec.text, approvedAt: rec.approvedAt || null }, 200, { "cache-control": "no-store" });
  }
  // Not approved: say so, send nothing he has not signed off.
  return json({ id, status: rec ? rec.status : "draft", text: null }, 200, { "cache-control": "no-store" });
}

export async function onRequestPost(context) {
  const gate = await requireAdmin(context);
  if (gate.response) return gate.response;
  const id = String(context.params.id || "");
  if (!ID.test(id)) return json({ error: "Unknown article" }, 404);

  let body;
  try { body = await context.request.json(); } catch { return json({ error: "Send JSON" }, 400); }
  const action = String(body.action || "save");
  const text = typeof body.text === "string" ? body.text.replace(/\r\n/g, "\n").trim() : null;
  if (text !== null && text.length > MAX_TEXT) return json({ error: "That is longer than one article can be" }, 400);

  const prev = (await load(context.env, id)) || {};
  const now = new Date().toISOString();
  const rec = { ...prev, id, updatedAt: now, updatedBy: gate.user.email };

  if (action === "save") {
    if (text === null) return json({ error: "Nothing to save" }, 400);
    rec.text = text;
    if (rec.status !== "approved") rec.status = "draft";
    else rec.status = "edited"; // an approved text that changed is no longer the approved text
  } else if (action === "approve") {
    if (text !== null) rec.text = text;
    if (!rec.text) return json({ error: "There is no text to approve" }, 400);
    rec.status = "approved"; rec.approvedAt = now; rec.approvedBy = gate.user.email;
  } else if (action === "unapprove") {
    rec.status = "draft"; delete rec.approvedAt; delete rec.approvedBy;
  } else {
    return json({ error: "Unknown action" }, 400);
  }
  await context.env.ADMIN.put(`telugu:${id}`, JSON.stringify(rec));
  return json({ ok: true, id, status: rec.status, approvedAt: rec.approvedAt || null, updatedAt: rec.updatedAt });
}
