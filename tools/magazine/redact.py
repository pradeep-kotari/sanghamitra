#!/usr/bin/env python3
"""Redact personal details in the SERVED copies of the old-site PDFs. Originals in research/ are never touched.
What goes: his four home street addresses (Sauterne Dr. in 2004, Lyric Ct. and Strecker Ridge Ct. in between, Vivacite Walk in 2009), the two old landline numbers, and the three old email addresses.
What stays: (314) 601-5306, which is the WhatsApp number already public on the site.
Usage: .venv-whisper/bin/python tools/magazine/redact.py [paths...]   (default: every PDF under site/magazine)"""
import re, sys, glob, os, pymupdf
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KEEP = {"(314) 601-5306", "(314)601-5306", "314-601-5306"}
# Three lists, because a plain-text page says what was removed ("[email removed]") while a PDF just blanks it.
ADDRESS = [
    r"12450\s+Lyric\s+Ct\.?", r"Lyric\s+Ct\.?", r"Saint\s+Louis,\s*MO\s*63146", r"St\.?\s*Louis,\s*MO\s*63146",
    r"1620\s+Strecker\s+Ridge\s+Ct\.?", r"Strecker\s+Ridge\s+Ct\.?", r"Wildwood,\s*MO\s*63011",
    # The 2004 issue prints Sauterne Dr., and the 2009 issues print Vivacite Walk. Both print the street, the
    # apartment letter and the ZIP each on its own line, so the "Saint Louis, MO 63146" pattern above cannot
    # see them. Apartment letter: capital "Apt" only, so the ordinary word "apt" is never boxed.
    r"12612\s+Sauterne\s+Dr\.?", r"Sauterne\s+Dr\.?", r"12176\s+Vivacite\s+Walk,?", r"Vivacite\s+Walk,?",
    r"(?-i:Apt\.?\s*#?\s*[A-Z]\b),?", r"\bMO\s*63146\.?",
]
PHONE = [r"\(?314\)?[\s-]*395[\s-]*9516", r"\(?314\)?[\s-]*878[\s-]*9516"]
EMAIL = [r"[\w.+-]+@sanghamitra\.org", r"[\w.+-]+@yahoo\.com", r"[\w.+-]+@gmail\.com"]
PATTERNS = ADDRESS + PHONE + EMAIL
_rx = lambda ps: re.compile("|".join(f"(?:{p})" for p in ps), re.I)
RX = _rx(PATTERNS)

def scrub_text(text):
    """The same details, in plain text, for pages generated from a PDF's extracted text. Each is replaced by
    what it was, so a reader is not left wondering what a bare "e-mail :" was going to say."""
    text = _rx(EMAIL).sub("[email removed]", text)
    text = _rx(PHONE).sub("[phone removed]", text)
    text = _rx(ADDRESS).sub("[address removed]", text)
    return re.sub(r"(?:\[address removed\][\s,.]*){2,}", "[address removed] ", text)

def _runs(mask, join):
    """Consecutive True rows as (first, last), joining runs at most `join` rows apart."""
    out = []
    for y in np.nonzero(mask)[0]:
        if out and y - out[-1][1] <= join: out[-1][1] = int(y)
        else: out.append([int(y), int(y)])
    return out


def footer_box(page):
    """Where a printed mailing-address footer sits on a page whose text is a picture, or None.
    The covers and the "In this issue" pages of every whole issue are images with no text layer, so the
    text patterns above cannot see the address printed at their foot. It is found by its shape: two or
    three short lines of green type, close together, a good part of the page wide, in the foot of the page, and the lowest
    such block on the page. A picture, a table of contents or a frame is never two lines that close."""
    pix = page.get_pixmap(matrix=pymupdf.Matrix(1, 1), alpha=False)
    a = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3).astype(int)
    h, w, _ = a.shape
    green = (a[..., 1] - a[..., 0] > 28) & (a[..., 1] - a[..., 2] > 28) & (a[..., 1] < 200)
    lines = _runs(green.sum(axis=1) >= 2, 3)                  # one entry per printed line
    blocks = []                                                # lines that sit within a line-gap of each other
    for top, bottom in lines:
        if blocks and top - blocks[-1][1] <= 16: blocks[-1][1] = bottom; blocks[-1][2] += 1
        else: blocks.append([top, bottom, 1])
    for top, bottom, n in reversed(blocks):
        if n < 2 or bottom - top > 130 or top < 0.7 * h: continue   # every footer starts below 85% of the page; a masthead or a list of contents can look like one higher up
        ys, xs = np.nonzero(green[top:bottom + 1, :])
        if xs.max() - xs.min() < 0.40 * w: continue
        return pymupdf.Rect(xs.min() - 10, top - 8, xs.max() + 10, bottom + 8)
    return None


DONE = "address footers removed"      # kept in the file's keywords, so a second run leaves a finished file alone
LOW, HIGH = 0.6, 1.6                  # zoom for comparing a page before and after, and for rebuilding it as a picture


def _rgb(pix):
    return np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3).astype(int)


def _damaged(before, after, rects, pad=8):
    """True if the page changed anywhere other than inside the boxes just blanked. Redacting rewrites a page's
    drawing instructions, and on pages built with inline pictures (these Acrobat-converted issues) the library
    silently drops everything after the first instruction it cannot parse: page 12 of April 2007 came back with
    its puzzle figures and four of its five questions gone."""
    a, b = _rgb(before), _rgb(after)
    if a.shape != b.shape: return True
    keep = np.ones(a.shape[:2], bool)
    for r in rects:
        keep[max(0, int(r.y0 * LOW) - pad):int(r.y1 * LOW) + pad, max(0, int(r.x0 * LOW) - pad):int(r.x1 * LOW) + pad] = False
    return ((np.abs(a - b).max(axis=2) > 60) & keep).mean() > 0.001


