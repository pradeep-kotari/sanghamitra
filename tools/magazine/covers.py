#!/usr/bin/env python3
"""Give every issue on the magazine page a picture, taken from that issue itself.

Four archived covers survive (2016 Ugadi, July 2011, Sankranti 2007, Vijaya Dasami 2006).
For the other 21 issues nothing that could be called a cover was ever captured, so this
builds one out of what that issue does still have, in this order:

  page     the first page of the issue's own fullbook.pdf — for two issues that IS his cover
  page     otherwise the first page of the first piece of that issue that was recovered
  contents his own column headings from that issue's contents page, set the way he set them
  name     the magazine's title block alone, for the issues where nothing but the name survives

Nothing is invented and nothing is borrowed from another issue except in the last case,
which is stated in the caption on the issue page. Personal details are boxed out of every
rendered page before it becomes an image, the same list redact.py works from.

  .venv-whisper/bin/python tools/magazine/covers.py [--force]

Writes site/magazine/img/covers/<issue-id>.jpg and site/data/magazine-covers.json, which
generate.py reads. Re-run it after recovering more of an issue: a page beats a contents card.
"""
import json, os, re, sys, io, collections
import pymupdf
from PIL import Image, ImageChops, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = os.path.join(ROOT, "site")
MAG = os.path.join(SITE, "magazine")
IMG = os.path.join(MAG, "img")
OUT = os.path.join(IMG, "covers")

W, H = 600, 800          # 3:4, the shape the cards are cut to
PAPER = (255, 248, 235)  # --card, so a built cover sits on the same paper as the page
RULE = (212, 196, 164)   # --line
HIS_GREEN = (0, 128, 0)  # the green his own contents pages printed the month in
SERIF = "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"
MONTHS = ["", "January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"]

# His own street addresses, landlines and old mailboxes, plus the bare ZIP that survives
# redaction because it sits on its own line. The WhatsApp number stays: it is public.
KEEP = {"(314) 601-5306", "(314)601-5306", "314-601-5306"}
PRIVATE = re.compile(
    r"12450\s+Lyric\s+Ct\.?|Lyric\s+Ct\.?|1620\s+Strecker\s+Ridge\s+Ct\.?|Strecker\s+Ridge"
    r"|Saint\s+Louis,\s*MO\s*63146|St\.?\s*Louis,\s*MO\s*63146|Wildwood,\s*MO\s*63011"
    r"|63146|63011|\(?314\)?[\s-]*(?:395|878)[\s-]*9516"
    r"|[\w.+-]+@(?:sanghamitra\.org|yahoo\.com|gmail\.com)", re.I)

# Which piece stands in for an issue when its cover is gone: the pieces that opened the issue
# first, then the columns that carry a drawing or a diagram, then whatever else was recovered.
PREFER = ["cover_story", "mundumaata", "tolipaluku", "veekshanam", "sambaraalu", "toranam",
          "mathematrix", "charitardulu", "charitardhulu", "ramanujan", "balamitra", "chuddam",
          "vemana", "acharamulu", "smruti", "padam", "telusa", "jokes", "crossword",
          "sameta_kathalu", "tudipaluku", "vidupu"]


def paste_art(card, name, y, max_w, scale_cap=1.9):
    """Drop one piece of his line art onto the card, centred at y. His headings are dark ink on
    white; multiply keeps the ink and lets the paper show through, so nothing sits in a box."""
    path = os.path.join(IMG, name)
    if not os.path.exists(path):
        return 0
    im = Image.open(path).convert("RGB")
    s = min(max_w / im.width, scale_cap)
    im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
    x = (card.width - im.width) // 2
    card.paste(ImageChops.multiply(card.crop((x, y, x + im.width, y + im.height)), im), (x, y))
    return im.height


def rule(card, y, inset=110):
    for xx in range(inset, card.width - inset):
        card.putpixel((xx, y), RULE)


