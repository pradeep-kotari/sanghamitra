#!/usr/bin/env python3
"""Redact personal details in the SERVED copies of the old-site PDFs. Originals in research/ are never touched.
What goes: his two home street addresses, the two old landline numbers, and the three old email addresses.
What stays: (314) 601-5306, which is the WhatsApp number already public on the site.
Usage: .venv-whisper/bin/python tools/magazine/redact.py [paths...]   (default: every PDF under site/magazine)"""
import re, sys, glob, os, pymupdf
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KEEP = {"(314) 601-5306", "(314)601-5306", "314-601-5306"}
PATTERNS = [
    r"12450\s+Lyric\s+Ct\.?", r"Lyric\s+Ct\.?", r"Saint\s+Louis,\s*MO\s*63146", r"St\.?\s*Louis,\s*MO\s*63146",
    r"1620\s+Strecker\s+Ridge\s+Ct\.?", r"Strecker\s+Ridge\s+Ct\.?", r"Wildwood,\s*MO\s*63011",
    r"\(?314\)?[\s-]*395[\s-]*9516", r"\(?314\)?[\s-]*878[\s-]*9516",
    r"[\w.+-]+@sanghamitra\.org", r"[\w.+-]+@yahoo\.com", r"[\w.+-]+@gmail\.com",
]
RX = re.compile("|".join(f"(?:{p})" for p in PATTERNS), re.I)

def redact_pdf(path, out=None):
    """Returns (matches_found, matches_boxed, remaining_after). Writes in place unless out is given."""
    doc = pymupdf.open(path); found = boxed = 0
    for page in doc:
        text = page.get_text()
        needles = {m.group(0) for m in RX.finditer(text)} - KEEP
        for n in needles:
            found += 1
            rects = page.search_for(n) or page.search_for(re.sub(r"\s+", " ", n))
            for r in rects:
                page.add_redact_annot(r, fill=(1, 1, 1)); boxed += 1
        if needles: page.apply_redactions()
    dst = out or path
    if out: doc.save(dst, garbage=3, deflate=True)
    else: doc.save(dst, garbage=3, deflate=True, incremental=False) if False else doc.save(dst + ".tmp", garbage=3, deflate=True); 
    doc.close()
    if not out: os.replace(dst + ".tmp", dst)
    # verify
    left = sorted({m.group(0) for pg in pymupdf.open(dst) for m in RX.finditer(pg.get_text())} - KEEP)
    return found, boxed, left

if __name__ == "__main__":
    paths = sys.argv[1:] or sorted(glob.glob(os.path.join(ROOT, "site/magazine/**/*.pdf"), recursive=True))
    tot_f = tot_b = 0; bad = []
    for p in paths:
        f, b, left = redact_pdf(p); tot_f += f; tot_b += b
        if left: bad.append((p, left))
        if f: print(f"  {os.path.relpath(p, ROOT):55s} {f:2d} details, {b:2d} boxes{'  STILL: ' + str(left) if left else ''}")
    print(f"\n{len(paths)} PDFs · {tot_f} details found · {tot_b} boxes applied · {len(bad)} with residue")
    sys.exit(1 if bad else 0)
