# AGENTS.md — Sanghamitra

Cursor and other coding agents: read this file at session start for this repo.

## Required rule (owner comms)

Before **any email, WhatsApp draft, admin copy for the owner, or external message to Sreenivas Ainapurapu**, read and follow:

**[.cursor/rules/sreeni-comms.mdc](.cursor/rules/sreeni-comms.mdc)**

That rule has `alwaysApply: true` but treat this link as mandatory — especially for **resend** (Pradeep review only) vs **send** (owner only when explicit).

## Who this project serves

| Role | Who | Email |
|------|-----|-------|
| Owner | Sreenivas Ainapurapu (address as **Sreenivas Garu**) | ainapura@yahoo.com |
| Builder | Pradeep Kotari | pradeep.kotari@gmail.com |

**North star:** save the owner's time; make the site and `/admin` easier for him — not more email or builder jargon.

## Repo map

- Public site: `site/` → https://sanghamitra.pages.dev
- Admin: `site/admin/` · API: `functions/`
- Event data: `site/data/site.json` · owner overlay: D1 via `/api/site`
- Scope / acceptance: [ISA.md](ISA.md)

## Agent defaults

- **resend / review / draft** → email **Pradeep only**, never the owner unless the user says **send** or names `ainapura@yahoo.com`.
- **push** → git only, not email.
- Do not commit unless asked.
- Do not invent poetry, magazine issues, photos, or claims — honest empty states until the owner uploads.
