import { json, requireAdmin } from "../lib/auth.js";
import { addAnswer, listAnswers } from "../lib/conversation.js";
import { isOwnerEmail, notifyBuilderOwnerNote } from "../lib/email.js";

export async function onRequestGet(context) {
  const gate = await requireAdmin(context);
  if (gate.response) return gate.response;
  try {
    const data = await listAnswers(context.env);
    return json(data);
  } catch (err) {
    return json({ error: err.message || "Could not load answers" }, err.status || 500);
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
  const kind = String(body.kind || "answer").trim();
  if (kind === "question") {
    return json({ error: "Questions go by email, not on the website. Use Email Sreenivasa." }, 400);
  }
  if (kind !== "answer" && kind !== "thought") {
    return json({ error: "This page only saves an answer." }, 400);
  }
  try {
    const item = await addAnswer(context.env, { body: body.body, user: gate.user });
    if (isOwnerEmail(gate.user.email)) {
      context.waitUntil(
        notifyBuilderOwnerNote(context.env, {
          authorName: gate.user.name,
          body: item.body,
        }).catch(() => null),
      );
    }
    const data = await listAnswers(context.env);
    return json({ ok: true, item, ...data });
  } catch (err) {
    return json({ error: err.message || "Could not save" }, err.status || 500);
  }
}
