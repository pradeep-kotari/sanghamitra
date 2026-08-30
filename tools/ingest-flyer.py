#!/usr/bin/env python3
"""Turn one of Sreenivasa's announcement PDFs into site files.

He writes these in Word and sends the PDF. This script does not guess the
event title into the live site. It copies the PDF, renders a flyer image,
prints a JSON stub, and you paste it into site/data/site.json.

Usage:
  .venv-whisper/bin/python tools/ingest-flyer.py /path/to/flyer.pdf
  .venv-whisper/bin/python tools/ingest-flyer.py /path/to/flyer.pdf --date 2026-09-05
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"


def date_from_name(path: Path) -> str | None:
    m = re.search(r"(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])(20\d{2})", path.stem)
    if not m:
        return None
    month, day, year = m.group(1), m.group(2), m.group(3)
    return f"{year}-{month}-{day}"


def extract_text(pdf: Path) -> str:
    try:
        from pypdf import PdfReader
    except ImportError:
        return ""
    reader = PdfReader(str(pdf))
    return "\n\n".join((page.extract_text() or "") for page in reader.pages)


def render_flyer(pdf: Path, dest: Path) -> None:
    import pypdfium2 as pdfium

    document = pdfium.PdfDocument(str(pdf))
    page = document[0]
    image = page.render(scale=2).to_pil().convert("RGB")
    dest.parent.mkdir(parents=True, exist_ok=True)
    image.save(dest, "JPEG", quality=82, optimize=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--date", help="YYYY-MM-DD if the filename is not MMDDYYYY")
    args = parser.parse_args()
    pdf = args.pdf.expanduser().resolve()
    if not pdf.is_file():
        print(f"missing PDF: {pdf}", file=sys.stderr)
        return 1

    day = args.date or date_from_name(pdf)
    if not day:
        print("Could not read a date from the filename. Pass --date YYYY-MM-DD.", file=sys.stderr)
        return 1

    folder = SITE / "announcements" / day
    folder.mkdir(parents=True, exist_ok=True)
    stored = folder / pdf.name
    shutil.copy2(pdf, stored)
    flyer = folder / "flyer.jpg"
    render_flyer(stored, flyer)
    text = extract_text(stored)
    (folder / "extracted.txt").write_text(text, encoding="utf-8")

    stub = {
        "id": f"{day}-announcement",
        "title": "Untitled session — set this from the flyer",
        "titleTe": "",
        "kind": "group",
        "inviteTe": "అందరికీ ఇదే ఆహ్వానము",
        "startsAt": f"{day}T18:00:00+05:30",
        "timezoneLabel": "6:00 PM IST / 7:30 AM US Central",
        "durationMinutes": 90,
        "joinUrl": "",
        "ics": f"events/sanghamitra-{day}.ics",
        "pdf": f"announcements/{day}/{stored.name}",
        "flyer": f"announcements/{day}/flyer.jpg",
        "openTo": "Everyone is welcome. Same invitation for all.",
        "_extracted": text[:800],
    }
    print(json.dumps(stub, ensure_ascii=False, indent=2))
    print(f"\nWrote {stored.relative_to(ROOT)} and {flyer.relative_to(ROOT)}", file=sys.stderr)
    print("Paste the object into site/data/site.json events after fixing title and Zoom.", file=sys.stderr)
    print(f"Ingested {pdf.name} for {day} at {datetime.now().isoformat(timespec='minutes')}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
