# Sanghamitra

Public site for Sanghamitra (సంఘమిత్ర) — community sessions, Harikatha, Medhavadhanam, and booking.

**Agents:** start with [AGENTS.md](AGENTS.md) (owner comms rule: [.cursor/rules/sreeni-comms.mdc](.cursor/rules/sreeni-comms.mdc)).

- Live files: `site/`
- Event source of truth: `site/data/site.json`
- Next flyer: `.venv-whisper/bin/python tools/ingest-flyer.py /path/to.pdf`

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
