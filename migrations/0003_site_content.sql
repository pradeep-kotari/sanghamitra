CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  by_email TEXT NOT NULL DEFAULT '',
  by_name TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);
