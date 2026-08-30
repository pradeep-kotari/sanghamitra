#!/usr/bin/env bash
# Read saved admin answers from Cloudflare D1 (questions are not stored).
set -euo pipefail
cd "$(dirname "$0")/.."
npx wrangler d1 execute sanghamitra --remote --command \
  "SELECT created_at, kind, author_name, body FROM conversation WHERE kind IN ('answer', 'thought') ORDER BY created_at ASC"
