import { json, requireAdmin } from "../lib/auth.js";
import { isOwnerEmail, notifyBuilderOwnerSiteSave } from "../lib/email.js";
import { readOverlay, writeOverlay } from "../lib/site-content.js";

export async function onRequestGet(context) {
  try {
    const data = await readOverlay(context.env);
    return json(data);
  } catch (err) {
    return json({ error: err.message || "Could not load site edits", overlay: {} }, err.status || 500);
  }
}

export async function onRequestPost(context) {
  const gate = await requireAdmin(context);
  if (gate.response) return gate.response;
  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Send JSON" }, 400);
  }
  try {
    const data = await writeOverlay(context.env, body.overlay || body, gate.user);
    const notifyLabel = String(body.notifyLabel || "the public site").trim().slice(0, 120);
    if (isOwnerEmail(gate.user.email)) {
      context.waitUntil(
        notifyBuilderOwnerSiteSave(context.env, {
          authorName: gate.user.name,
          label: notifyLabel,
        }).catch(() => null),
      );
    }
    return json({ ok: true, ...data });
  } catch (err) {
    return json({ error: err.message || "Could not save" }, err.status || 500);
  }
}
