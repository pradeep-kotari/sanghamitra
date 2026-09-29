-- One row per public form submission, used only to slow down floods from one connection.
-- `who` is a salted hash of the visitor's IP address and the day, never the address itself,
-- and rows older than a day are deleted on the next submission. The same statements run at
-- request time in functions/lib/db.js (ensureDb), so production needs no manual migration step.
CREATE TABLE IF NOT EXISTS form_hits (
  who TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_form_hits_who ON form_hits(who, created_at);
