#!/usr/bin/env python3
"""Seed magazine PDFs into local or remote ADMIN KV for testing.

Usage:
  .venv-whisper/bin/python tools/seed-magazine.py          # local preview KV
  .venv-whisper/bin/python tools/seed-magazine.py --remote # production KV (careful)

Cover images are rendered from page 1 when pymupdf is available in the venv.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PREVIEW_NS = "d5c20709f70c4b308379cd5ba253bda7"
PROD_NS = "f392d8c33aa54a68b3db16e22d8237f7"

MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

DEFAULT_ISSUES = [
    {
        "path": Path("/mnt/c/Users/prade/Downloads/fullbook_eng (1).pdf"),
        "title": "Sanghamitra Magazine — August 2008",
        "year": 2008,
        "month": 8,
        "note": "Archive from the original quarterly magazine.",
    },
    {
        "path": Path("/mnt/c/Users/prade/Downloads/fullbook_eng.pdf"),
        "title": "Sanghamitra Magazine — May 2008",
        "year": 2008,
        "month": 5,
        "note": "Archive from the original quarterly magazine.",
    },
]


def when_label(year: int, month: int) -> str:
    return f"{MONTHS[month - 1]} {year}"


def run(cmd: list[str]) -> None:
    print("+", " ".join(cmd))
    subprocess.run(cmd, cwd=ROOT, check=True)


def put_blob(namespace: str, item_id: str, pdf: Path, local: bool) -> None:
    cmd = [
        "npx", "wrangler", "kv", "key", "put",
        f"blob:{item_id}",
        f"--namespace-id={namespace}",
        f"--path={pdf}",
        "--metadata", json.dumps({"type": "application/pdf"}),
    ]
    if local:
        cmd.append("--local")
    run(cmd)


def put_library(namespace: str, items: list[dict], local: bool) -> None:
    cmd = [
        "npx", "wrangler", "kv", "key", "put",
        "library",
        json.dumps(items, ensure_ascii=False),
        f"--namespace-id={namespace}",
    ]
    if local:
        cmd.append("--local")
    run(cmd)


def render_preview(pdf: Path, out: Path, width: int = 520) -> None:
    import pymupdf

    doc = pymupdf.open(pdf)
    page = doc.load_page(0)
    scale = width / page.rect.width
    pix = page.get_pixmap(matrix=pymupdf.Matrix(scale, scale), alpha=False)
    pix.save(out)
    doc.close()


def put_preview(namespace: str, item_id: str, preview: Path, local: bool) -> None:
    cmd = [
        "npx", "wrangler", "kv", "key", "put",
        f"preview:{item_id}",
        f"--namespace-id={namespace}",
        f"--path={preview}",
        "--metadata", json.dumps({"type": "image/jpeg"}),
    ]
    if local:
        cmd.append("--local")
    run(cmd)


def build_items(issues: list[dict]) -> list[dict]:
    out = []
    now = datetime.now(timezone.utc).isoformat()
    for issue in issues:
        pdf = Path(issue["path"])
        if not pdf.is_file():
            raise SystemExit(f"missing PDF: {pdf}")
        item_id = str(uuid.uuid4())
        year = int(issue["year"])
        month = int(issue["month"])
        preview_path = Path(f"/tmp/sanghamitra-cover-{item_id}.jpg")
        try:
            render_preview(pdf, preview_path)
            has_preview = True
        except Exception as exc:
            print(f"warning: could not render cover for {pdf.name}: {exc}", file=sys.stderr)
            preview_path = None
            has_preview = False
        out.append({
            "id": item_id,
            "shelf": "magazine",
            "title": issue["title"],
            "note": issue.get("note", ""),
            "when": when_label(year, month),
            "year": year,
            "month": month,
            "type": "application/pdf",
            "hasPreview": has_preview,
            "uploadedBy": "tools/seed-magazine.py",
            "createdAt": now,
            "_pdf": str(pdf),
            "_preview": str(preview_path) if preview_path else None,
            "_id": item_id,
        })
    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--remote", action="store_true", help="Write to production KV")
    args = parser.parse_args()

    local = not args.remote
    namespace = PROD_NS if args.remote else PREVIEW_NS
    items = build_items(DEFAULT_ISSUES)

    for item in items:
        put_blob(namespace, item["_id"], Path(item["_pdf"]), local=local)
        if item.get("_preview"):
            put_preview(namespace, item["_id"], Path(item["_preview"]), local=local)
        del item["_pdf"]
        if "_preview" in item:
            del item["_preview"]
        del item["_id"]

    put_library(namespace, items, local=local)

    print("\nSeeded magazine issues:")
    for item in sorted(items, key=lambda i: (i["year"], i["month"]), reverse=True):
        print(f"  - {item['when']}: {item['title']}")
    print(f"\nKV namespace: {'production' if args.remote else 'local preview'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
