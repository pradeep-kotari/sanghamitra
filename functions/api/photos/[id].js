import { json, requireAdmin } from "../../lib/auth.js";

function listPhotos(raw) {
  return raw ? JSON.parse(raw) : [];
}

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
  const raw = await context.env.ADMIN.get("photos");
  const photos = listPhotos(raw);
  const item = photos.find((p) => p.id === id);
  if (!item) return json({ error: "Photo not found" }, 404);
  if (body.caption != null) item.caption = String(body.caption).slice(0, 200);
  if (body.place != null) {
    const place = String(body.place).trim();
    item.place = ["gallery", "events", "both"].includes(place) ? place : "gallery";
  }
  if (body.eventTitle != null) item.eventTitle = String(body.eventTitle).trim().slice(0, 120);
  if (body.eventId != null) item.eventId = String(body.eventId).trim().slice(0, 80);
  await context.env.ADMIN.put("photos", JSON.stringify(photos));
  return json({ ok: true, photo: item });
}

export async function onRequestDelete(context) {
  const gate = await requireAdmin(context);
  if (gate.response) return gate.response;
  const id = context.params.id;
  const raw = await context.env.ADMIN.get("photos");
  const photos = raw ? JSON.parse(raw) : [];
  await context.env.ADMIN.put("photos", JSON.stringify(photos.filter((p) => p.id !== id)));
  await context.env.ADMIN.delete(`blob:${id}`);
  return json({ ok: true });
}
