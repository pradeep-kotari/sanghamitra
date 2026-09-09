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
issues = data["issues"]; MASTHEAD = data["masthead"]
MONTH = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
esc = lambda s: H.escape(str(s or ""), quote=True)

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
      <p class="muted">{esc(issue_sub(i))}{(' · by ' + esc(who)) if who else ''}. From the Sanghamitra online magazine, recovered from the Internet Archive.</p>
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
        link = f'<span class="muted">{esc(t)}</span> <span class="tag tag-missing">not recovered</span>'
    return f'<li><span class="lang-mark" title="{lang}">{lang[:2]}</span> {link}{(" <span class=\"muted\">· " + esc(who) + "</span>") if who else ""}</li>'

for idx, i in enumerate(issues):
    name = f"issue-{i['id']}.html"; label = issue_label(i)
    te = [x for x in i["items"] if x["lang"] == "te"]; en = [x for x in i["items"] if x["lang"] == "en"]
    avail = sum(1 for x in i["items"] if x["available"])
    newer = issues[idx - 1] if idx > 0 else None; older = issues[idx + 1] if idx + 1 < len(issues) else None
    cover = f'<a class="library-cover" href="magazine/img/{esc(i["cover"])}"><img src="magazine/img/{esc(i["cover"])}" alt="Cover of the {esc(label)} issue" loading="lazy"></a>' if i["cover"] else ""
    if i.get("nameOnly"):
        state = "<p class=\"notice\">Only the name of this issue survives, from the 2007 year listing. Neither its contents page nor its articles were ever captured by the Internet Archive. If you have a copy, Sreenivasa would like to hear from you.</p>"
    else:
        state = ("" if avail else f"<p class=\"notice\">The contents of this issue survive; its articles do not. The Internet Archive never captured this issue's files. If you have them, Sreenivasa would like to hear from you.</p>")
    fullbook = f'<a class="btn btn-primary" href="magazine/{i["folder"]}/fullbook.pdf" target="_blank" rel="noopener">Print the whole issue</a>' if i["fullbook"] else ""
    def section(title, rows):
        return f"<h2>{title}</h2>\n<ol class=\"contents\">\n" + "\n".join(item_row(i, x) for x in rows) + "\n</ol>" if rows else ""
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
        else: link = f'<a class="muted" href="magazine/issue-{i["id"]}.html">{esc(lbl)}</a> <span class="tag tag-missing">not recovered</span>'
        lis.append(f'<li><span class="lang-mark" title="{lang}">{lang[:2]}</span> {link}{(" <span class=\"muted\">· " + esc(it["contributor"]) + "</span>") if it.get("contributor") else ""}</li>')
    n_av = sum(1 for _, it in rows if it["available"])
    body = f"""<main class="section">
    <div class="wrap">
      <p class="kicker"><a href="magazine.html">Sanghamitra magazine</a> · by column</p>
      <h1>{esc(t)}</h1>
      <p class="lede">{esc(note) if note else ''}</p>
      <p class="muted">{len(rows)} instalment{'s' if len(rows) != 1 else ''} across the issues, {n_av} recovered.</p>
      <ol class="contents">
{chr(10).join(lis)}
      </ol>
      <div class="actions"><a class="btn btn-ghost" href="magazine.html#columns">All columns</a></div>
    </div>
  </main>
"""
    open(os.path.join(MAG, name), "w", encoding="utf-8").write(page(1, f"{t} · Sanghamitra magazine", f"Every instalment of {t} from the Sanghamitra online magazine, 2004 to 2016.", f"https://sanghamitra.pages.dev/magazine/{name}", body))
    col_pages[key] = (name, t, len(rows), n_av); written.append(f"magazine/{name}")

# --- the front door: rewrite magazine.html's <main> only; header and footer untouched ---
years = {}
for i in issues: years.setdefault(i["year"], []).append(i)
year_blocks = []
for y in sorted(years, reverse=True):
    cards = []
    for i in years[y]:
        avail = sum(1 for x in i["items"] if x["available"]); label = issue_label(i)
        cov = f'<img src="magazine/img/{esc(i["cover"])}" alt="" loading="lazy">' if i["cover"] else f'<span class="cover-word" lang="te" aria-hidden="true">సంఘమిత్ర</span>'
        cards.append(f"""<a class="issue-card{'' if avail else ' issue-contents-only'}" href="magazine/issue-{i['id']}.html">
          <span class="issue-cover">{cov}</span>
          <strong>{esc(label)}</strong>
          <span class="muted">{esc(MONTH[i['month']])} · {('name only' if i.get('nameOnly') else str(len(i['items'])) + ' pieces' + ((' · ' + str(avail) + ' recovered') if avail else ' · contents only'))}</span>
        </a>""")
    year_blocks.append(f'<section class="magazine-year" id="y{y}"><h2>{y}</h2><div class="issue-grid-cards">{"".join(cards)}</div></section>')
top_cols = sorted(col_pages.items(), key=lambda kv: -kv[1][2])
def col_li(n, t, c, a): return f'<li><a href="magazine/{n}">{esc(t)}</a> <span class="muted">· {c} instalment{"s" if c != 1 else ""}{(", " + str(a) + " recovered") if a else ""}</span></li>'
col_lis = "\n".join(col_li(n, t, c, a) for k, (n, t, c, a) in top_cols if c > 1)
one_offs = "\n".join(col_li(n, t, c, a) for k, (n, t, c, a) in top_cols if c == 1)
n_iss = len(issues); n_items = sum(len(i["items"]) for i in issues); n_avail = sum(1 for i in issues for x in i["items"] if x["available"])
main_new = f"""<main class="section">
    <div class="wrap">
      <p class="kicker">2004–2016 · సంఘమిత్ర</p>
      <div class="old-masthead" aria-label="The magazine’s original masthead">
        <img src="magazine/img/samghamitra_title.jpg" alt="సంఘమిత్ర, the magazine’s title as he set it" loading="lazy">
        <img src="magazine/img/samghamitra_motto.jpg" alt="విజ్ఞాన, వినోద, వికాస త్రైమాసిక పత్రిక — a quarterly for knowledge, entertainment and progress" loading="lazy">
      </div>
      <h1>Sanghamitra’s online quarterly.</h1>
      <p class="lede">{esc(MASTHEAD).capitalize()} — that was the line on every masthead. It ran from October 2004 to April 2016, at first with Telugu and English side by side, then from October 2007 as separate Telugu and English editions, because a joke in Telugu does not survive translation.</p>
      <p>{n_iss} issues, two of them known only by name. {n_items} pieces listed in his own tables of contents, of which {n_avail} have been recovered from the Internet Archive and can be read here. The rest are named honestly and marked as not recovered.</p>
      <div class="actions">
        <a class="btn btn-primary" href="#issues">Browse by issue</a>
        <a class="btn btn-dark" href="#columns">Browse by column</a>
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
      <p class="muted">Named the way he named them: Sankranti in January, Ugadi in spring, July, and Vijaya Dasami in October.</p>
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
front = front.replace('content="Sanghamitra’s online quarterly magazine for knowledge, wisdom, and fun ran from 2003 to 2011, with a final issue in 2015."',
                      f'content="Sanghamitra’s online quarterly magazine, 2004 to 2016: {n_iss} issues, {n_avail} pieces recovered and readable, in Telugu and English."')
open(os.path.join(SITE, "magazine.html"), "w", encoding="utf-8").write(front)
print(f"wrote magazine.html + {len(written)} pages: {sum(1 for w in written if '/read-' in w)} articles, {sum(1 for w in written if '/issue-' in w)} issues, {sum(1 for w in written if '/column-' in w)} columns")
