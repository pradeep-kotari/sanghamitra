import { json, requireAdmin } from "../../lib/auth.js";
import { sendMail } from "../../lib/email.js";
import { addReply } from "../../lib/db.js";

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
  const text = String(body.reply || "").trim().slice(0, 4000);
  if (!text) return json({ error: "Write a reply" }, 400);

  let item;
  try {
    item = await addReply(context.env, id, {
      id: crypto.randomUUID(),
      by: gate.user.email,
      name: gate.user.name,
      text,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    return json({ error: err.message || "Could not save reply" }, err.status || 500);
  }
  if (!item) return json({ error: "Not found" }, 404);

  if (item.email) {
    context.waitUntil(sendMail(context.env, {
      to: item.email,
      subject: "A reply from Sanghamitra",
      text: `Namaste ${item.name},\n\n${text}\n\n— ${gate.user.name}\nhttps://sanghamitra.pages.dev/`,
    }).catch(() => null));
  }

  return json({ ok: true, query: item });
}
