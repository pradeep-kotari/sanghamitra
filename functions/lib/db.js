import { flattenDecisions } from "./catalog.js";

export function requireDb(env) {
  if (!env.DB) {
    const err = new Error("Cloudflare D1 is not bound. Deploy with wrangler.jsonc so DB is available.");
    err.status = 503;
    throw err;
  }
  return env.DB;
}

export async function ensureDb(env) {
  const db = requireDb(env);
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS queries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      kind TEXT NOT NULL DEFAULT 'contact',
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS query_replies (
      id TEXT PRIMARY KEY,
      query_id TEXT NOT NULL,
      by_email TEXT NOT NULL,
      by_name TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY,
      section INTEGER NOT NULL,
      section_title TEXT NOT NULL,
      title TEXT NOT NULL,
      why TEXT NOT NULL DEFAULT '',
      field_type TEXT NOT NULL,
      options_json TEXT NOT NULL DEFAULT '[]',
      sort_order INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS decision_answers (
      id TEXT PRIMARY KEY,
      decision_id TEXT NOT NULL,
      value TEXT NOT NULL,
      by_email TEXT NOT NULL,
      by_name TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS conversation (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      parent_id TEXT,
      author_email TEXT NOT NULL,
      author_name TEXT NOT NULL,
      body TEXT NOT NULL,
      emailed_at TEXT,
      created_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      by_email TEXT NOT NULL DEFAULT '',
      by_name TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_queries_created ON queries(created_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_query_replies_query ON query_replies(query_id, created_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_decision_answers_decision ON decision_answers(decision_id, created_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_conversation_created ON conversation(created_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_conversation_parent ON conversation(parent_id, created_at)"),
  ]);

  const now = new Date().toISOString();
  const seed = flattenDecisions().map((row) =>
    db.prepare(`INSERT OR IGNORE INTO decisions
      (id, section, section_title, title, why, field_type, options_json, sort_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
      row.id, row.section, row.section_title, row.title, row.why,
      row.field_type, row.options_json, row.sort_order, now,
    ));
  if (seed.length) await db.batch(seed);

  await importKvQueries(env, db);
  return db;
}

async function importKvQueries(env, db) {
  if (!env.ADMIN) return;
  const flag = await db.prepare("SELECT value FROM meta WHERE key = ?").bind("kv_queries_imported").first();
  if (flag) return;
  let items = [];
  try {
    const raw = await env.ADMIN.get("queries");
    items = raw ? JSON.parse(raw) : [];
  } catch {
    items = [];
  }
  const stmts = [
    db.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)").bind("kv_queries_imported", new Date().toISOString()),
  ];
  for (const item of items) {
    if (!item || !item.id) continue;
    stmts.push(db.prepare(
      `INSERT OR IGNORE INTO queries (id, name, email, phone, kind, message, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      item.id,
      String(item.name || "Unknown"),
      String(item.email || ""),
      String(item.phone || ""),
      String(item.kind || "contact"),
      String(item.message || ""),
      String(item.createdAt || new Date().toISOString()),
    ));
    for (const reply of item.replies || []) {
      stmts.push(db.prepare(
        `INSERT OR IGNORE INTO query_replies (id, query_id, by_email, by_name, text, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      ).bind(
        reply.id || crypto.randomUUID(),
        item.id,
        String(reply.by || ""),
        String(reply.name || reply.by || "Admin"),
        String(reply.text || ""),
        String(reply.createdAt || new Date().toISOString()),
      ));
    }
  }
  await db.batch(stmts);
}

export async function listQueries(env) {
  const db = await ensureDb(env);
  const { results: rows } = await db.prepare(
    "SELECT id, name, email, phone, kind, message, created_at FROM queries ORDER BY created_at DESC",
  ).all();
  const { results: replies } = await db.prepare(
    "SELECT id, query_id, by_email, by_name, text, created_at FROM query_replies ORDER BY created_at ASC",
  ).all();
  const byQuery = new Map();
  for (const r of replies || []) {
    const list = byQuery.get(r.query_id) || [];
    list.push({
      id: r.id,
      by: r.by_email,
      name: r.by_name,
      text: r.text,
      createdAt: r.created_at,
    });
    byQuery.set(r.query_id, list);
  }
  return (rows || []).map((q) => ({
    id: q.id,
    name: q.name,
    email: q.email,
    phone: q.phone,
    kind: q.kind,
    message: q.message,
    createdAt: q.created_at,
    replies: byQuery.get(q.id) || [],
  }));
}

export async function insertQuery(env, item) {
  const db = await ensureDb(env);
  await db.prepare(
    `INSERT INTO queries (id, name, email, phone, kind, message, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).bind(item.id, item.name, item.email || "", item.phone || "", item.kind, item.message, item.createdAt).run();
}

export async function addReply(env, queryId, reply) {
  const db = await ensureDb(env);
  const query = await db.prepare("SELECT id, name, email FROM queries WHERE id = ?").bind(queryId).first();
  if (!query) return null;
  await db.prepare(
    `INSERT INTO query_replies (id, query_id, by_email, by_name, text, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).bind(reply.id, queryId, reply.by, reply.name, reply.text, reply.createdAt).run();
  const queries = await listQueries(env);
  return queries.find((q) => q.id === queryId) || null;
}

export async function listDecisions(env) {
  const db = await ensureDb(env);
  const { results: fields } = await db.prepare(
    "SELECT id, section, section_title, title, why, field_type, options_json, sort_order FROM decisions ORDER BY sort_order ASC",
  ).all();
  const { results: answers } = await db.prepare(
    "SELECT id, decision_id, value, by_email, by_name, created_at FROM decision_answers ORDER BY created_at ASC",
  ).all();
  const history = new Map();
  for (const a of answers || []) {
    const list = history.get(a.decision_id) || [];
    list.push({
      id: a.id,
      value: parseValue(a.value),
      by: a.by_email,
      name: a.by_name,
      createdAt: a.created_at,
    });
    history.set(a.decision_id, list);
  }
  const sections = [];
  const bySection = new Map();
  for (const field of fields || []) {
    const hist = history.get(field.id) || [];
    const item = {
      id: field.id,
      title: field.title,
      why: field.why,
      type: field.field_type,
      options: JSON.parse(field.options_json || "[]"),
      latest: hist.length ? hist[hist.length - 1] : null,
      history: hist,
    };
    if (!bySection.has(field.section)) {
      const sec = { section: field.section, title: field.section_title, why: field.why, fields: [] };
      bySection.set(field.section, sec);
      sections.push(sec);
    }
    bySection.get(field.section).fields.push(item);
  }
  return sections;
}

export function parseValue(raw) {
  if (raw == null) return "";
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export function storeValue(value) {
  if (Array.isArray(value) || (value && typeof value === "object")) return JSON.stringify(value);
  return String(value ?? "");
}

const ANSWER_ALIASES = { email: "public_email", phone: "public_phone" };

export async function saveAnswers(env, answers, user) {
  const db = await ensureDb(env);
  const known = new Set((await db.prepare("SELECT id FROM decisions").all()).results.map((r) => r.id));
  const now = new Date().toISOString();
  const stmts = [];
  for (const [rawId, value] of Object.entries(answers || {})) {
    const id = ANSWER_ALIASES[rawId] || rawId;
    if (!known.has(id)) continue;
    if (value == null || value === "") continue;
    stmts.push(db.prepare(
      `INSERT INTO decision_answers (id, decision_id, value, by_email, by_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).bind(crypto.randomUUID(), id, storeValue(value), user.email, user.name, now));
  }
  if (stmts.length) await db.batch(stmts);
  return listDecisions(env);
}
