#!/usr/bin/env python3
"""Stage 2: write the archive pages from site/data/magazine.json.
   site/magazine.html                      the front door (issue + column entry points)
   site/magazine/issue-YYYY-MM.html        one per issue, contents exactly as his pages listed them
   site/magazine/column-<key>.html         one per column, every instalment across the years
   site/magazine/read-<folder>-<stem>.html English articles whose text extracts cleanly
Every generated page carries the site header and a footer copied byte-for-byte from magazine.html."""
import json, os, re, html as H, glob
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = os.path.join(ROOT, "site"); MAG = os.path.join(SITE, "magazine"); TEXT = os.path.join(ROOT, "research/old-site/text")
data = json.load(open(os.path.join(SITE, "data/magazine.json"), encoding="utf-8"))
PEOPLE = json.load(open(os.path.join(SITE, "data/magazine-people.json"), encoding="utf-8"))
# Built by tools/magazine/covers.py: a picture for every issue, taken from that issue. Four are
# the archived covers; the rest are a page of the issue, or its own contents-page headings.
COVERS_PATH = os.path.join(SITE, "data/magazine-covers.json")
COVERS = json.load(open(COVERS_PATH, encoding="utf-8")) if os.path.exists(COVERS_PATH) else {}
def cover_of(i): return COVERS.get(i["id"]) or ({"src": f"magazine/img/{i['cover']}", "kind": "cover", "note": ""} if i.get("cover") else None)
issues = data["issues"]; MASTHEAD = data["masthead"]
MONTH = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
esc = lambda s: H.escape(str(s or ""), quote=True)

def not_online(n, noun="piece", where="from this issue"):
    """The placeholder that stands in for pieces we cannot show yet. They stay in
    magazine.json; only the dead rows go. Restored by fill.py from Sreenivasa's backup."""
    if n <= 0: return ""
    return f'<p class="muted">{n} more {noun}{"s" if n != 1 else ""} {where} {"is" if n == 1 else "are"} not online yet.</p>'