def _as_picture(doc, n, hi, rects, width, height):
    """Replace page n with a picture of it as it was, the private details painted out. Loses that page's text
    layer, which is the price of a page the library cannot rewrite safely."""
    import io
    from PIL import Image, ImageDraw
    im = Image.frombytes("RGB", (hi.width, hi.height), hi.samples); dr = ImageDraw.Draw(im)
    for r in rects: dr.rectangle([r.x0 * HIGH - 2, r.y0 * HIGH - 2, r.x1 * HIGH + 2, r.y1 * HIGH + 2], fill=(255, 255, 255))
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=88, optimize=True)
    doc.delete_page(n); page = doc.new_page(n, width=width, height=height)
    page.insert_image(page.rect, stream=buf.getvalue())


def _lossy_again(doc, page, before_xrefs):
    """Blanking pixels rewrites the touched picture losslessly, which about doubles the file. Put the pictures
    it made (and only those) back to JPEG."""
    for img in page.get_images(full=True):
        xref = img[0]
        if xref in before_xrefs or doc.xref_get_key(xref, "SMask")[0] != "null": continue
        pix = pymupdf.Pixmap(doc, xref)
        if pix.alpha or pix.width * pix.height < 50_000 or pix.colorspace is None or pix.colorspace.n not in (1, 3): continue
        page.replace_image(xref, stream=pix.tobytes("jpeg", jpg_quality=90))


def redact_pdf(path, out=None):
    """Returns (matches_found, matches_boxed, remaining_after). Writes in place unless out is given.
    redact_pdf.rasterized lists the pages that had to be rebuilt as pictures."""
    doc = pymupdf.open(path); found = boxed = 0; blanked = []; unlocated = []; redact_pdf.rasterized = []
    # A finished file is not searched for a footer again: with the footer gone, the lowest two-line block on
    # a contents page is the last rows of the table, and the shape test would take them for it.
    look_for_footers = DONE not in (doc.metadata.get("keywords") or "")
    for n in range(len(doc)):
        page = doc[n]; text = page.get_text()
        needles = {m.group(0) for m in RX.finditer(text)} - KEEP
        rects = []
        for needle in needles:
            found += 1
            hits = page.search_for(needle) or page.search_for(re.sub(r"\s+", " ", needle))
            if not hits: unlocated.append(f"{needle!r} on page {n + 1}: could not be located to blank it")
            rects += hits
        box = footer_box(page) if look_for_footers and len(text.strip()) < 30 else None
        if box:
            found += 1; rects.append(box); blanked.append((n, box))
        if not rects: continue
        boxed += len(rects)
        before_xrefs = {i[0] for i in page.get_images(full=True)}
        low_before = page.get_pixmap(matrix=pymupdf.Matrix(LOW, LOW), alpha=False)
        hi = page.get_pixmap(matrix=pymupdf.Matrix(HIGH, HIGH), alpha=False)
        w, h = page.rect.width, page.rect.height
        for r in rects: page.add_redact_annot(r, fill=(1, 1, 1))
        # images=PIXELS removes the pixels themselves, not just paints over them, so the address cannot be lifted back out.
        page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_PIXELS)
        if _damaged(low_before, doc[n].get_pixmap(matrix=pymupdf.Matrix(LOW, LOW), alpha=False), rects):
            _as_picture(doc, n, hi, rects, w, h); redact_pdf.rasterized.append(n + 1)
        elif box:
            _lossy_again(doc, doc[n], before_xrefs)
    if blanked:
        meta = doc.metadata; meta["keywords"] = ((meta.get("keywords") or "").strip() + " " + DONE).strip()
        doc.set_metadata(meta)
    dst = out or path
    if out: doc.save(dst, garbage=3, deflate=True)
    else: doc.save(dst + ".tmp", garbage=3, deflate=True)
    doc.close()
    if not out: os.replace(dst + ".tmp", dst)
    # verify: nothing left in the text, nothing green left where a footer was, and every detail was found to be blanked
    chk = pymupdf.open(dst); left = set(unlocated)
    for pg in chk:
        left |= {m.group(0) for m in RX.finditer(pg.get_text())} - KEEP
    for n, r in blanked:
        pix = chk[n].get_pixmap(matrix=pymupdf.Matrix(1, 1), clip=r, alpha=False)
        a = _rgb(pix)
        if ((a[..., 1] - a[..., 0] > 28) & (a[..., 1] - a[..., 2] > 28) & (a[..., 1] < 200)).sum() > 8:
            left.add(f"address footer, still pictured, page {n + 1}")
    return found, boxed, sorted(left)

if __name__ == "__main__":
    paths = sys.argv[1:] or sorted(glob.glob(os.path.join(ROOT, "site/magazine/**/*.pdf"), recursive=True))
    tot_f = tot_b = 0; bad = []
    for p in paths:
        f, b, left = redact_pdf(p); tot_f += f; tot_b += b
        if left: bad.append((p, left))
        if f: print(f"  {os.path.relpath(p, ROOT):55s} {f:2d} details, {b:2d} boxes{'  STILL: ' + str(left) if left else ''}")
    print(f"\n{len(paths)} PDFs · {tot_f} details found · {tot_b} boxes applied · {len(bad)} with residue")
    sys.exit(1 if bad else 0)
