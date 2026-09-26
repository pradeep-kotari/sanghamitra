#!/usr/bin/env python3
"""Put photographs from Sreenivasa's own collection on the gallery, sized for the web and with no camera data.
  .venv-whisper/bin/python tools/ingest_photos.py MANIFEST.json [--dry-run]

The manifest lists groups; each group says which existing gallery photo it goes after, so the wall stays in
date order, and lists its photographs:
  {"source": "<text for photos-archive.json>", "from": "drive-2026-09",
   "originals": "research/old-site/files-drive-2026-09/photos",
   "groups": [{"after": "img/archive/medhavadhanam2009_participants.jpg",
               "photos": [{"src": "226.JPG", "out": "seminar2009-05-08-01", "year": 2009, "tags": ["vedic"],
                           "caption": "…", "alt": "…", "crop": [0, 0, 264, 215]}]}]}   (crop is optional)
Each original is turned upright by its own orientation flag, cut to 1600 px on the long edge, saved as JPEG
without EXIF (which carries the camera's clock and sometimes a location), written to site/img/archive/, added
to site/data/photos-archive.json (the admin's "download everything" reads that file, so a photo missing from it
is missing from the backup) and to site/gallery.html. A photo already listed is left alone, so this can be re-run.
Originals stay where they are (research/old-site/files*/ is not in git); nothing here reads or writes them."""
import sys, os, re, json, html as H
from PIL import Image, ImageOps
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, "site")
LONG_EDGE, QUALITY = 1600, 82
esc = lambda s: H.escape(str(s or ""), quote=True)


def figure(entry, w, h):
    href = entry["file"]
    return (f'        <figure>\n          <a class="gallery-open" href="{href}">\n'
            f'            <img src="{href}" width="{w}" height="{h}" alt="{esc(entry["alt"])}" loading="lazy">\n          </a>\n'
            f'          <figcaption>{esc(entry["caption"])}{"" if str(entry["year"]) in entry["caption"] else " · " + str(entry["year"])}</figcaption>\n        </figure>\n')


def main(argv):
    dry = "--dry-run" in argv
    manifest = json.load(open([a for a in argv if not a.startswith("--")][0], encoding="utf-8"))
    originals = os.path.join(ROOT, manifest.get("originals", "research/old-site/files-drive-2026-09/photos"))
    arch_path = os.path.join(SITE, "data/photos-archive.json")
    archive = json.load(open(arch_path, encoding="utf-8"))
    gallery = open(os.path.join(SITE, "gallery.html"), encoding="utf-8").read()
    have = {p["file"] for p in archive["photos"]}
    added = skipped = 0
    for g in manifest["groups"]:
        blocks = ""
        for ph in g["photos"]:
            rel = f"img/archive/{ph['out']}.jpg"
            if rel in have:
                skipped += 1; continue
            src = os.path.join(originals, ph["src"])
            im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
            if ph.get("crop"): im = im.crop(tuple(ph["crop"]))     # [left, top, right, bottom], e.g. to drop a caption printed on the picture
            if max(im.size) > LONG_EDGE:
                s = LONG_EDGE / max(im.size); im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
            dest = os.path.join(SITE, rel)
            if not dry:
                im.save(dest, "JPEG", quality=QUALITY, optimize=True, progressive=True)   # no exif= argument: nothing is carried over
            kb = os.path.getsize(dest) // 1024 if not dry else 0
            entry = {"file": rel, "caption": ph["caption"], "originalCaption": None, "year": ph["year"], "tags": ph["tags"],
                     "small": max(im.size) < 800, "needsReview": False, "px": [im.width, im.height], "kb": kb,
                     "alt": ph["alt"], "from": manifest.get("from", "")}
            archive["photos"].append(entry); have.add(rel); blocks += figure(entry, im.width, im.height); added += 1
            print(f"  {ph['src']:34s} -> {rel:52s} {im.width}x{im.height} {kb}KB")
        if blocks:
            i = gallery.index(f'href="{g["after"]}"'); j = gallery.index("</figure>\n", i) + len("</figure>\n")
            gallery = gallery[:j] + blocks + gallery[j:]
    if manifest.get("source"): archive["source"] = manifest["source"]
    if not dry:
        # keep the existing gallery's bookkeeping out of the archive file: 'alt' is for the page, not the data
        for p in archive["photos"]: p.pop("alt", None)
        open(arch_path, "w", encoding="utf-8").write(json.dumps(archive, indent=1, ensure_ascii=False))
        open(os.path.join(SITE, "gallery.html"), "w", encoding="utf-8").write(gallery)
    print(f"\n{added} added, {skipped} already there{' (dry run: nothing written)' if dry else ''}")


if __name__ == "__main__":
    main(sys.argv[1:])
