import { json, requireAdmin } from "../lib/auth.js";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
const MAX_BYTES = 12 * 1024 * 1024;

export async function onRequestPost(context) {
  const gate = await requireAdmin(context);
  if (gate.response) return gate.response;

  const form = await context.request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") return json({ error: "Choose a flyer or PDF" }, 400);
  if (!ALLOWED.has(file.type)) return json({ error: "Use JPEG, PNG, WebP, or PDF" }, 400);
  if (file.size > MAX_BYTES) return json({ error: "File is over 12 MB" }, 400);

  const id = crypto.randomUUID();
  await context.env.ADMIN.put(`blob:${id}`, await file.arrayBuffer(), {
    metadata: { type: file.type },
  });
  const url = `/media/${id}`;
  const kind = file.type === "application/pdf" ? "pdf" : "flyer";
  return json({ ok: true, id, url, kind, type: file.type });
}
