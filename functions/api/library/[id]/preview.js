import { json, requireAdmin } from "../../../lib/auth.js";
import { getMedia, putMedia } from "../../../lib/media.js";

const MAX_PREVIEW_BYTES = 2 * 1024 * 1024;

export async function onRequestPost(context) {
  const gate = await requireAdmin(context);
  if (gate.response) return gate.response;

  const id = context.params.id;
  const item = await getMedia(context.env, "library", id);
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
  await putMedia(context.env, "library", item);
  return json({ ok: true, item });
}
