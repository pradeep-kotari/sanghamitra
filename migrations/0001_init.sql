CREATE TABLE IF NOT EXISTS queries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'contact',
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_queries_created ON queries(created_at);

CREATE TABLE IF NOT EXISTS query_replies (
  id TEXT PRIMARY KEY,
  query_id TEXT NOT NULL,
  by_email TEXT NOT NULL,
  by_name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_query_replies_query ON query_replies(query_id, created_at);

CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  section INTEGER NOT NULL,
  section_title TEXT NOT NULL,
  title TEXT NOT NULL,
  why TEXT NOT NULL DEFAULT '',
  field_type TEXT NOT NULL,
  options_json TEXT NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS decision_answers (
  id TEXT PRIMARY KEY,
  decision_id TEXT NOT NULL,
  value TEXT NOT NULL,
  by_email TEXT NOT NULL,
  by_name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_decision_answers_decision ON decision_answers(decision_id, created_at);

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
