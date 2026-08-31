import { json, requireAdmin } from "../../../lib/auth.js";

const MAX_PREVIEW_BYTES = 2 * 1024 * 1024;

export async function onRequestPost(context) {
  const gate = await requireAdmin(context);
  if (gate.response) return gate.response;

  const id = context.params.id;
  const raw = await context.env.ADMIN.get("library");
  const items = raw ? JSON.parse(raw) : [];
  const item = items.find((i) => i.id === id);
  if (!item) return json({ error: "Not found" }, 404);

  const form = await context.request.formData();
  const preview = form.get("preview");
  if (!preview || typeof preview === "string") return json({ error: "Choose a preview image" }, 400);
  if (!preview.type.startsWith("image/")) return json({ error: "Preview must be an image" }, 400);
  if (preview.size > MAX_PREVIEW_BYTES) return json({ error: "Preview is over 2 MB" }, 400);

  await context.env.ADMIN.put(`preview:${id}`, await preview.arrayBuffer(), {
    metadata: { type: preview.type },
  });
  item.hasPreview = true;
  await context.env.ADMIN.put("library", JSON.stringify(items));
  return json({ ok: true, item });
}
