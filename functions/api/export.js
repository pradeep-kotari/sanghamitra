import { json, requireAdmin } from "../lib/auth.js";
import { ensureDb, listDecisions, listQueries } from "../lib/db.js";
import { listAnswers } from "../lib/conversation.js";
import { listMedia } from "../lib/media.js";
import { readOverlay } from "../lib/site-content.js";

// Everything the admin console holds, in one answer, so the browser can pack it into a zip that
// Sreenivasa keeps on his own disk. The files themselves are fetched by the browser from /media;
// this only says what exists. POST records that a full copy was taken, so the console can say how
// long ago the last one was.

const LAST_BACKUP_KEY = "last_backup";

async function readLastBackup(db) {
  const row = await db.prepare("SELECT value FROM meta WHERE key = ?").bind(LAST_BACKUP_KEY).first();
  if (!row) return null;
  try {
    return JSON.parse(row.value);
  } catch {
    return null;
  }
}

async function listKvJson(env, prefix) {
  const out = [];
  let cursor;
  do {
    const page = await env.ADMIN.list({ prefix, cursor });
    for (const key of page.keys) {
      const raw = await env.ADMIN.get(key.name);
      if (!raw) continue;
      try {
        out.push({ key: key.name, value: JSON.parse(raw) });
      } catch {
        out.push({ key: key.name, value: raw });
      }
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return out;
}

export async function onRequestGet(context) {
  const gate = await requireAdmin(context);
  if (gate.response) return gate.response;
  const { env } = context;
  try {
    const db = await ensureDb(env);
    const lastBackup = await readLastBackup(db);
    if (new URL(context.request.url).searchParams.has("status")) return json({ lastBackup });

    const [photos, library, site, messages, decisions, notes, telugu] = await Promise.all([
      listMedia(env, "photos"),
      listMedia(env, "library"),
      readOverlay(env),
      listQueries(env),
      listDecisions(env),
      listAnswers(env),
      listKvJson(env, "telugu:"),
    ]);
    let question = null;
    try {
      question = JSON.parse((await env.ADMIN.get("quiz:current")) || "null");
    } catch {
      question = null;
    }
    return json({
      generatedAt: new Date().toISOString(),
      lastBackup,
      photos,
      library,
      site,
      messages,
      decisions,
      notes,
      telugu,
      question,
    });
  } catch (err) {
    return json({ error: err.message || "Could not gather the backup" }, err.status || 500);
  }
}

export async function onRequestPost(context) {
  const gate = await requireAdmin(context);
  if (gate.response) return gate.response;
  try {
    const db = await ensureDb(context.env);
    const rec = { at: new Date().toISOString(), by: gate.user.name };
    await db.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)")
      .bind(LAST_BACKUP_KEY, JSON.stringify(rec)).run();
    return json({ ok: true, lastBackup: rec });
  } catch (err) {
    return json({ error: err.message || "Could not record the backup" }, err.status || 500);
  }
}