# Column display names: English-edition titles first, then the alt text his Telugu pages carried. One-line
# notes only where the meeting or the pages themselves supplied them; nothing else is described.
COLUMNS = {
  "mathematrix":   ("Mathematricks", "The mathematics column, in both languages, by Sreenivasa Ainapurapu."),
  "toranam":       ("Salutation to your solution", "In Telugu, Samasyala Thoranam — a garland of problems, or Samasyalatho Ranam, doing battle with them. He explained the double meaning in the 7 September 2026 meeting."),
  "chuddam":       ("Question Gallery", "The quiz column."),
  "vidupu":        ("Answers & Winners", "Solutions to the previous issue's questions, and who got them right."),
  "balamitra":     ("Kids pages", ""),
  "jokes":         ("Smile if you wish", "The jokes. He kept these in Telugu because, in his words, a joke translated does not sound good."),
  "cover_story":   ("Cover Story", ""),
  "wow":           ("Words of Wisdom", ""),
  "mundumaata":    ("Foreword", "The editor's opening word — 'A word with you' on the Telugu pages."),
  "tolipaluku":    ("A word with you", "The opening word, in the first issue."),
  "tudipaluku":    ("Final word", "The editor's closing word."),
  "jaabu-javaabu": ("Your letters, our responses", "The readers' page."),
  "telusa":        ("Did you know?", ""), "telusaa": ("Did you know?", ""),
  "crossword":     ("Crossword", "Telugu crosswords."),
  "sameta_kathalu":("Derivation of proverbs", "The stories behind Telugu proverbs."), "sameta_katha": ("Derivation of proverbs", ""),
  "sametalu":      ("Proverbs", ""),
  "vemana":        ("Our Vemana's poems", "Verses of the poet Vemana."),
  "annamayya":     ("Annamayya", "A composition of Annamacharya."),
  "tyagayya":      ("Tyagayya", "On the composer Tyagaraja."),
  "padam":         ("People's path and word", ""),
  "charitardulu":  ("Noted people in history", ""), "charitardhulu": ("Noted people in history", ""), "ramanujan": ("Noted people in history", "On Srinivasa Ramanujan."),
  "acharamulu":    ("Our customs and the meaning behind them", ""),
  "smruti":        ("A page in my diary", ""),
  "podupu":        ("Riddles", ""), "cheppukondi": ("Brain teasers", ""),
  "veechika":      ("Thought waves", ""), "veekshanam": ("Overview", ""),
  "vaibhavam":     ("Glory of Andhra Pradesh", ""), "andhra_lakshmi": ("Prosperity of Andhra", ""),
  "nripage":       ("NRI page", ""), "august15": ("NRI page", ""),
  "kavita":        ("Poem", ""), "katha": ("Story", ""), "kathanika": ("Story", ""),
  "dasara":        ("Dasara special", ""), "dasara_padyam": ("Dasara poems", ""),
  "ugaadi":        ("Why do we celebrate Ugadi?", ""), "sambaraalu": ("Happy moments of Sankranti", ""),
  "samkranti-viluvalu": ("Values of the Sankranti celebration", ""),
  "balabashanam":  ("Kids page", ""), "special2009": ("Special 2009", ""), "srivaru": ("Madhuri's husband", ""),
  "shobharaju":    ("Once on a bright evening", ""), "prasnavali": ("Quiz", ""), "vinnapam": ("A request", ""),
  "puzzle1": ("Puzzle", ""), "puzzle2": ("Puzzle", ""), "puzzle3": ("Puzzle", ""),
}
def col_title(key, item=None):
    if key in COLUMNS and COLUMNS[key][0]: return COLUMNS[key][0]
    if item and item.get("title"): return item["title"]
    if item and item.get("title_alt"): return re.sub(r"\s*src=.*$", "", item["title_alt"]).strip().capitalize()
    return key.replace("_", " ").title()

def issue_label(i):  # "Vijaya Dasami 2006" the way his masthead named them, plus the calendar month.
    season = i["season"] or MONTH[i["month"]]
    return f"{season} {i['year']}"
def issue_sub(i):
    v = f" · Volume {i['volume']}, Issue {i['issueNo']}" if i.get("volume") else ""
    return f"{MONTH[i['month']]} {i['year']}{v}"

# --- shared chrome, taken from the live magazine.html so the footer is byte-identical ---
tpl = open(os.path.join(SITE, "magazine.html"), encoding="utf-8").read()
HEAD_END = tpl.index("<main"); FOOT_START = tpl.index('<footer class="site-footer">')
header_src = tpl[:HEAD_END]; footer_src = tpl[FOOT_START:]
assert 'class="site-footer"' in footer_src and "</footer>" in footer_src

def chrome(depth, title, desc, canonical):
    up = "../" * depth
    h = header_src
    h = re.sub(r"<title>.*?</title>", f"<title>{esc(title)}</title>", h, flags=re.S)
    h = re.sub(r'(<meta name="description" content=")[^"]*(")', lambda m: m.group(1) + esc(desc) + m.group(2), h)
    h = re.sub(r'(<meta property="og:title" content=")[^"]*(")', lambda m: m.group(1) + esc(title) + m.group(2), h)
    h = re.sub(r'(<meta property="og:description" content=")[^"]*(")', lambda m: m.group(1) + esc(desc) + m.group(2), h)
    h = re.sub(r'(<meta property="og:url" content=")[^"]*(")', lambda m: m.group(1) + esc(canonical) + m.group(2), h)
    if depth:  # pages under magazine/: one <base> tag, so header, footer and every relative link stay
        h = h.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  <base href="/">', 1)  # byte-identical to the root pages
    return h, footer_src

def page(depth, title, desc, canonical, body):
    h, f = chrome(depth, title, desc, canonical)
    return h + body + "\n        " + f

