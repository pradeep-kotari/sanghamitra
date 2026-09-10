-- Photos and library items, one row each. The same statements run at request time in
-- functions/lib/db.js (ensureDb), so production needs no manual migration step.
CREATE TABLE IF NOT EXISTS media_items (
  id TEXT PRIMARY KEY,
  store TEXT NOT NULL,
  created_at TEXT NOT NULL,
  doc TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_media_store_created ON media_items(store, created_at);
