import { json, requireAdmin } from "../lib/auth.js";
import { emailOwnerAsk } from "../lib/email.js";
import { BUILDER_EMAIL, PRIORITY_ASK } from "../lib/owner-ask.js";

export async function onRequestPost(context) {
  const gate = await requireAdmin(context);
  if (gate.response) return gate.response;
  if (gate.user.email !== BUILDER_EMAIL) {
    return json({ error: "Only the builder sends question emails." }, 403);
  }
  let body;
  try {
    body = await context.request.json();
  } catch {
    body = {};
  }
  const questions = String(body.body || PRIORITY_ASK).trim();
  if (!questions) return json({ error: "Write the questions to email him." }, 400);
  const mail = await emailOwnerAsk(context.env, questions);
  if (!mail.ok) return json({ error: "Email did not send. Try again in a minute." }, 502);
  return json({ ok: true, mail, to: "ainapura@yahoo.com" });
}
