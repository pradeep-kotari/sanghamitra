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

Pushes to `main` also deploy via GitHub Actions (`.github/workflows/deploy-pages.yml`) once the repo secret is set:

1. [Create a Cloudflare API token](https://dash.cloudflare.com/profile/api-tokens) with **Account → Cloudflare Pages → Edit**.
2. In GitHub: **Settings → Secrets and variables → Actions → New repository secret**
3. Name: `CLOUDFLARE_API_TOKEN` · Value: the token from step 1.

Do not deploy the repo root. Research notes and the intake form stay out of the production upload if you keep using `./site` — except `site/intake.html`, which is currently in that folder.

## Local preview — http://localhost:8788

"Railway for localhost": a background server on this machine serves the **last commit** on `main` (whichever of local `main` / `origin/main` is newer) and redeploys on every commit — git hooks fire it instantly, a 2-minute cron catches commits made in the cloud, and it comes up at Windows login. It serves a separate git worktree (`~/code/sanghamitra-deploy`), never this working tree, so half-finished edits do not show there. Local D1/KV data is shared with `.wrangler/state` here; pending migrations are applied on every deploy.

- `bash ~/wsl-startup/deploy-sanghamitra-local.sh --status` — what is served, what is stamped, is the server up
- `bash ~/wsl-startup/deploy-sanghamitra-local.sh --now` — deploy right now
- Never start or kill wrangler on :8788 by hand. To preview **uncommitted** work use another port: `npx wrangler pages dev ./site --port 8790 --ip 127.0.0.1 --persist-to $PWD/.wrangler/state`