os.makedirs(MAG, exist_ok=True)
written = []

# --- English article pages, from the extracted text ---
def article_html(text):
    paras = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    out = []
    # The PDF's running header ("Sanghamitra   Mathematrix   October 2006 Issue") lands as a
    # paragraph at every page break; a line that is only masthead + month + "Issue" is dropped.
    header = re.compile(r"^\s*Sanghamitra\b.{0,160}?\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\s*Issue\s*$", re.I)
    for p in paras:
        lines = [l.strip() for l in p.split("\n") if l.strip() and not header.match(l)]
        if not lines: continue
        joined = " ".join(lines)
        if len(joined) < 60 and not joined.endswith((".", "?", "!", ":")): out.append(f"<h2>{esc(joined)}</h2>")
        else: out.append(f"<p>{esc(joined)}</p>")
    return "\n".join(out)
article_pages = {}
for i in issues:
    for it in i["items"]:
        tf = os.path.join(TEXT, it["file"].replace("/", "__").replace(".pdf", ".txt"))
        if not (it["available"] and it["lang"] == "en" and os.path.exists(tf)): continue
        stem = re.sub(r"\.pdf$", "", os.path.basename(it["file"]), flags=re.I)
        name = f"read-{i['folder']}-{stem}.html"
        t = col_title(it["column"], it); who = it.get("contributor") or ""
        title = f"{t} · {issue_label(i)} · Sanghamitra magazine"
        body = f"""<main class="section">
    <div class="wrap">
      <p class="kicker"><a href="magazine/issue-{i['id']}.html">{esc(issue_label(i))}</a> · <a href="magazine/column-{esc(it['column'])}.html">{esc(t)}</a></p>
      <h1>{esc(t)}</h1>
      <p class="muted">{esc(issue_sub(i))}{(' · by ' + esc(who)) if who else ''}. From the Sanghamitra online magazine.</p>
      <article class="magazine-article">
{article_html(open(tf, encoding='utf-8').read())}
      </article>
      <div class="actions">
        <a class="btn btn-primary" href="magazine/{esc(it['file'])}" target="_blank" rel="noopener">Print this article (original PDF)</a>
        <a class="btn btn-ghost" href="magazine/issue-{i['id']}.html">The whole issue</a>
        <a class="btn btn-ghost" href="magazine/column-{esc(it['column'])}.html">All of {esc(t)}</a>
      </div>
      <p class="muted">The text above was extracted from the original PDF as published. If something reads wrongly, the PDF is the authority.</p>
    </div>
  </main>
"""
        open(os.path.join(MAG, name), "w", encoding="utf-8").write(page(1, title, f"{t}, {issue_sub(i)}, from the Sanghamitra magazine.", f"https://sanghamitra.pages.dev/magazine/{name}", body))
        article_pages[it["file"]] = name; written.append(f"magazine/{name}")


