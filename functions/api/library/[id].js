import { json, requireAdmin } from "../../lib/auth.js";
import { formatIssueWhen, normalizeMagazineIssue } from "../../lib/library.js";

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
  const raw = await context.env.ADMIN.get("library");
  const items = raw ? JSON.parse(raw) : [];
  const item = items.find((i) => i.id === id);
  if (!item) return json({ error: "Not found" }, 404);
  if (body.title != null) item.title = String(body.title).trim().slice(0, 160);
  if (body.note != null) item.note = String(body.note).trim().slice(0, 400);

  if (item.shelf === "magazine") {
    if (body.year != null) item.year = Number(body.year) || null;
    if (body.month != null) item.month = Number(body.month) || null;
    if (body.when != null && (body.year == null || body.month == null)) {
      item.when = String(body.when).trim().slice(0, 60);
    }
    const normalized = normalizeMagazineIssue(item);
    item.year = normalized.year;
    item.month = normalized.month;
    item.when = formatIssueWhen(item.year, item.month) || normalized.when;
  } else if (body.when != null) {
    item.when = String(body.when).trim().slice(0, 60);
  }

  await context.env.ADMIN.put("library", JSON.stringify(items));
  return json({ ok: true, item: normalizeMagazineIssue(item) });
}

export async function onRequestDelete(context) {
  const gate = await requireAdmin(context);
  if (gate.response) return gate.response;
  const id = context.params.id;
  const raw = await context.env.ADMIN.get("library");
  const items = raw ? JSON.parse(raw) : [];
  await context.env.ADMIN.put("library", JSON.stringify(items.filter((i) => i.id !== id)));
  await context.env.ADMIN.delete(`blob:${id}`);
  await context.env.ADMIN.delete(`preview:${id}`);
  return json({ ok: true });
}
