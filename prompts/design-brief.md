# Design brief — Sanghamitra site, second iteration

**For Cursor.** Open this repository and read this file first. It is written to be
self-contained: assume no prior knowledge of the project. Read `AGENTS.md` as well before
touching anything.

---

## The task, in one line

Redesign the Sanghamitra homepage and give each area of the organization's work its own page,
following what the client asked for in his 7 September meeting.

## Scope

**In scope — you may change these:**

| Path | What you may do |
|---|---|
| `site/index.html` | Redesign it. This is the main deliverable. |
| `site/css/site.css` | Extend it. Add components and tokens; do not start a second stylesheet. |
| New category pages under `site/` | Create them, following the existing page skeleton. |
| `site/events.html` | Restructure into Past and Upcoming. |
| `site/about.html`, `site/learn.html`, `site/give.html`, `site/talks.html`, `site/watch.html`, `site/traditions.html`, `site/poetry.html`, `site/magazine.html`, `site/press.html`, `site/gallery.html`, `site/contact.html`, `site/book.html` | Header, navigation and category links only, so they stay consistent. Do not rewrite their body copy. |
| `site/data/i18n.te.json` | Add **keys**, with empty values. Never add Telugu text. |
| `site/js/site.js` | Extend for new components. |
| `prompts/`, `research/` | Add notes if useful. |

**Out of scope — do not touch these:**

- **The footer, on every page.** The client asked twice that it stay as it is. It must remain
  byte-identical to `origin/main`. Verify this with `git diff` before you finish.
- `site/admin/`, `site/intake.html`, `functions/` — the owner's admin tools and the API. No
  part of this task needs them.
- `site/data/site.json` — owner-editable content. Read it; do not rewrite his words.
- Any email, WhatsApp message, or admin copy addressed to the owner. `AGENTS.md` governs this
  and it is a hard stop.
- Deployment. Do not run `wrangler` and do not push. Pradeep deploys.
- Committing. `AGENTS.md` says do not commit unless asked. Leave the work in the tree.

**Not in this pass, even though it is on the client's list:** the donation flow, storing form
submissions, the "About Sreenivasa" page, and uploading the old magazine issues. He deferred all
four himself.

**Before you start:** this repository is worked on by more than one agent. Run `git log --oneline -5`
and `git status` first. Commit `6da3e02` already applied part of the client's list; start from
that tree, not from a blank page.

---

## Who this is for

**Sanghamitra** (సంఘమిత్ర, "friend of society") is a one-man community organization in
St. Louis, Missouri, named in 2003. **Sreenivasa Ainapurapu** founded it and runs all of it
himself. He teaches mathematics — Vedic methods, school topics, SAT and ACT — to children of
Telugu families, hosts Harikatha and Burrakatha performances on Zoom and YouTube, writes Telugu
poetry, pays school fees for children in India, and published a bilingual magazine from 2003
until 2015.

He takes no money for himself. Gifts audiences give after a performance go entirely to the
performer. He has never accepted donations.

**Who visits the site.** Telugu-speaking families in the United States, mostly parents looking
for a maths teacher for a middle- or high-school child. A second, older group reads Telugu
comfortably and comes for the poetry, the magazine and the recorded discourses. A third group is
his own students' parents checking dates and joining links. Assume many are over sixty, reading
on a phone, and not fluent in English interfaces.

**Sreenivasa is the client and the only editor.** He is technically capable — he ran the old
site, bought Telugu font software, knows what an injection attack is — but he has one hour a day.
Anything he must maintain has to be obvious. Address him as **Sreenivas Garu** anywhere his name
appears in working notes.

---

## Read these before designing

| File | What it is |
|---|---|
| `research/meeting-2026-09-07-sreeni-asks.md` | Every change he asked for, grouped, each with a timestamp. **This is the specification.** |
| `research/transcripts/meeting-2026-09-07-transcript.md` | The full meeting, Telugu with English translation. Go here when a request needs context. |
| `research/meeting-2026-09-07-changes.md` | The same material with open questions and organization facts worth putting on pages. |
| `AGENTS.md` | Repository rules. Mandatory. |
| `ISA.md` | What the previous iteration set out to do and what it verified. |
| `site/css/site.css` | The existing tokens and components. Read before inventing anything. |

---

## The ideal state

A visitor who has never heard of Sanghamitra lands on the homepage and, without scrolling twice:

