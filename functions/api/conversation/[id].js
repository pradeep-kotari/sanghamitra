import { json, requireAdmin } from "../../lib/auth.js";
import { deleteAnswer, updateAnswer } from "../../lib/conversation.js";

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
    const item = await updateAnswer(context.env, context.params.id, { body: body.body });
    return json({ ok: true, item });
  } catch (err) {
    return json({ error: err.message || "Could not update" }, err.status || 500);
  }
}

export async function onRequestDelete(context) {
  const gate = await requireAdmin(context);
  if (gate.response) return gate.response;
  try {
    await deleteAnswer(context.env, context.params.id);
    return json({ ok: true });
  } catch (err) {
    return json({ error: err.message || "Could not delete" }, err.status || 500);
  }
}
