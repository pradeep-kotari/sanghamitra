import { ensureDb } from "./db.js";

const KEY = "build_picks";

export async function readBuildPicks(env) {
  const db = await ensureDb(env);
  const row = await db.prepare(
    "SELECT value, by_name, by_email, updated_at FROM site_content WHERE key = ?",
  ).bind(KEY).first();
  if (!row) {
    return { picks: [], note: "", updatedAt: null, updatedBy: null };
  }
  let parsed = { picks: [], note: "" };
  try {
    parsed = JSON.parse(row.value);
  } catch {
    parsed = { picks: [], note: "" };
  }
  const picks = Array.isArray(parsed.picks) ? parsed.picks.map(String) : [];
  return {
    picks,
    note: String(parsed.note || "").slice(0, 2000),
    updatedAt: row.updated_at || null,
    updatedBy: row.by_name || null,
    updatedByEmail: row.by_email || null,
  };
}

export async function writeBuildPicks(env, { picks, note }, user) {
  const db = await ensureDb(env);
  const valid = new Set(
    (await import("./build-catalog.js")).BUILD_ITEMS.map((i) => i.id),
  );
  const cleanPicks = [...new Set((picks || []).map(String))].filter((id) => valid.has(id));
  const payload = {
    picks: cleanPicks,
    note: String(note || "").trim().slice(0, 2000),
  };
  const now = new Date().toISOString();
  await db.prepare(
    `INSERT INTO site_content (key, value, by_email, by_name, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, by_email = excluded.by_email, by_name = excluded.by_name, updated_at = excluded.updated_at`,
  ).bind(KEY, JSON.stringify(payload), user.email, user.name, now).run();
  return { ...payload, updatedAt: now, updatedBy: user.name };
}
