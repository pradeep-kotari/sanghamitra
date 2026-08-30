# Sanghamitra

Public site for Sanghamitra (సంఘమిత్ర) — community sessions, Harikatha, Medhavadhanam, and booking.

- Live files: `site/`
- Event source of truth: `site/data/site.json`
- Next flyer: `.venv-whisper/bin/python tools/ingest-flyer.py /path/to.pdf`

Deploy the public folder only:

```bash
npx wrangler pages deploy ./site --project-name sanghamitra
```

Do not deploy the repo root. Research notes and the intake form stay out of the production upload if you keep using `./site` — except `site/intake.html`, which is currently in that folder.
