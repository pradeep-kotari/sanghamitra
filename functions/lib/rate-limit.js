import { ensureDb } from "./db.js";

// A plain limit on the public forms: a few notes per connection in a short window. Enough to stop
// someone scripting hundreds of submissions into Sreenivasa's inbox; a family sending an enroll
// note and an RSVP in the same evening never gets near it.
export const FORM_LIMIT = 5;
export const FORM_WINDOW_MINUTES = 10;

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// The IP address is never stored. It is hashed with a random salt kept in the database and with
// the day, so the stored value cannot be turned back into an address or followed across days.
async function visitorKey(db, request) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  let row = await db.prepare("SELECT value FROM meta WHERE key = 'form_hits_salt'").first();
  if (!row) {
    const salt = crypto.randomUUID();
    await db.prepare("INSERT OR IGNORE INTO meta (key, value) VALUES ('form_hits_salt', ?)").bind(salt).run();
    row = await db.prepare("SELECT value FROM meta WHERE key = 'form_hits_salt'").first();
  }
  const day = new Date().toISOString().slice(0, 10);
  return (await sha256Hex(`${row.value}|${day}|${ip}`)).slice(0, 32);
}

/** Records this submission and says whether it is over the limit. */
export async function checkFormRate(env, request) {
  const db = await ensureDb(env);
  const who = await visitorKey(db, request);
  const now = new Date();
  const since = new Date(now.getTime() - FORM_WINDOW_MINUTES * 60000).toISOString();
  const dayAgo = new Date(now.getTime() - 86400000).toISOString();
  const recent = await db.prepare("SELECT COUNT(*) AS n FROM form_hits WHERE who = ? AND created_at > ?")
    .bind(who, since).first();
  if ((recent && recent.n) >= FORM_LIMIT) return { limited: true };
  await db.batch([
    db.prepare("INSERT INTO form_hits (who, created_at) VALUES (?, ?)").bind(who, now.toISOString()),
    db.prepare("DELETE FROM form_hits WHERE created_at < ?").bind(dayAgo),
  ]);
  return { limited: false };
}
