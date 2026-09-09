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
