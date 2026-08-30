import { json, requireAdmin } from "../../lib/auth.js";
import { saveAnswers } from "../../lib/db.js";

export async function onRequestPost(context) {
  const gate = await requireAdmin(context);
  if (gate.response) return gate.response;
  const id = context.params.id;
  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Send JSON" }, 400);
  }
  const value = body.value;
  if (value == null || value === "") return json({ error: "Write an answer" }, 400);
  try {
    const sections = await saveAnswers(context.env, { [id]: value }, gate.user);
    return json({ ok: true, sections });
  } catch (err) {
    return json({ error: err.message || "Could not save answer" }, err.status || 500);
  }
}
