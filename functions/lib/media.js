import { ensureDb } from "./db.js";

// Photos and library items are indexed as one D1 row each. They used to live as a single JSON
// list in KV, and two changes close together could undo each other: each read the whole list,
// changed it, and wrote it back, so the slower one restored what the faster one had removed.
// A row per item makes every upload, edit and delete its own write. The files themselves stay
// in KV under `blob:<id>` and `preview:<id>`; only the index moved.

export const MEDIA_STORES = ["photos", "library"];

export async function listMedia(env, store) {
  const db = await ensureDb(env);
  const { results } = await db.prepare(
    "SELECT doc FROM media_items WHERE store = ? ORDER BY created_at DESC, rowid DESC",
  ).bind(store).all();
  return (results || []).map((r) => JSON.parse(r.doc));
}

export async function getMedia(env, store, id) {
  const db = await ensureDb(env);
  const row = await db.prepare("SELECT doc FROM media_items WHERE store = ? AND id = ?").bind(store, id).first();
  return row ? JSON.parse(row.doc) : null;
}

export async function putMedia(env, store, doc) {
  const db = await ensureDb(env);
  const createdAt = String(doc.createdAt || new Date().toISOString());
  await db.prepare(
    `INSERT INTO media_items (id, store, created_at, doc) VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET doc = excluded.doc`,
  ).bind(String(doc.id), store, createdAt, JSON.stringify(doc)).run();
  return doc;
}

export async function deleteMedia(env, store, id) {
  const db = await ensureDb(env);
  await db.prepare("DELETE FROM media_items WHERE store = ? AND id = ?").bind(store, id).run();
}
