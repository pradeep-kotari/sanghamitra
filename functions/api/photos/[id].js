import { json, requireAdmin } from "../../lib/auth.js";
import { normalizeActivity } from "../../lib/activities.js";
import { deleteMedia, getMedia, putMedia } from "../../lib/media.js";

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
  const item = await getMedia(context.env, "photos", id);
  if (!item) return json({ error: "Photo not found" }, 404);
  if (body.caption != null) item.caption = String(body.caption).slice(0, 200);
  if (body.place != null) {
    const place = String(body.place).trim();
    item.place = ["gallery", "events", "both"].includes(place) ? place : "gallery";
  }
  if (body.eventTitle != null) item.eventTitle = String(body.eventTitle).trim().slice(0, 120);
  if (body.eventId != null) item.eventId = String(body.eventId).trim().slice(0, 80);
  if (body.activity != null) item.activity = normalizeActivity(body.activity);
  await putMedia(context.env, "photos", item);
  return json({ ok: true, photo: item });
}

export async function onRequestDelete(context) {
  const gate = await requireAdmin(context);
  if (gate.response) return gate.response;
  const id = context.params.id;
  await deleteMedia(context.env, "photos", id);
  await context.env.ADMIN.delete(`blob:${id}`);
  return json({ ok: true });
}
