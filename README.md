# Sanghamitra

Public site for Sanghamitra (సంఘమిత్ర) — community sessions, Harikatha, Medhavadhanam, and booking.

**Agents:** start with [AGENTS.md](AGENTS.md) (owner comms rule: [.cursor/rules/sreeni-comms.mdc](.cursor/rules/sreeni-comms.mdc)).

- **Live at https://sanghamitra.pages.dev — that is the public address, on purpose.**
  `sanghamitra.org` still resolves to the old host (74.91.138.137, not Cloudflare) and does
  NOT serve this site. Pradeep's call, 9 Sep 2026: it stays that way until Sreeni has time to
  move the DNS. So every address written for a visitor — share text, calendar notes, emails,
  canonical tags, the sitemap — says `pages.dev`. Mentions of `sanghamitra.org` in page copy
  are about the *old* site the archive came from, and those stay.
- Live files: `site/`
- Event source of truth: `site/data/site.json`
- Next flyer: `.venv-whisper/bin/python tools/ingest-flyer.py /path/to.pdf`
- Issue pictures: `.venv-whisper/bin/python tools/magazine/covers.py` then `tools/magazine/generate.py`
  — every issue card gets a picture from that issue (its cover, a page of it, or its own column
  headings). Re-run both after recovering more of an issue: a real page beats a contents card.
- Magazine search: `generate.py` also writes `site/data/magazine-search-index.json`, which the search box on
  `magazine.html` (`site/js/magazine-search.js`) reads in the browser. It is built in the same run as the pages,
  so re-running `generate.py` is the only step; never edit the index by hand. It covers issue, column and piece
  names, writers (in the script they were printed in), and the scrubbed text of the English `read-*` articles.
- Whole issues from Sreeni's backup (`July2009.pdf`, `July2009_eng.pdf`, …):
  `.venv-whisper/bin/python tools/magazine/ingest_issues.py <folder>`, then `covers.py`, then `generate.py`.
  Keep the originals under `research/old-site/files*/` (not in git): **every issue prints the editor's home
  address, landline and email on its cover and again on its "In this issue" page, as pictures, and again in
  the text of the pages that ask readers to write in.** The tool blanks all of it (text and pixels), checks
  each page against the original afterwards, and refuses a file it cannot clean. Never copy a PDF from the
  backup straight into `site/`. `tools/magazine/redact.py` holds the one list of what is private; a new
  address goes there, and covers.py and generate.py pick it up.
- Getting files out of his Google Drive (the connector's `download_file_content`): each call saves the file as base64
  JSON in the session's tool-results folder and reports "exceeds maximum allowed tokens ... saved to <path>"; that
  is success. Decode by the `id` and `title` inside the JSON. **Make the calls one at a time:** two that finish in
  the same millisecond are saved to the same file name and one is silently lost (it happened twice, once per
  batch). Check the bytes against the size Drive listed before trusting a file.
- Photographs from his collection: `.venv-whisper/bin/python tools/ingest_photos.py <manifest.json>` (format in
  the tool's header). It sizes them, drops the camera data, adds them to the gallery and to
  `site/data/photos-archive.json`, which the admin "download everything" backup reads.

Deploy the public folder only:

```bash
npx wrangler pages deploy ./site --project-name sanghamitra
```

Pushes to `main` deploy on their own, through Cloudflare Pages' git integration.
Nothing in this repo has to run for that to happen.

The GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) is a second,
optional path and is **manual-only** — run it from the Actions tab. It is off on
push on purpose: it would deploy the same files a second time, and it has no
`CLOUDFLARE_API_TOKEN` secret, so every run fails in about 20 seconds and emails
a failure for a deploy that already succeeded.

To make Actions the real deploy path instead:

1. [Create a Cloudflare API token](https://dash.cloudflare.com/profile/api-tokens) with **Account → Cloudflare Pages → Edit**.
2. In GitHub: **Settings → Secrets and variables → Actions → New repository secret**
3. Name: `CLOUDFLARE_API_TOKEN` · Value: the token from step 1.
4. Turn the Pages git integration off in the Cloudflare dashboard, so the two do not both deploy.
5. Restore the `push` trigger at the top of the workflow.

Do not deploy the repo root. Research notes and the intake form stay out of the production upload if you keep using `./site` — except `site/intake.html`, which is currently in that folder.

## Local preview — http://localhost:8788

"Railway for localhost": a background server on this machine serves **this working tree** at `http://localhost:8788` — every saved edit and every commit is live there at once. It comes up at Windows login, is restarted by the health watchdog if it dies, and a deploy engine (`~/wsl-startup/deploy-sanghamitra-local.sh`) runs on every commit plus every 2 minutes to pull commits made elsewhere (cloud, GitHub web) into this clone, apply pending D1 migrations to the local database, and prove the port serves the bytes on disk.

- `bash ~/wsl-startup/deploy-sanghamitra-local.sh --status` — what is served, how many uncommitted files, is the clone behind origin
- `bash ~/wsl-startup/deploy-sanghamitra-local.sh --now` — pull + migrate + verify right now
- Never start or kill wrangler on :8788 by hand; the launcher owns it. Cloud commits are pulled with rebase + autostash, so keep your uncommitted work committable.
