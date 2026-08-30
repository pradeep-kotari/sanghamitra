import { json, requireAdmin } from "../lib/auth.js";
import { listDecisions, saveAnswers } from "../lib/db.js";

export async function onRequestGet(context) {
  const gate = await requireAdmin(context);
  if (gate.response) return gate.response;
  try {
    return json({ sections: await listDecisions(context.env) });
  } catch (err) {
    return json({ error: err.message || "Could not load decisions" }, err.status || 500);
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
  const answers = body.answers && typeof body.answers === "object" ? body.answers : body;
  try {
    const sections = await saveAnswers(context.env, answers, gate.user);
    return json({ ok: true, sections });
  } catch (err) {
    return json({ error: err.message || "Could not save answers" }, err.status || 500);
  }
}
