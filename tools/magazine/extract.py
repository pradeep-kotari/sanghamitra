#!/usr/bin/env python3
"""Stage 1: read the recovered old-site index pages and write site/data/magazine.json.
Nothing here invents content: every title, contributor and file comes off his own pages.
Run from the repo root: .venv-whisper/bin/python tools/magazine/extract.py"""
import re, json, html, glob, os, shutil, collections, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OLD = os.path.join(ROOT, "research/old-site/files")
SITE = os.path.join(ROOT, "site")
OUT_JSON = os.path.join(SITE, "data/magazine.json")
ASSET_DIR = os.path.join(SITE, "magazine")

MONTHS = {m: i for i, m in enumerate(["January","February","March","April","May","June","July","August","September","October","November","December"], 1)}
SEASON = {1: "Sankranti", 3: "Ugadi", 4: "Ugadi", 7: "July", 10: "Vijaya Dasami"}
# Contributor images on the Telugu pages → names, only where the English pages confirm the name.
CONTRIB_IMG = {"editor.jpg": "Editor", "vaasanti.jpg": "Vaasanti Maghapu", "srini.jpg": "Sreenivasa Ainapurapu",
               "srini_eng.jpg": "Sreenivasa Ainapurapu",
               # Five more writers, whose names exist only as the Telugu graphics he set. Typed from those
               # graphics on 10 Sep 2026 (no English page names them), approved by Pradeep the same day.
               "ramarao.jpg": "కీర్తిశేషులు ఎ.వి.ఎన్.రామారావు", "nityanand.jpg": "నిత్యానంద్",
               "ganapati_master.jpg": "ముసునూరి లక్ష్మీగణపతిశాస్త్రి",
               "mlgb.jpg": "శ్రీమతి మాచిరాజు లక్ష్మీ గంగా భవాని", "priyaj.jpg": "కీ॥ శే॥ శ్రీమతి ప్రియ జ్యోశ్యుల"}
COVERS = {"src1006": "cover1006.jpg", "src0711": "cover0711.JPG", "src0416": "April2016_cover.jpg", "src107": "sankranti07_cover.jpg"}

def folder_date(folder):
    """src1006 → (2006, 10); src105 → (2005, 1); src0711 → (2011, 7); src → None."""
    m = re.fullmatch(r"src(\d{3,4})", folder)
    if not m: return None
    n = m.group(1)
    mo, yr = (int(n[:2]), int(n[2:])) if len(n) == 4 else (int(n[0]), int(n[1:]))
    return (2000 + yr, mo)

def text_of(s):
    t = re.sub(r"<script.*?</script>|<style.*?</style>", "", s, flags=re.S | re.I)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", t))).strip()

pages = {}
for p in sorted(glob.glob(os.path.join(OLD, "index*.html"))):
    n = os.path.basename(p)
    if not re.fullmatch(r"index\d+e?\.html", n): continue
    raw = open(p, encoding="utf-8", errors="replace").read()
    flat = re.sub(r"[\r\n]+", " ", raw)
    lang = "en" if n.endswith("e.html") else "te"
    t = text_of(raw)
    d = re.search(r"(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})", t)
    vol = re.search(r"Volume\s*(\d+).{0,30}?Issue\s*(\d+)", t, re.I)
    items = []
    # English: <a href="src/x.pdf"><font>Title</font></a><font color=red> Contributor</font>
    for m in re.finditer(r'<a\s+href="?(src[0-9]*/[^">\s]+)"?[^>]*>\s*(?:<font[^>]*>)?\s*([^<]*?)\s*(?:</font>)?\s*</a>(?:\s*<font[^>]*>\s*([^<]*?)\s*</font>)?', flat, re.I):
        href, title, who = m.group(1), m.group(2).strip(), (m.group(3) or "").strip()
        if title: items.append({"file": href, "title": title, "contributor": who or None, "src": "text"})
    # Telugu: <a href="src/x.pdf"><img alt="English name" src="images/heading.jpg"></a><img src="images/who.jpg">
    for m in re.finditer(r'<a\s+href="?(src[0-9]*/[^">\s]+)"?[^>]*>\s*<img[^>]*?>(?:\s*</a>)?(?:\s*<img\s+[^>]*src="?images/([^">\s]+)"?[^>]*>)?', flat, re.I):
        href = m.group(1); tag = m.group(0)
        alt = re.search(r'alt="?([^">]*)"?', tag, re.I)
        head = re.search(r'src="?images/([^">\s]+)"?', tag, re.I)
        who_img = m.group(2)
        if not alt and not head: continue
        items.append({"file": href, "title": (alt.group(1).strip() if alt else ""), "heading_img": head.group(1) if head else None,
                      "contributor": CONTRIB_IMG.get((who_img or "").lower(), None), "contributor_img": who_img, "src": "image"})
    folders = collections.Counter(i["file"].split("/")[0] for i in items)
    pages[n] = {"lang": lang, "date": (MONTHS[d.group(1)], int(d.group(2))) if d else None,
                "volume": int(vol.group(1)) if vol else None, "issueNo": int(vol.group(2)) if vol else None,
                "items": items, "folders": folders}

