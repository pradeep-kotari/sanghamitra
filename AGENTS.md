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

## Public copy is written for the visitor

Pradeep, 9 Sep 2026, on the Vedic Mathematics page: *"the whole copy is written
poorly — it is written for me rather than for the users."* He was right. Three
faults to avoid, all of which had shipped:

- **Never mention the old site.** The reader has never seen sanghamitra.org and
  does not know anything was lost or restored. "his old site", "They are back",
  "recovered from the sanghamitra.org slideshow" are migration news addressed to
  the builder. Say what the thing IS. The magazine pages are the one exception:
  there, "recovered from the Internet Archive" explains why some listed pieces
  cannot be read, which the reader needs.
- **Never open a section or a page on a bare "he".** A visitor arrives from a
  search result, not from the top of the site. Name Sreenivasa in the section
  where you first refer to him.
- **No build-log register.** "two little practice pages", "they need nothing but
  this page" is really "no download, no sign-up" said to the wrong reader.

The test before writing any public sentence: a parent has landed on this page
from a search for a maths teacher and knows nothing about this organization.
Does the sentence tell them what this is, whether it will help their child, or
how to start? If it tells them about the project instead, rewrite it.

Meta descriptions and og:description count as public copy. They are the sentence
that shows up when someone forwards the page on WhatsApp.

## Repo map

- Public site: `site/` → https://sanghamitra.pages.dev
- Admin: `site/admin/` · API: `functions/`
- Event data: `site/data/site.json` · owner overlay: D1 via `/api/site`
- Scope / acceptance: [ISA.md](ISA.md)

## Agent defaults

- **resend / review / draft** → email **Pradeep only**, never the owner unless the user says **send** or names `ainapura@yahoo.com`.
- **push** → git only, not email.
- Do not commit unless asked.
- `http://localhost:8788` serves this working tree live (see README → Local preview): saved edits and commits show at once. Never start or kill wrangler on :8788 yourself.
- Do not invent poetry, magazine issues, photos, or claims — honest empty states until the owner uploads.
