# Review Sanghamitra — options first, then improve

Paste this into a new Cursor agent chat with workspace `/home/prade/code/sanghamitra`.

---

# Sanghamitra — review, suggest options, stop

## Role

You are reviewing a **public organization site** for Sanghamitra. The customer is **Sreenivasa Ainapurapu**. The builder is Pradeep. Visitors have never seen emails or chat.

Judge the site by **whether it does the job Sreenivasa asked for**. Then propose **options** so Pradeep (and, where needed, Sreenivasa) can choose. After tool use, summarize what you found — not what you shipped.

## Hard stop

**Do not edit files, restyle, deploy, commit, or “just fix the obvious” in this turn.**

Read the live site and the repo. Score it against the brief. Then output a **choice list**. Wait for a reply that picks options (for example: “1A, 2B, 3 recommended, skip 4”). Only in a **later turn**, after those picks, implement the chosen options.

If something is broken in a way that blocks the review itself (site will not load), say so. Still do not patch until chosen.

## What Sreenivasa wants (source of truth)

Use this stack. Higher beats lower when they conflict.

### 1. His email to Pradeep (the brief)

Under the Sanghamitra umbrella, for over 25 years:

1. Sharing and caring — food donation, clothing, fee payment and books for unprivileged students, financial and moral support to elders
2. Srinivasa Ramanujan MathemaTRICKS Club — Vedic mathematics summer program, middle- and high-school math tutoring, ACT/SAT coaching
3. Telugu teaching through SiliconAndhra Manabadi
4. Writing poetry — one Satakam published last year; many others in progress
5. Knowledge sharing on Facebook, YouTube, WhatsApp, and similar
6. Meditation camps; anger-management / stress-management presentations
7. Encouraging the ancient art forms
8. Sanghamitra online quarterly magazine for knowledge, wisdom, and fun, 2003–2011

He said he will send **photos for each category**. The site should be ready to receive them. It should not invent photos or verses.

### 2. What he asked the site to be (via Pradeep)

- An **organization** site for users and customers — not a personal homepage. He is the face.
- **Lead conversion:** a stranger should see what is offered and be able to act (enroll, give, invite a talk, join a sitting, write or WhatsApp him).
- He **does not have time** to build or maintain it. Keep the public site simple static HTML.
- He owns **sanghamitra.org** (still parking at Network Solutions). Do not point that domain from here.

### 3. What he also named as work to show

Harikatha, Burrakatha, Medhavadhanam, Sundara Kanda. Next public sitting he sent: **5 September 2026**, Sundara Kanda Harikatha by Srimati Jayanti Savitri, 6 PM IST / 7:30 AM US Central, Zoom `https://us02web.zoom.us/j/86386435256`. He announces with PDF flyers.

### 4. How people should reach him

- WhatsApp him: **+1 314 601 5309** (`https://wa.me/13146015309`)
- WhatsApp group: `https://chat.whatsapp.com/EAEwM6yk9jG3zIiRd6qOKg`
- YouTube: `https://www.youtube.com/@sreenivasaainapurapu3741/featured`
- Facebook: `https://www.facebook.com/sreenivasa.ainapurapu`
- Join a group session from the flyer, or ask for a 1:1

### 5. His own public copy (YouTube About — use for tone, not as a dump)

Sanghamitra is a community organization since 2003. Vedic mathematics, Telugu, meditation, literature, Vedic knowledge, and ancient art forms. People should be able to **watch comfortably from home** and share that with friends. Guru line: when we share knowledge, wealth, and joy, they get doubled. One family — Vasudhaika Kutumbam.

His 2014 hall line (verified): friendship has no age bound; that is why the name Sanghamitra — friend of society. Base of the work: caring, sharing, and love.

### What is not his answer

`site/intake.html` is a questionnaire Pradeep built so Sreenivasa could choose. **He has not filled it.** Orange “suggestion” defaults are guesses. Do not treat them as his decisions.

## Why this review exists

The site must show **all eight activities** he listed, in **public organization voice**. Conversion is “know what Sanghamitra offers, then enroll / give / invite / join / WhatsApp.” It is not a single-product landing page that hides the rest of the umbrella.

Pradeep wants **choices, not a surprise rewrite** — same reason the intake page exists: save Sreenivasa’s time by making picking easy.

## Action bias

Conservative until picks land. Discover from the live URL and files. Do not infer permission to ship.

