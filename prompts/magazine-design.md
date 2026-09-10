# Design — bringing the old Sanghamitra into the new site

Written 8 September 2026, after recovering the old sanghamitra.org from the Internet Archive.
Updated the same evening after a second pass recovered every version of the homepage, the slideshow
photographs with captions, and found the personal details inside the PDFs.
Inventory and evidence: `research/old-site/FINDINGS.md`. The material itself: `research/old-site/files/`.

---

## What we are actually holding

Sreenivas Garu ran a **quarterly magazine for twelve years**, October 2004 to April 2016. He
edited it, wrote the mathematics column, hand-made the Telugu headings when the font could not
render them, and compiled every issue into a printable book so elders could read it comfortably.
He told Pradeep the issues were lost on a flash drive.

They are not lost.

| | |
|---|---|
| Issues whose contents survive | **23**, October 2004 – April 2016, complete tables of contents; plus **3 issues of 2007 known only by name** (Ugadi, July, Vijaya Dasami) from the 2007 year listing |
| Issues whose article PDFs survive | 11 of 23 folders, **81 PDFs, 191 pages** |
| English articles that extract as clean text today | **14** (eleven more "_eng" PDFs turned out to use the legacy Telugu font and extract as glyph codes) |
| Telugu articles needing glyph recovery | **55**, plus those eleven |
| Covers, column headings, portraits | 78 images, including his original Telugu **masthead and motto graphics** |
| **Photographs** | **19 camera-original event photographs, 2007–2015, each with his own caption** — the homepage slideshow from 2013 onward |
| The homepage itself | all **7 versions**, 2006 to 2025 |
| Interactive maths tools | 2, with their server scripts |

**The magazine's own tagline, from its masthead:** *"a quarterly online magazine meant for
knowledge, entertainment and progress."* That is the motto he asked to put on the logo hover —
Vijnanamu, Vinodamu, Vikasamu. It was the magazine's purpose first. His own masthead graphic
(`samghamitra_motto.jpg`) sets it in Telugu as **విజ్ఞాన, వినోద, వికాస త్రైమాసిక పత్రిక** — the adjectival
form, modifying "quarterly magazine"; the standalone form he spoke in the meeting, విజ్ఞానము, వినోదము,
వికాసము, is what the logo hover uses. Both are his.

---

## The old homepage, and what to take from it

All seven versions of his homepage survive (`research/old-site/files-versions/`). Read together they
settle the "what my old site had" references in the meeting, with no guessing:

| Years | What the front page was |
|---|---|
| 2006–2007 | Masthead graphic, "click the image to view the current issue", list of previous issues |
| 2011 | One large photograph with a caption |
| **2013–2025** | Masthead · a **crossfade slideshow** of event photographs, 8 seconds a frame, 3-second fade, **each with a caption** · three doors: **Telugu Magazine · English Magazine · Events** · from 2014 the weekly MathQuiz links · a "release updates" sign-up form (first name, last name, email) · mailing address and phone |

**What this means for the new site:**