# Group pages into issues by their own folder (the folder that most of the page's links point into).
issues = {}
for n, pg in pages.items():
    if not pg["folders"]: continue
    folder = pg["folders"].most_common(1)[0][0]
    fd = folder_date(folder) or ((pg["date"][1], pg["date"][0]) if pg["date"] else None)
    if not fd: continue
    yr, mo = fd
    iss = issues.setdefault(folder, {"id": f"{yr}-{mo:02d}", "folder": folder, "year": yr, "month": mo,
                                     "season": SEASON.get(mo, ""), "volume": None, "issueNo": None,
                                     "pages": {}, "items": {}})
    iss["pages"][pg["lang"]] = n
    if pg["volume"]: iss["volume"], iss["issueNo"] = pg["volume"], pg["issueNo"]
    for it in pg["items"]:
        if it["file"].split("/")[0] != folder: continue   # "previously published" links belong to other issues
        key = it["file"]
        cur = iss["items"].setdefault(key, {"file": key, "lang": "en" if re.search(r"_eng\.|/WOW\.", key) else "te",
                                            "title": "", "title_alt": "", "contributor": None, "heading_img": None})
        if it["src"] == "text" and it["title"]: cur["title"] = it["title"]
        if it["src"] == "image":
            cur["title_alt"] = re.sub(r"\s*src=.*$", "", it["title"]).strip() or cur["title_alt"]; cur["heading_img"] = it.get("heading_img") or cur["heading_img"]
        if it.get("contributor") and not cur["contributor"]: cur["contributor"] = it["contributor"]

# Issues known only by name: the 2007 year listing names four issues, and the Telugu contents pages for
# April and July 2007 were never archived (index42/43.html). They get a row, honestly empty.
for folder, mo in (("src407", 4), ("src707", 7)):
    if folder not in issues:
        issues[folder] = {"id": f"2007-{mo:02d}", "folder": folder, "year": 2007, "month": mo, "season": SEASON[mo],
                          "volume": None, "issueNo": None, "pages": {}, "items": {}, "nameOnly": True}

# Availability, copying, and the column key.
os.makedirs(ASSET_DIR, exist_ok=True); os.makedirs(os.path.join(ASSET_DIR, "img"), exist_ok=True)
copied = 0
for iss in issues.values():
    fb = os.path.join(OLD, iss["folder"], "fullbook.pdf")
    iss["fullbook"] = os.path.exists(fb)
    cov = COVERS.get(iss["folder"])
    iss["cover"] = cov if cov and os.path.exists(os.path.join(OLD, "images", cov)) else None
    for it in iss["items"].values():
        base = os.path.basename(it["file"]); stem = re.sub(r"\.(pdf|html)$", "", base, flags=re.I)
        it["column"] = re.sub(r"_eng$", "", stem).lower()
        srcp = os.path.join(OLD, it["file"]); it["available"] = os.path.exists(srcp) and base.lower().endswith(".pdf")
        if it["available"]:
            dst = os.path.join(ASSET_DIR, it["file"]); os.makedirs(os.path.dirname(dst), exist_ok=True)
            if not os.path.exists(dst):
                shutil.copy2(srcp, dst); copied += 1
                try:  # served copies never carry his home address or old phone numbers
                    from redact import redact_pdf; redact_pdf(dst)
                except Exception as e: print("REDACT FAILED", dst, e)
        for img in (it.get("heading_img"),):
            if img and os.path.exists(os.path.join(OLD, "images", img)) and not os.path.exists(os.path.join(ASSET_DIR, "img", img)):
                shutil.copy2(os.path.join(OLD, "images", img), os.path.join(ASSET_DIR, "img", img)); copied += 1
    if iss["fullbook"]:
        dst = os.path.join(ASSET_DIR, iss["folder"], "fullbook.pdf"); os.makedirs(os.path.dirname(dst), exist_ok=True)
        if not os.path.exists(dst):
            shutil.copy2(fb, dst); copied += 1
            try:
                from redact import redact_pdf; redact_pdf(dst)
            except Exception as e: print("REDACT FAILED", dst, e)
    for img in ("samghamitra_title.jpg", "samghamitra_motto.jpg"):  # his own masthead graphics, for the front door
        s_ = os.path.join(OLD, "images", img); d_ = os.path.join(ASSET_DIR, "img", img)
        if os.path.exists(s_) and not os.path.exists(d_): shutil.copy2(s_, d_); copied += 1
    if iss["cover"] and not os.path.exists(os.path.join(ASSET_DIR, "img", iss["cover"])):
        shutil.copy2(os.path.join(OLD, "images", iss["cover"]), os.path.join(ASSET_DIR, "img", iss["cover"])); copied += 1
    iss["items"] = sorted(iss["items"].values(), key=lambda x: (x["lang"], x["file"]))

out = {"generated": "from research/old-site (Internet Archive), tools/magazine/extract.py",
       "masthead": "a quarterly online magazine meant for knowledge, entertainment and progress",
       "issues": sorted(issues.values(), key=lambda i: (i["year"], i["month"]), reverse=True)}
os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
json.dump(out, open(OUT_JSON, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
n_items = sum(len(i["items"]) for i in out["issues"]); n_avail = sum(1 for i in out["issues"] for x in i["items"] if x["available"])
print(f"issues={len(out['issues'])} items={n_items} available={n_avail} copied={copied}")
for i in out["issues"]:
    print(f"  {i['id']} {i['season']:13s} {i['folder']:8s} items={len(i['items']):2d} avail={sum(1 for x in i['items'] if x['available']):2d} fullbook={'Y' if i['fullbook'] else '-'} cover={'Y' if i['cover'] else '-'} pages={'/'.join(sorted(i['pages']))}")
