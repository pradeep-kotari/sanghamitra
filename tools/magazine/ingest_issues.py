#!/usr/bin/env python3
"""Put whole-issue PDFs from Sreenivasa's backup on the site, with private details blanked.
  .venv-whisper/bin/python tools/magazine/ingest_issues.py DIR_OR_PDF... [--dry-run]
He named them <Month><Year>.pdf for the Telugu issue (bilingual, before October 2007) and
<Month><Year>_eng.pdf for the English edition. One file spells January "Januray"; the month is
read from its first three letters. Each PDF is matched to an issue already in site/data/magazine.json
by year and month. A file that matches nothing is reported and left out: nothing is guessed.

The copy that is served goes to site/magazine/<folder>/fullbook.pdf or fullbook_eng.pdf, with a proper
title in place of the Word file name and author tag the original carried, and with every address, phone
number and email redact.py knows about blanked. It is deleted again if any of those is still readable
in it. The original is never touched and does not belong in git: keep it under research/old-site/files*/,
which is ignored. Then run covers.py and generate.py, in that order."""
import sys, os, re, json
import pymupdf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import redact
from redact import redact_pdf, DONE
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = os.path.join(ROOT, "site"); MAG = os.path.join(SITE, "magazine")
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
NAME = re.compile(r"^(?P<month>[A-Za-z]{3,9}?)(?P<year>\d{4})(?P<eng>_eng)?\.pdf$", re.I)


def month_of(word):
    for n, m in enumerate(MONTHS, 1):
        if m[:3].lower() == word[:3].lower():
            return n
    return None


def main(argv):
    dry = "--dry-run" in argv
    paths = []
    for a in [x for x in argv if not x.startswith("--")]:
        paths += sorted(os.path.join(a, f) for f in os.listdir(a)) if os.path.isdir(a) else [a]
    paths = [p for p in paths if p.lower().endswith(".pdf")]
    issues = {(i["year"], i["month"]): i for i in json.load(open(os.path.join(SITE, "data/magazine.json"), encoding="utf-8"))["issues"]}
    placed, skipped, bad = 0, [], []
    for p in paths:
        m = NAME.match(os.path.basename(p))
        month = month_of(m.group("month")) if m else None
        issue = issues.get((int(m.group("year")), month)) if m and month else None
        if not issue:
            skipped.append(os.path.basename(p)); continue
        eng = bool(m.group("eng"))
        dest = os.path.join(MAG, issue["folder"], "fullbook_eng.pdf" if eng else "fullbook.pdf")
        rel = os.path.relpath(dest, ROOT)
        if dry:
            print(f"  would place  {os.path.basename(p):24s} -> {rel}"); continue
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        doc = pymupdf.open(p)
        title = f"Sanghamitra magazine, {MONTHS[issue['month'] - 1]} {issue['year']}" + (" (English edition)" if eng else "")
        doc.set_metadata({"title": title, "author": "", "subject": "", "keywords": "", "creator": "", "producer": ""})
        doc.del_xml_metadata()
        doc.save(dest, garbage=3, deflate=True)
        doc.close()
        found, boxed, left = redact_pdf(dest)
        if left:
            os.remove(dest); bad.append((rel, left)); print(f"  REFUSED      {rel}: still readable after redaction: {left}")
            continue
        placed += 1
        # A whole issue prints the editor's address on its cover and again on its "In this issue" page, both as
        # pictures with no text under them. If those pages are pictures and no footer was found, say so.
        chk = pymupdf.open(dest)
        pictured = [n + 1 for n in (0, 1) if n < len(chk) and len(chk[n].get_text().strip()) < 30]
        note = "" if not pictured or DONE in (chk.metadata.get("keywords") or "") else f"  LOOK: pages {pictured} are pictures and no footer was found on them"
        chk.close()
        print(f"  placed       {os.path.basename(p):24s} -> {rel:42s} {os.path.getsize(p)//1024:5d}KB -> {os.path.getsize(dest)//1024:5d}KB  {found} details, {boxed} boxes{(', rebuilt as pictures: pages ' + str(redact.redact_pdf.rasterized)) if redact.redact_pdf.rasterized else ''}{note}")
    print(f"\n{placed} placed · {len(skipped)} matched no issue{': ' + ', '.join(skipped) if skipped else ''} · {len(bad)} refused")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