def draw_line(card, text, y, size, colour):
    """The month and year, in the green his own contents pages printed it in. It is the one thing
    that is different on every issue's page, so it is what keeps these cards apart."""
    try:
        font = ImageFont.truetype(SERIF, size)
    except OSError:
        font = ImageFont.load_default()
    d = ImageDraw.Draw(card)
    box = d.textbbox((0, 0), text, font=font)
    d.text(((W - (box[2] - box[0])) // 2 - box[0], y - box[1]), text, font=font, fill=colour)
    return box[3] - box[1]


def date_line(issue):
    season = issue.get("season")
    month = f"{MONTHS[issue['month']]} {issue['year']}"
    return f"{season} · {month}" if season and season not in month else month


def contents_card(issue, headings):
    """His contents page, rebuilt from its own parts: the title block, the month in his green,
    'in this issue', and the column headings that issue carried."""
    card = Image.new("RGB", (W, H), PAPER)
    y = 46
    y += paste_art(card, "samghamitra_title.jpg", y, int(W * 0.56)) + 10
    y += paste_art(card, "samghamitra_motto.jpg", y, int(W * 0.66)) + 22
    rule(card, y); y += 24
    y += draw_line(card, date_line(issue), y, 40, HIS_GREEN) + 28
    y += paste_art(card, "indexlist.jpg", y, int(W * 0.44)) + 24
    room = H - 52 - y
    n = min(len(headings), max(3, room // 60))
    gap = max(6, (room - n * 44) // max(1, n))
    for h in headings[:n]:
        h_px = paste_art(card, h, y, int(W * 0.74))
        if not h_px:
            continue
        y += h_px + gap
        if y > H - 66:
            break
    return card


def name_card(issue):
    """Nothing of these issues survives but the name and the date. The site banner he used across
    the whole magazine stands in, with the issue's own date under it — and the caption says so."""
    card = Image.new("RGB", (W, H), PAPER)
    y = H // 2 - 190
    y += paste_art(card, "new_title.jpg", y, int(W * 0.84), scale_cap=1.2) + 40
    rule(card, y); y += 34
    y += draw_line(card, date_line(issue), y, 44, HIS_GREEN) + 26
    # Two different silences: an issue known only by name, and one whose contents page survives
    # but carried no headings of its own. Say which, rather than one line that is wrong for one.
    draw_line(card, "no copy survives" if issue.get("nameOnly") else "contents only",
              y, 26, (110, 96, 78))
    return card


def page_card(pdf_path, page_no=0):
    """One real page of the issue, with anything private boxed out before it becomes pixels."""
    doc = pymupdf.open(pdf_path)
    page = doc[page_no]
    hits = {m.group(0) for m in PRIVATE.finditer(page.get_text())} - KEEP
    for needle in hits:
        for r in page.search_for(needle) or []:
            page.draw_rect(r, color=None, fill=(1, 1, 1), overlay=True)
    zoom = max(W / page.rect.width, H / page.rect.height) * 1.35
    pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom))
    im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    doc.close()
    # Cut to 3:4 from the top, the way the card itself crops, so what we ship is what shows.
    target = W / H
    if im.width / im.height > target:
        w = int(im.height * target)
        im = im.crop(((im.width - w) // 2, 0, (im.width - w) // 2 + w, im.height))
    else:
        im = im.crop((0, 0, im.width, int(im.width / target)))
    return im.resize((W, H), Image.LANCZOS), bool(hits)


def build():
    data = json.load(open(os.path.join(SITE, "data/magazine.json"), encoding="utf-8"))
    os.makedirs(OUT, exist_ok=True)
    have_img = set(os.listdir(IMG))
    built, redacted = {}, []
    # How many issues carry each column heading — the rarer ones are what make a card its own.
    shared = collections.Counter()
    for iss in data["issues"]:
        shared.update({it["heading_img"] for it in iss["items"] if it.get("heading_img")})

    for issue in data["issues"]:
        iid = issue["id"]
        if issue.get("cover"):
            built[iid] = {"src": f"magazine/img/{issue['cover']}", "kind": "cover",
                          "note": "The cover of this issue."}
            continue

        avail = [it for it in issue["items"] if it.get("available")]
        fullbook = os.path.join(MAG, issue["folder"], "fullbook.pdf")
        src_pdf = piece = None
        if os.path.exists(fullbook):
            src_pdf, piece = fullbook, None
        elif avail:
            def rank(it):
                c = it["column"]
                return (PREFER.index(c) if c in PREFER else 99, 0 if it["lang"] == "te" else 1, it["file"])
            piece = sorted(avail, key=rank)[0]
            src_pdf = os.path.join(MAG, piece["file"])

        rel = f"magazine/img/covers/{iid}.jpg"
        dst = os.path.join(OUT, f"{iid}.jpg")

        if src_pdf:
            im, hit = page_card(src_pdf)
            if hit:
                redacted.append(os.path.relpath(src_pdf, ROOT))
            if piece is None:
                note = "The first page of this issue, from the printable copy of the whole issue."
            else:
                note = f"A page of this issue: the first page of {os.path.basename(piece['file']).replace('_eng', '').replace('.pdf', '').replace('_', ' ')}."
            kind = "page"
        else:
            headings, seen = [], set()
            for it in issue["items"]:
                h = it.get("heading_img")
                if h and h not in seen and h in have_img:
                    seen.add(h); headings.append(h)
            # He ran the same columns every quarter, so leading with his order gives nine cards
            # that look alike. Lead instead with the headings this issue does not share with the
            # others, keeping his order inside each group. Same art, same issue, distinct card.
            order = {h: n for n, h in enumerate(headings)}
            headings.sort(key=lambda h: (shared[h], order[h]))
            if len(headings) >= 3:
                im, kind = contents_card(issue, headings), "contents"
                note = "The column headings this issue carried, from its own contents page. Its articles are among those the Internet Archive did not keep."
            else:
                im, kind = name_card(issue), "name"
                note = ("Only the name of this issue survives, so the magazine's own banner stands in for the cover."
                        if issue.get("nameOnly") else
                        "Its contents page survives but carried no pictures of its own, so the magazine's banner stands in.")
        im.save(dst, quality=80, optimize=True, progressive=True)
        built[iid] = {"src": rel, "kind": kind, "note": note}
        print(f"  {iid}  {kind:8s} {os.path.getsize(dst)//1024:3d}KB  {note[:64]}")

    json.dump(built, open(os.path.join(SITE, "data/magazine-covers.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    kinds = {}
    for v in built.values():
        kinds[v["kind"]] = kinds.get(v["kind"], 0) + 1
    print(f"\n{len(built)} issues: " + ", ".join(f"{n} {k}" for k, n in sorted(kinds.items())))
    if redacted:
        print("personal details boxed out of the rendered page for: " + ", ".join(sorted(set(redacted))))
    return 0


if __name__ == "__main__":
    sys.exit(build())