# --- Telugu article pages: the shell is static, the text is fetched and shown only once he has approved it ---
TE = os.path.join(SITE, "data/telugu")
for tf in sorted(glob.glob(os.path.join(TE, "*.json"))):
    if os.path.basename(tf) == "index.json": continue
    rec = json.load(open(tf, encoding="utf-8"))
    iss = next((i for i in issues if i["id"] == rec["issue"]), None)
    if not iss: continue
    it = next((x for x in iss["items"] if x["file"] == rec["file"]), None)
    name = f"read-{rec['id']}.html"; t = rec.get("titleEn") or col_title(rec["column"]); label = issue_label(iss)
    pages_html = "".join(f'<a class="page-image" href="{esc(pg)}" target="_blank" rel="noopener"><img src="{esc(pg)}" alt="The original printed page" loading="lazy"></a>' for pg in rec["pages"])
    body = f"""<main class="section">
    <div class="wrap">
      <p class="kicker"><a href="magazine/issue-{iss['id']}.html">{esc(label)}</a> · <a href="magazine/column-{esc(rec['column'])}.html">{esc(t)}</a></p>
      <h1 lang="te">{esc(rec['titleTe'])}</h1>
      <p class="muted">{esc(t)} · {esc(issue_sub(iss))}{(' · by ' + esc(rec['contributor'])) if rec.get('contributor') else ''}. From the Sanghamitra online magazine.</p>
      <div class="te-article-wrap" data-telugu="{esc(rec['id'])}">
        <article class="te-article" lang="te" data-telugu-text hidden></article>
        <p class="notice" data-telugu-pending>This page is being proofread by Sreenivasa. The Telugu was set in an old font, so it was read by machine and he checks every line before it appears here. Until then, the original is the article.</p>
        <div class="page-images">{pages_html}</div>
      </div>
      <div class="actions">
        <a class="btn btn-primary" href="magazine/{esc(rec['file'])}" target="_blank" rel="noopener">Print this article (original PDF)</a>
        <a class="btn btn-ghost" href="magazine/issue-{iss['id']}.html">The whole issue</a>
        <a class="btn btn-ghost" href="magazine/column-{esc(rec['column'])}.html">All of {esc(t)}</a>
      </div>
    </div>
  </main>
"""
    open(os.path.join(MAG, name), "w", encoding="utf-8").write(page(1, f"{rec['titleTe']} · {label} · Sanghamitra magazine", f"{t}, {issue_sub(iss)}, from the Sanghamitra magazine, in Telugu.", f"https://sanghamitra.pages.dev/magazine/{name}", body))
    article_pages[rec["file"]] = name; written.append(f"magazine/{name}")

# --- issue pages ---
def item_row(i, it):
    t = col_title(it["column"], it); who = it.get("contributor")
    lang = "English" if it["lang"] == "en" else "Telugu"
    if it["file"] in article_pages:
        link = f'<a href="magazine/{article_pages[it["file"]]}">{esc(t)}</a> <span class="tag">read online</span>'
    elif it["available"]:
        link = f'<a href="magazine/{esc(it["file"])}" target="_blank" rel="noopener">{esc(t)}</a> <span class="tag">PDF</span>'
    else:
        return ""
    return f'<li><span class="lang-mark" title="{lang}">{lang[:2]}</span> {link}{(" <span class=\"muted\">· " + esc(who) + "</span>") if who else ""}</li>'

for idx, i in enumerate(issues):
    name = f"issue-{i['id']}.html"; label = issue_label(i)
    te = [x for x in i["items"] if x["lang"] == "te"]; en = [x for x in i["items"] if x["lang"] == "en"]
    avail = sum(1 for x in i["items"] if x["available"])
    newer = issues[idx - 1] if idx > 0 else None; older = issues[idx + 1] if idx + 1 < len(issues) else None
    c = cover_of(i)
    cover = (f'<a class="library-cover" href="{esc(c["src"])}"><img src="{esc(c["src"])}" alt="{esc(c["note"] or ("Cover of the " + label + " issue"))}" loading="lazy"></a>'
             f'<p class="muted cover-note">{esc(c["note"])}</p>') if c else ""
    if i.get("nameOnly"):
        state = "<p class=\"notice\">Only the name of this issue is known. If you have a copy, Sreenivasa would like to hear from you.</p>"
    else:
        state = ("" if avail else f"<p class=\"notice\">None of this issue's pieces are online yet. If you have a copy, Sreenivasa would like to hear from you.</p>")
    fullbook = f'<a class="btn btn-primary" href="magazine/{i["folder"]}/fullbook.pdf" target="_blank" rel="noopener">Print the whole issue</a>' if i["fullbook"] else ""
    def section(title, rows):
        if not rows: return ""
        lis = [r for r in (item_row(i, x) for x in rows) if r]
        gap = not_online(len(rows) - len(lis))
        if not lis: return f"<h2>{title}</h2>\n{gap}"
        return f"<h2>{title}</h2>\n<ol class=\"contents\">\n" + "\n".join(lis) + f"\n</ol>\n{gap}"
    body = f"""<main class="section">
    <div class="wrap">
      <p class="kicker"><a href="magazine.html">Sanghamitra magazine</a></p>
      <h1>{esc(label)}</h1>
      <p class="lede">{esc(issue_sub(i))}. {esc(MASTHEAD).capitalize()}.</p>
      <div class="issue-grid">
        <div>
          {state}
          {section("In Telugu", te)}
          {section("In English", en)}
          <div class="actions">
            {fullbook}
            {'<a class="btn btn-ghost" href="magazine/issue-' + newer['id'] + '.html">Newer: ' + esc(issue_label(newer)) + '</a>' if newer else ''}
            {'<a class="btn btn-ghost" href="magazine/issue-' + older['id'] + '.html">Older: ' + esc(issue_label(older)) + '</a>' if older else ''}
          </div>
        </div>
        <aside>{cover}</aside>
      </div>
    </div>
  </main>
"""
    open(os.path.join(MAG, name), "w", encoding="utf-8").write(page(1, f"{label} · Sanghamitra magazine", f"Contents of the {label} issue of the Sanghamitra online magazine.", f"https://sanghamitra.pages.dev/magazine/{name}", body))
    written.append(f"magazine/{name}")

