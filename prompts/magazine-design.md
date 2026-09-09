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

**Then — the rest, at his pace.** Bulk recovery through his queue; the cube-root and squaring drills
rebuilt in plain JavaScript on the Vedic Mathematics page; Mathematricks surfaced on the Math Tutoring
page; the release-updates mailing list, if it exists, told first.

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