- **The scrolling photographs he asked for at 01:25 are these 19 files, with these captions.** Use them
  as the homepage photo strip and as the galleries on the Vedic Mathematics and Events pages. Keep his
  captions; they are dated, placed and in his voice ("Kids having fun while learning. Parents joined
  them in the fun activity."). Match his pacing rather than a fast carousel: a slow crossfade, one
  frame at a time, is what he built and what his readers knew.
- **They fill five of the seven topic cards.** Math Tutoring, Vedic Mathematics, Knowledge Sharing,
  Events and Works of Literature (the emblem) now have real photographs. **Community Service and
  Workshops still have none** — keep their honest placeholders and their rows in the shot list.
- **Serve them resized.** The originals are 3,000–4,000 px and 1–4 MB each. Serve at about 1,600 px
  wide and 200–300 KB; keep the originals in `research/`, never in `site/`.
- **His three doors map onto the new archive front door:** Browse by issue splits into Telugu and
  English the way his did; Events is already its own category page.
- **The sign-up form was a mailing list.** Twelve years of readers who asked for release updates.
  Ask him whether that list still exists anywhere; it is the one audience asset the archive cannot
  recover and the first people to tell when the archive goes live.

---

## Privacy gate — must clear before deploy

The archive was public for twelve years, but republishing in 2026, indexed by search engines, is a
different act. Three things need his word or a redaction, and none of them is optional:

1. **Home addresses and personal phone numbers inside the PDFs.** 25 of the 77 served PDFs and 2 of
   the 4 event flyers print his street address (Lyric Court, St. Louis; later Strecker Ridge,
   Wildwood) and old phone numbers. **Default: redact the address and old phone lines in the served
   copies**, originals untouched in `research/`. His current WhatsApp number is already public on the
   site and may stay. He can overrule the default, but he must see it first.
2. **Children named in captions and scores.** Slideshow caption 8 names three children by first
   name; the MathQuiz winners list names players with locations, two of them apparently his
   daughters. Captions naming children are shown to him before use; the winners list is not
   republished without his yes.
3. **Contributor portraits and names.** SuSri, Didiji, Vaasanti Maghapu, Sudhakar Attili, Saakshi,
   Divya & Upagya are credited on his own contents pages, and their portraits are in the archive.
   Names appear on the new pages because he published them; portraits wait for his yes.

Also excluded by default: both old email addresses, the attacked feedback form, and the 2004-era
HTML, which is a source, not a page.

---

## The one design decision everything follows from

The old site was **issue-first**: here is October 2006, here are its twelve articles. That was
right for a subscriber in 2006 who wanted the new issue.

It is wrong for a stranger in 2026, who arrives from a search for *Vemana padyalu* or *Telugu
proverbs for children* or *Vedic maths tricks* and wants **one article**, not an issue.

**So the archive gets two axes, not one.**

- **By issue** — faithful to how he built it, in his own festival names, for the readers who
  remember it.
- **By column** — every instalment of *Mathematricks* across twelve years on one page, every
  *Vemana* piece on another. This is the modernization. It turns a folder of dead PDFs into
  something findable, and it is the only version of this archive that search engines can serve
  to a stranger.

Nothing about his structure is discarded. A second way in is added on top of it.

---

## The pages

### 1. `magazine.html` — the archive front door

Replaces today's stub, which says only "No issues are listed yet."

- The masthead line, verbatim from his own site, with the Telugu.
- One paragraph of history in his words: bilingual at first, split into separate Telugu and
  English editions from October 2007 because a joke in Telugu does not survive translation.
  The English edition's Volume 1 Issue 1 is October 2007 — the archive proves his account.
- **Two entry points, side by side: Browse by issue · Browse by column.**
- His **original Telugu masthead and motto graphics** (`samghamitra_title.jpg`, `samghamitra_motto.jpg`)
  as the historic masthead, small, above the modern heading.
- Below, the 23 issues newest first, grouped by year, each showing its cover where we have one; the
  three 2007 issues known only by name sit in their year as rows marked "contents not recovered".

### 2. Issue pages — one per issue, 23 of them

Built from the tables of contents already in `research/old-site/files/index*.html`.

- Titled the way he titled them: **Sankranti** for January, **Ugadi** for April, July, and
  **Vijaya Dasami** for October, with the year. Not "Q1 2006".
- The contents exactly as the old site listed them, **with contributor names**: Foreword by the
  Editor, Cover Story by SuSri, Words of Wisdom by Didiji, Mathematricks by Sreenivasa Rao
  Ainapurapu, Smile if you wish by Vaasanti, Salutation to your solution and Kids pages by
  Sudhakar Attili, Question Gallery, Answers & Winners, Final word.
- Each item links to the article where the PDF survives, and says plainly "not recovered" where
  it does not. **Twelve of the 23 issues are contents-only.** Say so; never fake a link.
- Where `fullbook.pdf` exists, a **"Print the whole issue"** button. That is his own feature and
  the reason he built the book format. Keep it.

### 3. Column pages — the new axis

One page per column, listing every instalment across twelve years, newest first.

| Column | English title | Who |
|---|---|---|
| `mathematrix` | Mathematricks | Sreenivasa Rao Ainapurapu |
| `toranam` | Salutation to your solution | Sudhakar Attili |
| `chuddam` | Question Gallery | Sreenivasa Ainapurapu |
| `balamitra` | Kids pages | Sudhakar Attili |
| `jokes` | Smile if you wish | Vaasanti |
| `cover_story` | Cover Story | SuSri |
| `WOW` | Words of Wisdom | Didiji |
| `mundumaata` / `tudipaluku` | Foreword / Final word | Editor |
| `vidupu` | Answers & Winners | Editor |
| `crossword`, `vemana`, `annamayya`, `tyagayya`, `sameta_kathalu`, `smruti`, `charitardulu`, `acharamulu`, `padam`, `telusa`, `veechika`, `jaabu-javaabu` | Telugu columns, titles to confirm with him | various |

Each column page opens with one plain sentence saying what the column was. *Salutation to your
solution* needs its story told: he explained in the meeting that the Telugu title is a pun —
*Samasyala Thoranam*, a garland of problems, or *Samasyalatho Ranam*, doing battle with them.
That is the kind of detail that makes an archive worth reading.

### 4. Article pages — the modernization proper

Every recovered article becomes **a real HTML page**, not a link to a PDF. Today that is the 14
English pieces whose text extracts cleanly; the eleven "_eng" PDFs set in the legacy font join the
Telugu pipeline below.

- The text as text: selectable, searchable, resizable, readable on a phone, indexable by Google.
- **The original PDF stays, as a "Print this article" link.** He built for print; do not take it
  away.
- Telugu articles set in a proper Telugu face at a size that respects the script, not English
  type with Telugu squeezed into it.

### 5. Two things to revive, not just archive

- **The cube-root and squaring drills** (`srmathclub/cuberoot.html`, `square.html`). They ran on
  CGI scripts that no longer exist. Rebuilt in plain JavaScript they need no server, work
  forever, and are the Medhavadhanam demonstrations turned into something a visitor can *do*.
  Put one on the Vedic Mathematics page. This is "see it, don't read about it" using his own
  material rather than a video.
- **Mathematricks belongs on the Math Tutoring page**, not only in the archive. Twelve years of
  a father-facing maths column, written by him, is the strongest possible answer to a parent
  asking whether he can teach. Each instalment is also a long-tail page for searches like
  "how to teach percentages to a child".

---

## Completeness ledger — every piece of the old site, and where it lives now

The rule Pradeep set on 9 September: **nothing from the old site is lost.** This table is the proof, kept
current. "In" means it is on the new site today. "Held" means it is on disk and waits for one word from
Sreenivas Garu. "Lost" means the Internet Archive never captured it, so only his own backup can supply it.

| Old-site element | Count | Where it lives in the new site | Status |
|---|---|---|---|
| Magazine issues, contents pages | 23 (+2 by name only) | `magazine/issue-*.html`, front door by year | **In** |
| Magazine articles, PDF | 81 recovered of ~485 | linked from issue and column pages; `Print this article` | **In**; 404 pieces **Lost** (see `MISSING.md`) |
| English articles as readable text | 14 | `magazine/read-*.html` | **In** |
| Telugu articles as readable text | 1 drafted of 66 | `/admin` proofreading → `magazine/read-*.html` when approved | **Held** for his approval; the rest one command away |
| Full-issue printable books (`fullbook.pdf`) | 2 | "Print the whole issue" on those issue pages | **In** |
| Issue covers | 5 | issue pages and the front-door cards | **In** |
| Hand-made Telugu column headings | 24 captured of 42 referenced | column pages, above the title, on 31 of 52 columns (added 9 Sep) | **In**; 18 headings **Lost**, never archived |
| Masthead and motto graphics | 2 | archive front door | **In** |
| Other old page graphics | 6 | on disk only (`title`, `motto`, `event_title`, `bk_poster`, `bk_eng_poster`, `new_grows.gif`) | Retired by design: the masthead and motto are **In** from `samghamitra_title.jpg` and `samghamitra_motto.jpg`; the rest were page decoration |
| Contents-list and title art | 2 | `site/magazine/img/indexlist.jpg`, `new_title.jpg`: served, linked from no page | Kept on purpose: `tools/magazine/covers.py` draws both onto the generated issue cards, and silently draws nothing if they are gone. Do not delete |
| Contributor portraits | 5 | column pages, beside the byline (`magazine/img/people/`) | **In**. Until 10 Sep this row said "12, held": those twelve files are the name and heading art in the next three rows, not photographs |
| Telugu contributor names drawn as images | 5 | on disk only (`ramarao`, `nityanand`, `ganapati_master`, `mlgb`, `priyaj`) | **Held**: these five names are on no new page in any form. Type each onto its issue page as text once he confirms the spelling |
| Telugu heading art: dedication, "your suggestions", volume and issue numbers | 5 | on disk only (`ankitam`, `salaha`, `samchika1`, `samputi3`, `sanchika4`) | Retired by design: old contents-page decoration. The volume and issue numbers they show are not on the new issue pages; add them as text if he wants the numbering back |
| English bylines drawn as images | 2 | on disk only (`srini_eng`, `sudhakar_eng`) | Retired: both names are typed on the column pages |
| Homepage slideshow photographs, with captions | 19 | homepage crossfade, four topic cards, Learn and Events galleries, Community Service and Workshops galleries | **In**; one caption neutralised, original **Held** |
| Homepage versions 2006–2025 | 7 | `research/old-site/files-versions/` — source, not pages | Preserved, not republished by design |
| The three doors: Telugu Magazine · English Magazine · Events | 3 | front door: `magazine/telugu.html`, `magazine/english.html` (added 9 Sep), Events is its own page | **In** |
| Event flyers | 4 of 5 | served at `magazine/events/`, linked from no page | **Hidden by decision**: the 7 Sep meeting (43:33) keeps past invitations in storage, not on show; 2007 flyer **Lost** |
| Cube-root and squaring drills | 2 | Learn `#drills`, rebuilt without a server | **In** |
| MathQuiz: rules, 2014 and 2016 rounds, winners | 1 rules page, 2 rounds, 1 scoreboard | on disk; rules text known (first five correct answers score 5–1; 25 points wins a cycle; new cycle from 18 April 2015) | **Held** — the scoreboard names players; reviving the quiz is his call |
| Crossword pages (`src/crossword*.html`) | 2 | stubs pointing at images the archive never kept | **Lost** (the crossword PDFs in the issues are **In**) |
| "Release updates" sign-up form | 1 | not rebuilt; the site's contact form reaches him | **Ask him** whether the subscriber list survives |
| Print-help page | 1 | superseded by one-click "Print the whole issue" | Retired by design |
| Feedback form (`feedback_in.html`) | 1 | not republished | Excluded by design (it was attacked) |
| Mailing address, landlines, old emails | in 27 PDFs and the pages | redacted in served copies; originals untouched | Excluded by design; current WhatsApp number stays |
| Favicon, `Image001.jpg`, `robots.txt`, `sitemap.xml` | 4 | never captured; the new site has its own | **Lost**, nothing of substance |

Anything not in this table is a gap in the ledger, not a decision. Add it.

### Other sources, not the old site

| Source | Count | Where it lives in the new site | Status |
|---|---|---|---|
| His YouTube channel: regular uploads and live-streamed sittings | 69 listed on 10 Sep | Watch, "Every sitting on the channel", written by `tools/channel.py` | **In**; re-run the tool after he uploads |
| His emailed outline (`Sanghamitra_Outline.docx`, 8 Sep; the copy in Downloads) | 4 photographs, 2 Friend Messages | on disk only | **Held**: the 2018 club photograph shows children (his yes); the stage photograph needs his caption; the two Friend Messages need his yes and their numbers |

---

## Filling the gaps from his backup

He said the old issues are on a flash drive somewhere. When it turns up, or when he shares a folder,
the intake below takes it from "a folder of files" to "the gaps on the site are closed" without anyone
placing files by hand.

**The tool:** `tools/magazine/fill.py` — built and tested 9 September against a synthetic backup folder: a
file whose folder said `2008-04` was placed in the April 2008 issue, one in a folder named `Ugadi 2007` was
placed in the name-only 2007 issue, a bare `toranam.pdf` with no folder hint was reported ambiguous with its
candidate issues, and a photograph was reported unknown. `--apply` placed exactly the matches.

```
fill.py --from /path/to/folder            # report: what matches, what is ambiguous, what is unknown
fill.py --gdrive <shared folder link>     # same, after downloading the folder (needs `pip install gdown`)
fill.py --from /path --apply              # copy the matches in, redact, regenerate, report what is still missing
```

**What it wants.** The "wanted" list is derived, never typed: every piece in `site/data/magazine.json`
marked not recovered, plus the name-only 2007 issues, plus the handful of files the archive never kept
(the 2007 flyer, the 2007 Telugu contents pages). `MISSING.md` is the human-readable form of the same list.

**How it matches.** By file name, case-insensitive, because his files were named consistently for twelve
years (`toranam.pdf`, `mathematrix_eng.pdf`). A name that occurs in only one missing issue matches at
once. A name that occurs in several (`toranam.pdf` is missing from twelve issues) is placed only if the
folder it sits in says which issue — an old `srcMMYY` folder name, or a year and month in the path such as
`2008-04`, `April 2008`, `Ugadi 2008`. Otherwise it is listed as **ambiguous**, with the candidate issues,
for a human to place. Nothing is guessed into the wrong issue. Files that match nothing are listed as
**unknown** and left alone; they may be photographs, which have their own captions and their own gate.

**What `--apply` does, in order.** Copy each match into `research/old-site/files/<issue folder>/`, the
same tree the archive copy uses. Run `extract.py`, which copies into `site/magazine/` and **redacts
addresses and phone numbers on the way**, so a file from his drive gets exactly the treatment the archived
ones got. Run `generate.py`, so the "not recovered" marks become links. Print the count filled and the
count still missing. Telugu articles among them go through the same proofreading gate as everything else;
English ones become readable pages on the next run of the text extraction.

**Contents pages count too.** If his backup holds `index42.html`-style pages for the name-only issues, the
same intake places them and the extractor reads them, so those issues gain their tables of contents.

**Photographs are a separate door, on purpose.** New photographs need captions in his words and his
permission per face; they go through the owner console's photo upload, tagged by activity, and land on the
cards and galleries automatically. The intake does not try to caption them.

---

## Recovering the Telugu — the pipeline, and the gate

**The problem, precisely.** The 25 English PDFs extract as clean text today. The 55 Telugu ones
extract as raw glyph codes against an embedded subset font with no Unicode mapping — the Telugu
Lipi software he described buying at 07:42 in the meeting. The letters are real text, not
pixels, which is far better than a scan.

**The route.** Render each page to an image and read it with a vision model; Gemini handled his
Telugu speech accurately in this same project. A one-time glyph-to-Unicode map built from the
embedded font is the exact, repeatable alternative once the first pass proves the value.

**The gate, which is not negotiable.** Nothing recovered gets published until **he has read it**.
Error-free Telugu is what he is proudest of in the whole meeting — elders praised him for it, he
inserted missing letters as images to get *Rushi* right, and he said "putting in so much effort,
I felt satisfied." Publishing a garbled transliteration under his name would undo the one thing
he spent twelve years getting right.

**So build the proofreading surface before the bulk conversion:** in `/admin`, the original page
image beside the recovered text, an edit box, and Approve. One article at a time, at his pace.
Unapproved text never renders on a public page.

---

## Order of work

**First — done, 8 September.** The archive front door, 23 issue pages, 52 column pages, 14 English
articles as HTML, sitemap, footer parity proven. Two shortfalls carried forward: eleven "English" PDFs
are legacy-encoded and remain PDF links; about forty column pages lack a one-line description, which
is his to supply rather than invented.

**Next — done, 9 September.** Personal details redacted in the served copies of all 81 PDFs (89
details, 118 boxes, zero residue on re-read; originals untouched in `research/`; `tools/magazine/redact.py`
also runs on every future copy). The 19 photographs resized to 1,600 px (3.7 MB in total, from 33 MB),
captions in `site/data/photos-archive.json`; 17 of them run as the homepage crossfade at his 8-second /
3-second timing, four replace the stand-in card images (Math Tutoring, Vedic Mathematics, Knowledge
Sharing, Events), and they form galleries on Learn (17, by year) and Events (all 19, by year, 2007–2015).
The SIUE caption ships without the children's names; his original wording is kept in the data file under
`originalCaption` for his review. Masthead graphics on the archive front door; the four flyers under
"Invitations that survived" on Events; **two** 2007 issues (Ugadi, July) as name-only rows — the design
said three, but October 2007 already existed through its English contents page. Community Service and
Workshops keep their honest placeholders: none of the 19 photographs shows either.

**Then — built, 9 September; his verdict pending.** The October 2006 foreword, *మన(సు)లో మాట*, was
read from its page image by Gemini into Unicode Telugu (1,529 characters, no unreadable marks) and sits
as a draft in `site/data/telugu/`. The proofreading surface is live in `/admin`: printed page on the
left, editable Telugu on the right, Save and Approve. The gate is enforced by the API, not the page:
`/api/telugu/<id>` returns text to an anonymous reader only when the status is `approved`, refuses
anonymous writes (401), and an edit after approval drops the text back to unpublished until he approves
again. Proven locally end to end: draft → save → approve → text renders on the public read page → unapprove
→ text gone. One slip already visible in the draft, the column name మేధామాత్రికలు missing a letter twice,
is left for him to correct: that is the demonstration. **His verdict on this one page decides the other 65.**

**Then — the rest, at his pace. Two of four done, 9 September; the same evening the two edition doors and the donation correction below.** The cube-root and squaring drills are
rebuilt in plain JavaScript on Learn (`#drills`): three cubes of whole numbers up to 100 and five numbers
to square, scored on the page, "Try another set", no server — the old srmathclub pages, alive again.
*Mathematricks* is surfaced on Learn (`#mathematricks`): the five recovered instalments linked, the
column page for all 24, framed as the answer to a parent asking whether he can teach. **Bulk Telugu
recovery is one command away and deliberately not run**: `tools/magazine/recover.py <folder/file.pdf …>`
renders, reads, writes the draft and the index, and regenerates; it publishes nothing. It waits on his
verdict for the one page. The release-updates mailing list waits on him too.

**Later, only if he wants it.** The weekly maths question. The archive shows real rules — first five
correct answers score 5, 4, 3, 2, 1, and 25 points takes the cycle — and a real scoreboard through
2016. A good mechanic, and a **standing commitment** for a man who told us three times that time is
his constraint. Offer it; do not assume it.

## Ask him

1. **Do you have the other twelve issues?** `research/old-site/MISSING.md` lists every piece the
   archive never captured, by issue and original file name. He may still have the flash drive.
2. **May the served PDFs be redacted?** Or is he content with his old addresses staying in them.
3. **May we name the contributors, and show their portraits?**
4. **Caption 8 names three children.** Keep it, shorten it, or drop the names.
5. **The magazine ran later than you remembered** — April 2016, Volume 7 Issue 2. Anything after?
6. **Did it begin in 2004?** Volume 1 Issue 1 is October 2004. If 2003 issues existed, they were
   never archived.
7. **The release-updates list.** Does the subscriber list from the old sign-up form still exist?
8. **English titles for the Telugu-only columns**, and one line on what each column was.

## Do not

- Publish any recovered Telugu he has not read.
- Reproduce the old visual design. Take its structure and its names; leave its 2004 HTML behind.
- Present a contents-only issue as though the articles are available.
- Republish the old feedback form. It is the one that was attacked.


## The donation correction, 9 September

The site had asked for money to Sanghamitra: a hero button reading Donate, suggested gift amounts, a
"Money, or time. Both keep the sittings open" page. He said the opposite in the meeting: he has never
accepted a donation (15:16), gifts pressed on performers go entirely to the performers, school fees are
paid to the school, and what he does for people who want to give is point them to organizations he has
personally checked (19:11). The Give page now says exactly that, with three doors: give where he is sure,
sponsor a child's school fees paid direct, volunteer. The hero button reads Give. The suggested-amount and
payment-method blocks are gone from the page; the owner-console plumbing behind them is left intact and
unrendered in case he ever changes his mind. The footer's Donate link is untouched by rule and still
lands on the page, which now explains itself.


## Works of Literature, Friend Messages, and remembered details — 9 September

The Literature card now lands on a real Works of Literature page (`poetry.html`, kept at its address so
nothing breaks): poetry with the Satakam shelf, the magazine with its literature columns and the two
edition doors, and **Friend Messages** with the story he told at 21:27 and an honest empty shelf. That shelf
is a third upload slot in the owner console beside the Satakam and the magazine, so the messages appear in
the order he uploads them without anyone touching code. Every gap he alone can close is a slot he fills.

Returning visitors no longer retype their details (his item 40): name, email, phone and city are kept in
the visitor's own browser only, offered back on the next form with a "Not you? Clear it" link, and never
sent anywhere by themselves.


## A page of its own for Vedic Mathematics — 9 September

He asked at 25:00 that each topic have a page dedicated to one item. Two homepage cards were landing on
`learn.html`: Math Tutoring and Vedic Mathematics. Vedic Mathematics now has `vedic-mathematics.html`,
carrying what belongs to it — the sitting video, the two rebuilt drills, twelve years of *Mathematricks*,
and the seventeen club photographs by year — with the enrolment form left in one place on Learn and linked
from both. Learn is now what its name says: tutoring, SAT and ACT, Telugu, and the form. The card, the
navigation on all sixteen pages, and the sitemap point at the new page.

All seven homepage cards now lead to a page of their own.