# --- column pages ---
cols = {}
for i in issues:
    for it in i["items"]:
        cols.setdefault(it["column"], []).append((i, it))
col_pages = {}
for key, rows in cols.items():
    name = f"column-{key}.html"; t = col_title(key, rows[0][1]); note = COLUMNS.get(key, ("", ""))[1]
    rows.sort(key=lambda r: (r[0]["year"], r[0]["month"]), reverse=True)
    lis = []
    for i, it in rows:
        lang = "English" if it["lang"] == "en" else "Telugu"; lbl = f"{issue_label(i)} · {lang}"
        if it["file"] in article_pages: link = f'<a href="magazine/{article_pages[it["file"]]}">{esc(lbl)}</a> <span class="tag">read online</span>'
        elif it["available"]: link = f'<a href="magazine/{esc(it["file"])}" target="_blank" rel="noopener">{esc(lbl)}</a> <span class="tag">PDF</span>'
        else: continue
        lis.append(f'<li><span class="lang-mark" title="{lang}">{lang[:2]}</span> {link}{(" <span class=\"muted\">· " + esc(it["contributor"]) + "</span>") if it.get("contributor") else ""}</li>')
    n_av = sum(1 for _, it in rows if it["available"])
    heads = [it.get("heading_img") for _, it in rows if it.get("heading_img") and os.path.exists(os.path.join(MAG, "img", it["heading_img"]))]
    heading = f'<img class="column-heading" src="magazine/img/{esc(heads[0])}" alt="{esc(t)}, the heading as he set it in the magazine" loading="lazy">' if heads else ""
    # The writer's name as he set it in Telugu. On the Telugu pages a byline was an image, because the
    # font of the day could not render it; those little name graphics survive and belong beside the name.
    who_name = next((it.get("contributor") for _, it in rows if it.get("contributor")), None)
    byline = ""
    if who_name and who_name in PEOPLE and os.path.exists(os.path.join(MAG, "img", "people", PEOPLE[who_name])):
        byline = (f'<p class="byline"><img src="magazine/img/people/{esc(PEOPLE[who_name])}" '
                  f'alt="{esc(who_name)}, his name as it was set in Telugu" loading="lazy">'
                  f'<span>{esc(who_name)}</span></p>')
    body = f"""<main class="section">
    <div class="wrap">
      <p class="kicker"><a href="magazine.html">Sanghamitra magazine</a> · by column</p>
      {heading}
      <h1>{esc(t)}</h1>
      {byline}
      <p class="lede">{esc(note) if note else ''}</p>
      <p class="muted">{len(lis)} instalment{'s' if len(lis) != 1 else ''} you can read here.</p>
      <ol class="contents">
{chr(10).join(lis)}
      </ol>
      {not_online(len(rows) - len(lis), "instalment", "of this column")}
      <div class="actions"><a class="btn btn-ghost" href="magazine.html#columns">All columns</a></div>
    </div>
  </main>
"""
    open(os.path.join(MAG, name), "w", encoding="utf-8").write(page(1, f"{t} · Sanghamitra magazine", f"Every instalment of {t} from the Sanghamitra online magazine, 2004 to 2016.", f"https://sanghamitra.pages.dev/magazine/{name}", body))
    col_pages[key] = (name, t, len(rows), n_av); written.append(f"magazine/{name}")


