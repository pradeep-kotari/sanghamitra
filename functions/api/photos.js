import { json, requireAdmin } from "../lib/auth.js";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 8 * 1024 * 1024;

async function listPhotos(env) {
  const raw = await env.ADMIN.get("photos");
  return raw ? JSON.parse(raw) : [];
}

export async function onRequestGet(context) {
  const photos = await listPhotos(context.env);
  return json({ photos });
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

  const id = crypto.randomUUID();
  await context.env.ADMIN.put(`blob:${id}`, await file.arrayBuffer(), {
    metadata: { type: file.type },
  });
  const photos = await listPhotos(context.env);
  const item = {
    id,
    caption,
    place,
    eventTitle,
    eventId,
    type: file.type,
    uploadedBy: gate.user.email,
    createdAt: new Date().toISOString(),
  };
  photos.unshift(item);
  await context.env.ADMIN.put("photos", JSON.stringify(photos.slice(0, 200)));
  return json({ ok: true, photo: item });
}
