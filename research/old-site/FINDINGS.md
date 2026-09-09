# The old sanghamitra.org, recovered from the Internet Archive

Downloaded 8 September 2026 from the Wayback Machine, at raw fidelity (`id_` URLs, so no
archive banner is baked in). Index: `cdx.txt` · downloader: `fetch.sh` · logs: `fetch*.log`
· the site itself: `files/`.

**Why this matters.** In the 7 September meeting Sreenivas Garu said his magazine issues were
"copied somewhere on a flash drive. I have to search where it is, I haven't found it yet"
(08:51), and treated putting them online as a someday job. They were never lost. The archive
holds them, along with things nobody in the meeting knew still existed.

---

## What is here

| Kind | Count | Notes |
|---|---|---|
| Magazine PDFs | 81 (191 pages) | Across eleven dated issue folders, 2005–2011. Every folder complete. |
| Pages | 50 | Issue index pages in Telugu and English, plus year listings |
| Images | 78 | Issue covers, hand-made Telugu column headers, the editor photograph |
| Event flyers | 4 | Medhavadhanam 2009, the invitation, the 2011 club flyer, an intro flier |
| Interactive tools | 3 | `srmathclub/cuberoot.html`, `square.html`, and their CGI scripts |

## The magazine, issue by issue

Folders are named `src` + month + year. October 2006 is the most complete issue recovered.

| Folder | Issue | Files |
|---|---|---|
| `src` | earliest, undated | 9 incl. `fullbook.pdf` |
| `src105` | January 2005 | 1 |
| `src1005` | October 2005 | 1 |
| `src106` | January 2006 | 8 |
| `src306` | March 2006 | 6 |
| `src706` | July 2006 | 13 |
| `src1006` | October 2006 | 22 incl. `fullbook.pdf` |
| `src1007` | October 2007 | 2 |
| `src408` | April 2008 | 3 |
| `src409` | April 2009 | 6 |
| `src0711` | July 2011 or November 2007 — ambiguous, ask him | 6 |

**Two `fullbook.pdf` files survive.** That is the compiled book format he described at 08:48 —
the one he made so elders could click once and print a whole issue rather than read articles
separately. The October 2006 one is 43 pages.

## The columns, and what they are

Every column he named in the meeting is here. His own descriptions are in the transcript at
the timestamps given.

| File | What it is |
|---|---|
| `toranam` / `toranam_eng` | *Samasyala Thoranam* — the double-meaning title he explained at 05:19: a garland of problems, or fighting with problems |
| `mathematrix` / `mathematrix_eng` | The mathematics column, both languages |
| `crossword` | The crosswords he said the printed book carried (08:48) |
| `jokes` | The jokes he said do not survive translation, which is *why* he split the editions (03:34) |
| `mundumaata`, `tolipaluku` | Foreword and opening word |
| `tudipaluku` / `tudipaluku_eng` | Closing word |
| `vemana`, `annamayya`, `tyagayya` | Classical Telugu poets and composers |
| `sametalu`, `sameta_kathalu` | Proverbs, and stories behind proverbs |
| `balamitra` / `balamitra_eng`, `balabashanam` | For children |
| `smruti`, `charitardulu` | Remembrance, and historical figures |
| `chuddam` / `chuddam_eng`, `telusa` | "Let us see", "Did you know" |
| `acharamulu`, `vaibhavam`, `veekshanam`, `padam`, `veechika` | Customs, glory, review, verse, and a lighter column |
| `jaabu-javaabu` | Letter and reply — the readers' page |
| `podupu`, `cheppukondi` | Riddles |
| `vinnapam`, `sambaraalu`, `dasara_padyam`, `ramanujan`, `cover_story_eng` | One-offs |

Column-name translations are my reading of the Telugu; worth one line of confirmation from him.

## The finding that decides the magazine project

He asked at 50:21 whether the Telugu could be extracted from the old font and made modern
HTML. The answer is **yes, and the route matters**:

- **The 25 English PDFs extract perfectly today.** Clean, readable text. Usable this week.
- **The 55 Telugu PDFs extract as raw glyph codes**, not Telugu letters — bytes like
  `\x01\x02\x03` against an embedded subset font (`TTE1E232D0t00`) carrying no Unicode map.
  This is exactly the Telugu Lipi software he described buying at 07:42, and the reason he had
  to insert missing letters as images.

