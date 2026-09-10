import { json, requireAdmin } from "../lib/auth.js";
import { normalizeActivity } from "../lib/activities.js";
import { isOwnerEmail, notifyBuilderOwnerUpload } from "../lib/email.js";
import { listMedia, putMedia } from "../lib/media.js";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 8 * 1024 * 1024;

export async function onRequestGet(context) {
  try {
    const photos = await listMedia(context.env, "photos");
    return json({ photos });
  } catch (err) {
    return json({ error: err.message || "Could not load photos", photos: [] }, err.status || 500);
  }
}

export async function onRequestPost(context) {
  const gate = await requireAdmin(context);
  if (gate.response) return gate.response;

  const form = await context.request.formData();
  const file = form.get("file");
  const caption = String(form.get("caption") || "").slice(0, 200);
  if (!file || typeof file === "string") return json({ error: "Choose a photo" }, 400);
  if (!ALLOWED.has(file.type)) return json({ error: "Use JPEG, PNG, WebP, or GIF" }, 400);
  if (file.size > MAX_BYTES) return json({ error: "Photo is over 8 MB" }, 400);

  const placeRaw = String(form.get("place") || "gallery").trim();
  const place = ["gallery", "events", "both"].includes(placeRaw) ? placeRaw : "gallery";
  const eventTitle = String(form.get("eventTitle") || "").trim().slice(0, 120);
  const eventId = String(form.get("eventId") || "").trim().slice(0, 80);
  const activity = normalizeActivity(form.get("activity"));

  const id = crypto.randomUUID();
  await context.env.ADMIN.put(`blob:${id}`, await file.arrayBuffer(), {
    metadata: { type: file.type },
  });
  const item = {
    id,
    caption,
    place,
    eventTitle,
    eventId,
    activity,
    type: file.type,
    uploadedBy: gate.user.email,
    createdAt: new Date().toISOString(),
  };
  await putMedia(context.env, "photos", item);
  if (isOwnerEmail(gate.user.email)) {
    context.waitUntil(
      notifyBuilderOwnerUpload(context.env, {
        authorName: gate.user.name,
        kind: "a photo",
        title: caption || "Gallery photo",
        detail: eventTitle ? `Event: ${eventTitle}` : "",
      }).catch(() => null),
    );
  }
  return json({ ok: true, photo: item });
}
