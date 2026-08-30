import { json, requireAdmin } from "../lib/auth.js";

// Two shelves Sreenivasa fills himself from /admin: the Satakam he published, and
// any magazine issues he still has. Nothing here is ever invented — the public pages
// keep their honest "not here yet" line until a real file is uploaded.
export const SHELVES = ["satakam", "magazine"];

const ALLOWED = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_BYTES = 20 * 1024 * 1024;

async function listItems(env) {
  const raw = await env.ADMIN.get("library");
  return raw ? JSON.parse(raw) : [];
}

export async function onRequestGet(context) {
  const items = await listItems(context.env);
  return json({ items });
}

export async function onRequestPost(context) {
  const gate = await requireAdmin(context);
  if (gate.response) return gate.response;

  const form = await context.request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") return json({ error: "Choose a file" }, 400);
  if (!ALLOWED.has(file.type)) return json({ error: "Use a PDF, JPEG, PNG, or WebP" }, 400);
  if (file.size > MAX_BYTES) return json({ error: "File is over 20 MB" }, 400);

  const shelfRaw = String(form.get("shelf") || "").trim();
  if (!SHELVES.includes(shelfRaw)) return json({ error: "Choose the Satakam or the magazine" }, 400);

  const title = String(form.get("title") || "").trim().slice(0, 160);
  if (!title) return json({ error: "Give it a title" }, 400);
  const note = String(form.get("note") || "").trim().slice(0, 400);
  const when = String(form.get("when") || "").trim().slice(0, 60);

  const id = crypto.randomUUID();
  await context.env.ADMIN.put(`blob:${id}`, await file.arrayBuffer(), {
    metadata: { type: file.type },
  });
  const items = await listItems(context.env);
  const item = {
    id,
    shelf: shelfRaw,
    title,
    note,
    when,
    type: file.type,
    uploadedBy: gate.user.email,
    createdAt: new Date().toISOString(),
  };
  items.unshift(item);
  await context.env.ADMIN.put("library", JSON.stringify(items.slice(0, 200)));
  return json({ ok: true, item });
}
