#!/usr/bin/env python3
"""One command to recover a Telugu article for Sreenivasa to proofread.
   .venv-whisper/bin/python tools/magazine/recover.py src1006/toranam.pdf [more...] [--dry-run]
Renders each page at 200 dpi to site/magazine/pages/, reads it into Unicode Telugu with Gemini, writes the
DRAFT to site/data/telugu/<id>.json, updates index.json, and regenerates the pages. Nothing here publishes:
the draft appears on the public read page only after he presses Approve in /admin.
--dry-run renders to the scratch directory and calls no API."""
import sys, os, re, json, base64, time, subprocess, urllib.request, urllib.error
import pymupdf
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OLD = os.path.join(ROOT, "research/old-site/files"); SITE = os.path.join(ROOT, "site")
PAGES = os.path.join(SITE, "magazine/pages"); TE = os.path.join(SITE, "data/telugu")
MODEL = "gemini-3.6-flash"
PROMPT = """This is one page of a Telugu-language community magazine (Sanghamitra, {issue}), set in a legacy Telugu font.
Transcribe the Telugu text on this page EXACTLY as printed, into Unicode Telugu.

Rules:
- Transcribe, do not translate, do not paraphrase, do not correct the author's spelling or grammar.
- Keep the paragraph structure: one blank line between paragraphs. Keep headings on their own line.
- English words, names, dates and numbers that appear in Latin script stay exactly as printed.
- If a character or word is genuinely unreadable, write it as [?] rather than guessing.
- Do not add any commentary, headings of your own, or notes. Output the transcription only.
"""
def api_key():
    m = re.search(r'^GOOGLE_API_KEY=(.+)$', open(os.path.expanduser("~/.claude/.env")).read(), re.M)
    return m.group(1).strip().strip('"')
def read_page(png, issue_label):
    img = base64.b64encode(open(png, "rb").read()).decode()
    body = {"contents": [{"role": "user", "parts": [{"inline_data": {"mime_type": "image/png", "data": img}}, {"text": PROMPT.format(issue=issue_label)}]}],
            "generationConfig": {"temperature": 0.0, "maxOutputTokens": 8192}}
    for attempt in range(5):
        try:
            req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
                data=json.dumps(body).encode(), headers={"x-goog-api-key": api_key(), "Content-Type": "application/json"}, method="POST")
            with urllib.request.urlopen(req, timeout=600) as r: d = json.load(r)
            c = d["candidates"][0]; return "".join(p.get("text", "") for p in c["content"]["parts"]), c.get("finishReason")
        except urllib.error.HTTPError as e:
            if e.code not in (429, 500, 503) or attempt == 4: raise
            time.sleep(15 * (attempt + 1))
def main(argv):
    dry = "--dry-run" in argv; files = [a for a in argv if not a.startswith("--")]
    if not files: print(__doc__); return 2
    mag = json.load(open(os.path.join(SITE, "data/magazine.json"), encoding="utf-8"))
    MONTH = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    idx_path = os.path.join(TE, "index.json")
    index = json.load(open(idx_path, encoding="utf-8")) if os.path.exists(idx_path) else {"items": []}
    out_dir = PAGES if not dry else os.path.join(os.environ.get("SCRATCH", "/tmp"), "recover-dry")
    os.makedirs(out_dir, exist_ok=True); os.makedirs(TE, exist_ok=True)
    for rel in files:
        folder, base = rel.split("/"); stem = re.sub(r"\.pdf$", "", base, flags=re.I); aid = f"{folder}-{stem}"
        issue = next((i for i in mag["issues"] if i["folder"] == folder), None)
        item = next((x for i in mag["issues"] for x in i["items"] if x["file"] == rel), None)
        if not issue or not item: print(f"SKIP {rel}: not in magazine.json"); continue
        label = f"{issue['season'] or MONTH[issue['month']]} {issue['year']}"
        src = os.path.join(OLD, rel); doc = pymupdf.open(src); pages = []
        for n, pg in enumerate(doc):
            png = os.path.join(out_dir, f"{aid}-p{n+1}.png"); pg.get_pixmap(dpi=200).save(png)
            pages.append(png)
        print(f"{rel}: {len(pages)} page(s) rendered → {out_dir}")
        if dry: continue
        text_parts = []
        for n, png in enumerate(pages):
            txt, fin = read_page(png, f"{MONTH[issue['month']]} {issue['year']} issue")
            te = sum(1 for ch in txt if 'ఀ' <= ch <= '౿')
            print(f"   page {n+1}: finish={fin} chars={len(txt)} telugu={te} unsure={txt.count('[?]')}")
            text_parts.append(txt.strip())
        title_te = (text_parts[0].split("\n")[0].strip() if text_parts and text_parts[0] else "")
        rec = {"id": aid, "issue": issue["id"], "issueLabel": label, "folder": folder, "file": rel, "column": item["column"],
               "titleTe": title_te[:80], "titleEn": item.get("title") or item.get("title_alt") or item["column"], "contributor": item.get("contributor"),
               "pages": [f"magazine/pages/{os.path.basename(p)}" for p in pages],
               "draft": "\n\n".join(text_parts),
               "recovered": {"by": f"{MODEL}, page images at 200 dpi", "on": time.strftime("%Y-%m-%d"),
                             "note": "Machine-read from the printed page. Not published until Sreenivasa has read and approved it in /admin."}}
        json.dump(rec, open(os.path.join(TE, f"{aid}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        index["items"] = [x for x in index["items"] if x["id"] != aid] + [{k: rec[k] for k in ("id", "issue", "issueLabel", "titleTe", "titleEn", "file", "pages")}]
        json.dump(index, open(idx_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(f"   draft written: site/data/telugu/{aid}.json")
    if not dry:
        subprocess.run([sys.executable, os.path.join(ROOT, "tools/magazine/generate.py")], check=True)
    return 0
if __name__ == "__main__": sys.exit(main(sys.argv[1:]))