1. Reads the name **Sanghamitra** as the largest thing on the page, with సంఘమిత్ర beneath it.
2. Understands in one sentence what the organization is and what it believes.
3. Sees the areas of work **as photographs**, not as a list of words, and can tell at a glance
   which one is theirs.
4. Clicks any one of them and arrives on a page devoted to that work alone, with real
   photographs of it.
5. Can switch the whole page to Telugu and have it stay switched.

And Sreenivas Garu, looking at it, recognises his own organization rather than a template.

**The tension you have to resolve, and the reason this brief exists.** The site today is
editorial and typographic — serif type, warm paper ground, restrained ornament. It reads well and
it suits a man who writes poetry. What he asked for is closer to a community-organization site:
photographs leading, tiles, scrolling galleries. Those two instincts pull in opposite directions.
Resolve it deliberately and say in one paragraph how and why. Do not quietly abandon the
typographic character to satisfy the literal request, and do not quietly ignore the request to
protect the character.

---

## Constraints that are not yours to change

**From the client, explicitly:**

- **The footer stays byte-identical.** He and his family liked it; his document says leave it
  alone. Do not restyle it, reorder it, or improve it.
- **Never write "not for profit"** anywhere on the site. It is a legal claim and unverified.
- The mission wording is his, verbatim: *"Sanghamitra is an organization founded in 2003 based on
  values, love, sharing and caring. Education for progress. It's a platform to learn, share and
  progress."*
- The motto is *Knowledge, Entertainment and Progress — Vijnanamu, Vinodamu, Vikasamu*, in that
  order, shown on hovering the logo.
- The Telugu name sits **beneath** the English name and is **right-justified**.
- **Telugu classes are not a category.** They belong inside Community Service, because the
  classes are run by SiliconAndhra Manabadi, a different organization.
- Long category labels — "Community Service", "Knowledge Sharing" — wrap to two lines so the
  cards align.
- The final category list is **seven, possibly eight**, and he is still writing it. Design the
  grid so it survives six, seven or eight items without redrawing.
- Two categories he dropped from the homepage, the older arts and the magazine, must stay
  reachable from somewhere.

**From the material:**

- **Photographs: 19 camera-original event photographs now exist**, 2007–2015, each with his own
  caption, recovered from his old homepage slideshow: `research/old-site/files/slideshow/`, captions
  in `research/old-site/slideshow-captions.json`. Resize to about 1,600 px and 200–300 KB before
  placing; never copy the 1–4 MB originals into `site/`. They cover Math Tutoring, Vedic
  Mathematics, Knowledge Sharing, Events and the photo strip. **Community Service and Workshops
  still have no photograph**; keep their honest placeholders. Caption 8 names three children and
  is held until he has read it. The six images in his Word document are low resolution and three
  are screenshots; they are no longer needed.
- **The "scrolling pictures" he asked for are now known exactly.** From 2013 to 2025 his homepage
  ran a crossfade slideshow over those 19 photographs: 8 seconds a frame, 3-second fade, one
  caption each. Match that pacing. A fast carousel is not what he built or what his readers knew.
- **Telugu text runs 20 to 30 percent longer than English** and needs more line height. Any
  component with a fixed height or a tight character count will break when the page is switched.
  Check every one in both languages.
- The Telugu dictionary is deliberately almost empty, because **nothing is machine translated**.
  An empty value must fall back to English silently, never render blank.
- He publishes performers' videos only with their consent. Do not design anything that
  encourages bulk-embedding or reposting.

**From the platform:**

- Static HTML and CSS on Cloudflare Pages. No build step, no framework, no bundler.
- Fonts already loaded: Fraunces, Source Serif 4, Noto Serif Telugu. Adding a font costs a
  render-blocking request; justify it or use these.
- No third-party scripts. His stated worry is security and liability, and he has been attacked
  before.
- Reuse the CSS custom properties in `site/css/site.css`.

---

## What to produce

1. **A short design rationale**, at most two pages, saved to `prompts/design-rationale.md`. How
   you resolved the typographic-versus-photographic tension, the grid and type scale, how a
   category page is composed, and what changes when the page is in Telugu. Written for
   Sreenivas Garu to read, not for a designer.

2. **A working homepage**, replacing the current one.

3. **One complete category page**, built as the pattern the rest will follow. Choose the hardest:
   Community Service, which has the longest label, the most sub-activities and the weakest
   photographs.

4. **The events page**, split into Past and Upcoming. Past grouped by year. Upcoming showing a
   calendar and offering an add-to-Google-Calendar link.