# --- The two doors his old homepage had: Telugu Magazine and English Magazine ---
for lang, fname, title, intro in (
    ("te", "telugu.html", "తెలుగు సంచికలు · The Telugu edition", "Every issue's Telugu pieces, newest first. The magazine began bilingual in 2004 and from October 2007 ran a separate Telugu edition, because a joke in Telugu does not survive translation."),
    ("en", "english.html", "The English edition", "Every issue's English pieces, newest first. The English edition began as Volume 1, Issue 1 in October 2007, when the two languages were split."),
):
    secs = []
    for i in issues:
        its = [x for x in i["items"] if x["lang"] == lang]
        if not its: continue
        lis = [r for r in (item_row(i, x) for x in its) if r]
        if not lis: continue
        secs.append(f'<section class="year-group"><h2><a href="magazine/issue-{i["id"]}.html">{esc(issue_label(i))}</a> <span class="muted">· {len(lis)} piece{"s" if len(lis) != 1 else ""}</span></h2><ol class="contents">{chr(10).join(lis)}</ol></section>')
    body = f"""<main class="section">
    <div class="wrap">
      <p class="kicker"><a href="magazine.html">Sanghamitra magazine</a> · by edition</p>
      <h1{' lang="te"' if lang == 'te' else ''}>{esc(title)}</h1>
      <p class="lede">{esc(intro)}</p>
      <div class="actions"><a class="btn btn-ghost" href="magazine/{'english.html' if lang == 'te' else 'telugu.html'}">{'The English edition' if lang == 'te' else 'The Telugu edition'}</a><a class="btn btn-ghost" href="magazine.html#columns">By column</a></div>
      {"".join(secs)}
    </div>
  </main>
"""
    open(os.path.join(MAG, fname), "w", encoding="utf-8").write(page(1, f"{title} · Sanghamitra magazine", intro, f"https://sanghamitra.pages.dev/magazine/{fname}", body))
    written.append(f"magazine/{fname}")

# --- the front door: rewrite magazine.html's <main> only; header and footer untouched ---
years = {}
for i in issues: years.setdefault(i["year"], []).append(i)
year_blocks = []
for y in sorted(years, reverse=True):
    cards = []
    for i in years[y]:
        avail = sum(1 for x in i["items"] if x["available"]); label = issue_label(i)
        c = cover_of(i)
        cov = f'<img src="{esc(c["src"])}" alt="" loading="lazy">' if c else f'<span class="cover-word" lang="te" aria-hidden="true">సంఘమిత్ర</span>'
        cards.append(f"""<a class="issue-card{'' if avail else ' issue-contents-only'}" href="magazine/issue-{i['id']}.html">
          <span class="issue-cover">{cov}</span>
          <strong>{esc(label)}</strong>
          <span class="muted">{esc(MONTH[i['month']])} · {('name only' if i.get('nameOnly') else (str(avail) + ' piece' + ('s' if avail != 1 else '')) if avail else 'not online yet')}</span>
        </a>""")
    year_blocks.append(f'<section class="magazine-year" id="y{y}"><h2>{y}</h2><div class="issue-grid-cards">{"".join(cards)}</div></section>')
