import { ensureDb } from "./db.js";

function rowToMessage(row) {
  return {
    id: row.id,
    kind: row.kind,
    parentId: row.parent_id || null,
    authorEmail: row.author_email,
    authorName: row.author_name,
    body: row.body,
    emailedAt: row.emailed_at || null,
    createdAt: row.created_at,
  };
}

/** Hide leftover builder questions so they never get emailed or shown. */
export async function silenceStoredQuestions(env) {
  const db = await ensureDb(env);
  const now = new Date().toISOString();
  await db.prepare(
    "UPDATE conversation SET emailed_at = ? WHERE kind = 'question' AND emailed_at IS NULL",
  ).bind(now).run();
}

export async function listAnswers(env) {
  const db = await ensureDb(env);
  await silenceStoredQuestions(env);
  const { results } = await db.prepare(
    `SELECT id, kind, parent_id, author_email, author_name, body, emailed_at, created_at
     FROM conversation
     WHERE kind IN ('answer', 'thought')
     ORDER BY created_at DESC`,
  ).all();
  return {
    answers: (results || []).map(rowToMessage),
  };
}

export async function addAnswer(env, { body, user }) {
  const db = await ensureDb(env);
  const text = String(body || "").trim().slice(0, 8000);
  if (!text) {
    const err = new Error("Write something first");
    err.status = 400;
    throw err;
  }
  const item = {
    id: crypto.randomUUID(),
    kind: "answer",
    parentId: null,
    authorEmail: user.email,
    authorName: user.name,
    body: text,
    emailedAt: null,
    createdAt: new Date().toISOString(),
  };
  await db.prepare(
    `INSERT INTO conversation (id, kind, parent_id, author_email, author_name, body, emailed_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NULL, ?)`,
  ).bind(item.id, item.kind, item.parentId, item.authorEmail, item.authorName, item.body, item.createdAt).run();
  return item;
}