## Parallel execution

Read independent files and the live site in parallel. Sequence only when a step depends on a prior result.

## Repo facts (mechanics, not goals)

- Live: https://sanghamitra.pages.dev/
- Public files: `site/` — HTML, `css/site.css`, `js/`, `data/site.json`
- Nav/footer: `tools/apply-chrome.py` (skip `intake.html`)
- Deploy (only after picks + a later turn): from repo root, `npx wrangler pages deploy ./site --project-name sanghamitra --commit-dirty=true`
- Admin is footer-only. Keep `intake.html` out of the public nav.

## Instructions

### 1. See what a visitor sees

Open https://sanghamitra.pages.dev/. Walk home, About, Learn, Give, Invite, Poetry, Events, Contact, Watch, Magazine, Traditions, Press, Gallery. Phone-width on home and Learn.

Read local `site/*.html`, `css/site.css`, `js/site.js`, `data/site.json`. Live site = visitor truth.

### 2. Score the site against his brief

Short notes with evidence (page + what a stranger would do). Do not start changing copy.

- **Umbrella:** Can a visitor find all eight activities without being told they are “a list he emailed”? Magazine 2003–2011 is history, still named. Arts include Harikatha, Burrakatha, Medhavadhanam, Sundara Kanda.
- **Offer → action:** For each live offer (math/Telugu, give, invite a talk, poetry, next Zoom, watch from home), is the next step obvious?
- **Reach him:** WhatsApp direct, WhatsApp group, YouTube, Facebook — present and working.
- **Next sitting:** 5 September Sundara Kanda is findable from home, with join link and flyer.
- **Voice:** Organization speaking to the public. No builder asides (“I will not invent…”, “his list”).
- **Honesty:** No invented verses, magazine PDFs, payment rails, or 501(c)(3).
- **Maintainability:** He will not edit HTML.

### 3. Propose options — then stop

Turn gaps into **numbered decisions**. Each decision:

- One sentence: what is wrong vs his brief (page + evidence)
- Two or three **options**, labeled A / B / C
- Mark **one** as Recommended, with one line why
- Who picks: **Pradeep** (builder) or **Sreenivasa** (only he knows)
- Effort: S / M / L
- Option “leave it” is allowed when that is honest

Make picking easy: Pradeep should be able to reply with a single line of codes (`1A 2C 3B`). Cap at **eight decisions**. Merge small nits. Craft (type, contrast, tap targets) only if it blocks the jobs above — and still as an option, not a silent fix.

Do not implement. Do not deploy. End the turn.

### Later turn (only after picks)

Implement the chosen options only. Keep Fraunces, Source Serif 4, Noto Serif Telugu, saffron/indigo. If header/footer changes, update and run `tools/apply-chrome.py`. Verify the paths a parent, donor, host, and Zoom guest would use. Deploy with wrangler. Do not git commit unless asked.

## How to write an option (example)

**1. Home names the work, but a parent still hunts for Enroll**
- **A (Recommended, Pradeep, S):** Keep the eight activities; put Enroll / WhatsApp in the first screen actions. Why: matches “see what is offered, then act.”
- **B (Pradeep, M):** Replace the eight-block with four audience doors only; move the eight to About.
- **C:** Leave home as it is.

Bad option: “Improve the homepage.” That is not choosable.

## Copy: bad vs good (when a later turn rewrites)

Bad: “Eight lines of work. His list. Sreenivasa wrote these for the site.”

Good: “Community work for more than 25 years. Food and care for those who need it. Mathematics and Telugu for students. Poetry, meditation, the older arts, and sittings you can join from home.”

## Constraints

Stay inside facts in this brief or already on the site. Gaps he still owns: Satakam title/PDF, magazine files, photos per category, how to send money, 501(c)(3). Those are **Sreenivasa options** (send / wait / omit), not copy you invent.

Keep `sanghamitra.org` unpointed. Do not publish `research/` transcripts or garbled ASR names (Medal Ghana, West John Martin, Summersville.org).

## Output format (this turn)

1. **Against his brief** — five to eight bullets. What a stranger can and cannot do.
2. **Decisions** — numbered 1–8 max, each with A/B/(C), Recommended, who picks, effort.
3. **Reply line** — one example: `Reply with: 1A 2B 3A …` (and `skip N` if they want none of that row).
4. **Do not implement** — last line: waiting for picks. No file list of edits.