**This is much better news than a scan.** The letters are real text, not pixels. Three ways to recover them, cheapest first:

1. **Render each page and read it with a vision model.** Gemini read his Telugu speech
   accurately in this same project, and page images avoid the font problem entirely. Fastest
   route to a first draft.
2. **Build a glyph-to-Unicode mapping from the embedded font once**, then convert all 39
   deterministically. More work up front, exact and repeatable after.
3. Telugu OCR. Least accurate; only if the others fail.

Whichever route, **he proofreads before anything is published.** Error-free Telugu is the
thing he is proudest of — "many elders used to appreciate it... putting in so much effort, I
felt satisfied" (08:48). Publishing a garbled transliteration under his name would undo the
one thing he spent years getting right.

## Other recoveries worth knowing about

- **A MathQuiz section** with 2014 and 2016 rounds, rules and a winners list. He never
  mentioned it in the meeting.
- **Working cube-root and squaring pages** backed by CGI scripts — the Medhavadhanam
  demonstrations as an interactive tool. This is the "CGI directory" he asked Pradeep about at
  39:11, and it explains why he asked.
- **The Telugu column-header graphics**, hand-made in the era when the font could not render
  what he wanted. They are the visual identity of the old magazine.
- **`feedback_in.html`** — the feedback form that was attacked, which he described at 32:43.
- **Issue index pages in both languages** (`index62.html` and `index62e.html`, volumes 1–9),
  which confirm his account at 04:56 of combining the languages and then splitting them.

## Answering his own open questions

- Magazine end date: an `April2016_cover.jpg` exists in the archive, which is later than the
  2015 he remembered. Worth asking him.
- The `src0711` folder could be July 2011 or November 2007. He will know.

## Download completeness

214 of 222 archived URLs retrieved (48 MB). **All 81 PDFs and all 78 images are here**, and
every one of the eleven issue folders is complete against the archive's own index.

The eight not retrieved are genuine gaps in the archive itself, returning 404 from the Wayback
Machine rather than failing on our side: the 2007 Medhavadhanam flyer, `index2007.html`,
`Image001.jpg`, one MathQuiz page and its poster image, plus `favicon.ico`, `robots.txt` and
`sitemap.xml`. Nothing of substance is missing. One PDF of the 81 is image-only with no text
layer.

A first pass at one request per second lost 76 files to rate-limiting resets. At one request
per five seconds the retry recovered 68 of the 76. If this is ever repeated, start slow.


## Correction, 8 September evening — the index was fetched at the wrong end of time

The first download took **one capture per address, the earliest**, because the archive query used
`collapse=urlkey`. That fetched the 2006 homepage, the 2013 `indexE`/`indexP`, and so on. Re-listing
every capture (`cdx-all-captures.txt`, 367 captures of 218 addresses) showed only **8 addresses ever
changed**, so little was lost, but one of them was the homepage, with seven versions from 2006 to 2025.
All seven are now in `files-versions/`; the 2023 `indexE`/`indexT`/`indexP` in `files-2023/`; the 2016
`index2007.html`, `index2004/2006`, and the latest MathQuiz winners list in `files-latest/`.

**What the homepage history shows.** 2006–2007: a masthead and "click to view the current issue".
2011: a single photograph with a caption. **2013 onward: a JavaScript fade slideshow** over the
photographs in `slideshow/` — this is the "scrolling pictures below the main screen" he described at
01:25 in the meeting. Three doors: Telugu Magazine, English Magazine, Events. From 2014, the weekly
MathQuiz links. A "release updates" sign-up form throughout.

**The slideshow photographs are on disk**: 19 camera-original files in `files/slideshow/`, 2007 to
2015, most 3000–4000 px wide. These are the photographs the new homepage cards and galleries were
waiting for. Captions recovered from the homepage script are in `slideshow-captions.json`; the 2011
caption names three children by first name, so captions need his review before use.

**Still genuinely absent from the archive** (404 at every capture): `Image001.jpg` (the 2025 masthead
graphic; `new_title.jpg`/`samghamitra_title.jpg` stand in), `Events/Medhavadhanam2007_Flyer.pdf`, and
the April, July and October 2007 Telugu contents pages (`index42/43/44.html`) — so 2007 has three
issues known only by name from `index2007.html`.

**Method note for next time:** list all captures and take the *latest* of each address for pages,
since a page's last version is the one the owner remembers; PDFs and images rarely change, so first
or last makes no difference for them.