5. **A named list of what each category's photograph must be**, saved to
   `research/photo-shot-list.md` — aspect ratio, rough subject, whether faces are needed. He
   asked what to send and never got an answer; this unblocks him.

---

## Expected outcomes

**What lands in the working tree**

| File | Expected state when you finish |
|---|---|
| `site/index.html` | Rewritten. Name leads, mission statement under it, categories as image cards, scrolling photographs, footer untouched. |
| `site/community-service.html` (or your naming) | New. The pattern every other category page copies. |
| `site/events.html` | Past and Upcoming separated. Past grouped by year. Upcoming carries a calendar and an add-to-calendar link. |
| `site/css/site.css` | Extended, not replaced. New components documented by a one-line comment each, matching the file's existing style. |
| `site/data/i18n.te.json` | New keys, all values empty. |
| The other 12 public pages | Header and navigation consistent with the new homepage. Body copy untouched. |
| `prompts/design-rationale.md` | New. Two pages, plain English, readable by the client. |
| `research/photo-shot-list.md` | New. One row per category saying exactly what photograph to send. |

**What the site does afterwards that it does not do today**

1. The homepage leads with photographs of the work rather than a list of text links.
2. Every category has a page of its own, reachable from the card and from the menu, with a
   gallery for that activity.
3. Events separate past from upcoming, and a visitor can put an upcoming session into their own
   calendar in one click.
4. The whole thing survives being switched to Telugu without a broken layout, and stays switched.
5. The grid absorbs the client's final list of seven or eight categories without a redesign.

**What Pradeep can do with the result**

Show Sreenivas Garu a working site in the next weekend meeting, walk him through one category
page as the pattern, and hand him the photo shot list so the real photographs start arriving.

**What is still blocked afterwards, and should be reported as such**

- The final category names and section text. He is emailing them.
- Photographs for Community Service and Workshops only; the other cards are now covered by the recovered slideshow.
- All Telugu copy. The dictionary keys will exist; only he can fill them.
- The donation destination, which has no decision behind it yet.

Report these as open. Do not paper over any of them with invented content.

---

## Definition of done

Do not report this finished until every line below is true and you have the evidence.

- [ ] **No footer changed.** Prove it, do not assume it:
      ```bash
      # Match the SITE footer only. Several pages carry a <footer> inside a
      # blockquote citation, and a bare /<footer/ range silently swallows page body.
      for f in site/*.html; do
        git show origin/main:$f 2>/dev/null | sed -n '/<footer class="site-footer"/,/<\/footer>/p' > /tmp/a
        sed -n '/<footer class="site-footer"/,/<\/footer>/p' "$f" > /tmp/b
        [ -s /tmp/a ] || continue   # new page: compare against index.html by hand
        diff -q /tmp/a /tmp/b >/dev/null || echo "FOOTER CHANGED: $f"
      done
      ```
      This must print nothing. It passes on the current tree, so any failure is yours.
- [ ] `grep -ri "not for profit" site/` returns nothing.
- [ ] The homepage and the category page render correctly at **400px** and **1280px** wide, in
      **English and in Telugu**. Four screenshots, looked at, not assumed.
- [ ] Switching to Telugu and reloading keeps the page in Telugu.
- [ ] Every `data-i18n` key you added has an **empty** value in `site/data/i18n.te.json`, and the
      page shows English rather than a blank where a translation is missing.
- [ ] Every internal link on the changed pages resolves. No 404s.
- [ ] The older arts and the magazine are both still reachable by clicking, starting from the
      homepage.
- [ ] The category grid still looks right if you add or remove one card.
- [ ] No new third-party script, and no new font, unless the rationale explains why.
- [ ] Nothing committed, nothing deployed, nothing emailed.

---

## When something is unclear

Decide it yourself, state the assumption in one line in the rationale, and keep going. Do not
stop and wait. Three are known already:

1. Does the magazine sit under Works of Literature or under Knowledge Sharing? He said both, at
   different points in the meeting.
2. Are past events grouped by year or by activity? He described year-wise and left it open.
3. Does the language toggle switch the whole site, or only pages that have Telugu copy?

## What not to do

- Do not translate anything into Telugu yourself.
- Do not invent photographs, testimonials, student numbers, or claims about the organization.
  Everything factual is in the transcript and the research files; if it is not there, leave it out.
- Do not add a donation flow, a payment integration, or a login.
- Do not remove any page or link that exists today.
- Do not email or message the owner. Ever, in this task.