top_cols = sorted(((k, v) for k, v in col_pages.items() if v[3]), key=lambda kv: -kv[1][3])
def col_li(n, t, c, a): return f'<li><a href="magazine/{n}">{esc(t)}</a> <span class="muted">· {a} instalment{"s" if a != 1 else ""}</span></li>'
col_lis = "\n".join(col_li(n, t, c, a) for k, (n, t, c, a) in top_cols if a > 1)
one_offs = "\n".join(col_li(n, t, c, a) for k, (n, t, c, a) in top_cols if a == 1)
n_iss = len(issues); n_items = sum(len(i["items"]) for i in issues); n_avail = sum(1 for i in issues for x in i["items"] if x["available"])
n_read = sum(1 for i in issues if any(x["available"] for x in i["items"]))
main_new = f"""<main class="section">
    <div class="wrap">
      <p class="kicker">2004–2016 · సంఘమిత్ర</p>
      <div class="old-masthead" aria-label="The magazine’s original masthead">
        <img src="magazine/img/samghamitra_title.jpg" alt="సంఘమిత్ర, the magazine’s title as he set it" loading="lazy">
        <img src="magazine/img/samghamitra_motto.jpg" alt="విజ్ఞాన, వినోద, వికాస త్రైమాసిక పత్రిక — a quarterly for knowledge, entertainment and progress" loading="lazy">
      </div>
      <h1>Sanghamitra’s online quarterly.</h1>
      <p class="lede">{esc(MASTHEAD).capitalize()} — that was the line on every masthead. It ran from October 2004 to April 2016, at first with Telugu and English side by side, then from October 2007 as separate Telugu and English editions, because a joke in Telugu does not survive translation.</p>
      <p>{n_avail} pieces you can read, from {n_read} issues between 2004 and 2016, in Telugu and English. More of the magazine is still to come online; if you have copies, Sreenivasa would like to hear from you.</p>
      <div class="actions">
        <a class="btn btn-primary" href="magazine/telugu.html" lang="te">తెలుగు సంచికలు</a>
        <a class="btn btn-primary" href="magazine/english.html">English edition</a>
        <a class="btn btn-dark" href="#issues">By issue</a>
        <a class="btn btn-dark" href="#columns">By column</a>
      </div>

      <h2 id="columns">By column</h2>
      <p class="muted">Every instalment of a column, across all the years, on one page.</p>
      <ul class="column-list">
{col_lis}
      </ul>
      <details class="one-offs"><summary>One-off pieces</summary><ul class="column-list">
{one_offs}
      </ul></details>

      <h2 id="issues">By issue</h2>
      <p class="muted">Named the way he named them: Sankranti in January, Ugadi in spring, July, and Vijaya Dasami in October. Four covers survive. Where one does not, the picture is a page of that issue, or the column headings its contents page carried.</p>
      {"".join(year_blocks)}

      <h2>Issues published since</h2>
      <div id="magazine-shelf"></div>
      <p data-library-empty="magazine">Anything Sreenivasa publishes from the owner console appears here.</p>
      <div class="actions">
        <a class="btn btn-ghost" href="contact.html">Something wrong on this page?</a>
        <a class="btn btn-ghost" href="about.html#work">What Sanghamitra does</a>
      </div>
    </div>
  </main>
"""
front = tpl[:HEAD_END] + main_new + "        " + footer_src
desc = f"Sanghamitra’s online quarterly magazine, 2004 to 2016: {n_avail} pieces to read across {n_read} issues, in Telugu and English."
front = re.sub(r'(<meta (?:name="description"|property="og:description") content=")[^"]*(")',
               lambda m: m.group(1) + H.escape(desc, quote=True) + m.group(2), front)
open(os.path.join(SITE, "magazine.html"), "w", encoding="utf-8").write(front)
print(f"wrote magazine.html + {len(written)} pages: {sum(1 for w in written if '/read-' in w)} articles, {sum(1 for w in written if '/issue-' in w)} issues, {sum(1 for w in written if '/column-' in w)} columns")
