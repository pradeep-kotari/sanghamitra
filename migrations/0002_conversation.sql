CREATE TABLE IF NOT EXISTS conversation (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  parent_id TEXT,
  author_email TEXT NOT NULL,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  emailed_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_conversation_created ON conversation(created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_parent ON conversation(parent_id, created_at);
