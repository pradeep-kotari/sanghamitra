#!/usr/bin/env python3
"""Fill the archive's gaps from Sreenivasa's own backup.
  fill.py --from DIR              report what a folder would fill (matched / ambiguous / unknown)
  fill.py --gdrive URL            download a shared Google Drive folder first (needs: pip install gdown)
  fill.py --from DIR --apply      copy matches into research/old-site/files/, redact on copy, regenerate
  fill.py ... --dest DIR          (testing) place files under DIR instead of research/old-site/files
Nothing is guessed: a file name that belongs to several missing issues is placed only if its folder says which."""
import sys, os, re, json, shutil, subprocess, collections
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = os.path.join(ROOT, "site"); FILES = os.path.join(ROOT, "research/old-site/files")
MONTHS = {m.lower(): i for i, m in enumerate(["January","February","March","April","May","June","July","August","September","October","November","December"], 1)}
SEASONS = {"sankranti": 1, "ugadi": 4, "july": 7, "dasami": 10, "dasara": 10, "vijaya": 10}
EXTRA_WANTED = ["Events/Medhavadhanam2007_Flyer.pdf", "index42.html", "index43.html", "index44.html"]

def wanted_list():
    mag = json.load(open(os.path.join(SITE, "data/magazine.json"), encoding="utf-8"))
    want = []  # (relative path under files/, issue id, label)
    for i in mag["issues"]:
        label = f"{i['season'] or ''} {i['year']}".strip()
        for it in i["items"]:
            if not it["available"]: want.append((it["file"], i["folder"], label))
        if i.get("nameOnly"): want.append((f"{i['folder']}/*", i["folder"], label))
    for x in EXTRA_WANTED: want.append((x, x.split("/")[0] if "/" in x else "", "never archived"))
    return want, {i["folder"]: (i["year"], i["month"]) for i in mag["issues"]}

def folder_hint(path_parts, folders):
    """Which issue folder does a file's location point at? Returns folder or None."""
    joined = " ".join(path_parts).lower()
    m = re.search(r"\bsrc\d{3,4}\b", joined)
    if m and m.group(0) in folders: return m.group(0)
    ym = re.search(r"\b(20\d\d)[-_/ .]?(0?[1-9]|1[0-2])\b", joined) or re.search(r"\b(0?[1-9]|1[0-2])[-_/ .](20\d\d)\b", joined)
    year = month = None
    if ym:
        a, b = ym.group(1), ym.group(2); year, month = (int(a), int(b)) if len(a) == 4 else (int(b), int(a))
    else:
        y = re.search(r"\b(20\d\d)\b", joined)
        if y:
            year = int(y.group(1))
            for w, mo in list(MONTHS.items()) + list(SEASONS.items()):
                if re.search(rf"\b{w}", joined): month = mo; break
    if year and month:
        for f, (fy, fm) in folders.items():
            if fy == year and (fm == month or (month == 3 and fm == 4) or (month == 4 and fm == 3)): return f
    return None

def scan(src_dir, want, folders):
    by_name = collections.defaultdict(list)
    for rel, folder, label in want:
        by_name[os.path.basename(rel).lower()].append((rel, folder, label))
    matched, ambiguous, unknown = [], [], []
    for r, _, fs in os.walk(src_dir):
        for f in fs:
            if f.startswith("."): continue
            full = os.path.join(r, f); parts = os.path.relpath(full, src_dir).split(os.sep)
            cands = by_name.get(f.lower(), [])
            hint = folder_hint(parts[:-1], folders)
            # a folder that names an issue we know only by name wins outright: any PDF in it belongs there
            if hint and any(rel == f"{hint}/*" for rel, _, _ in want) and f.lower().endswith(".pdf"):
                matched.append((full, f"{hint}/{f}", hint)); continue
            if not cands:
                unknown.append(full); continue
            if len(cands) == 1: matched.append((full, cands[0][0], cands[0][1])); continue
            pick = [c for c in cands if c[1] == hint] if hint else []
            if len(pick) == 1: matched.append((full, pick[0][0], pick[0][1]))
            else: ambiguous.append((full, sorted({c[2] + " (" + c[1] + ")" for c in cands})))
    return matched, ambiguous, unknown

def main(argv):
    src = None; apply = "--apply" in argv; dest = FILES
    if "--dest" in argv: dest = argv[argv.index("--dest") + 1]
    if "--from" in argv: src = argv[argv.index("--from") + 1]
    if "--gdrive" in argv:
        url = argv[argv.index("--gdrive") + 1]; src = os.path.join(ROOT, "research/old-site/inbox-gdrive")
        os.makedirs(src, exist_ok=True)
        if shutil.which("gdown") is None: print("gdown is not installed: pip install gdown, or download the folder and use --from"); return 2
        subprocess.run(["gdown", "--folder", "--remaining-ok", "-O", src, url], check=True)
    if not src or not os.path.isdir(src): print(__doc__); return 2
    want, folders = wanted_list()
    matched, ambiguous, unknown = scan(src, want, folders)
    print(f"wanted: {len(want)} · scanned: {sum(len(f) for _, _, f in os.walk(src))} files")
    print(f"  matched:   {len(matched)}"); [print(f"     {os.path.relpath(m[0], src)}  →  {m[1]}") for m in matched[:40]]
    print(f"  ambiguous: {len(ambiguous)}  (same name in several missing issues; put it in a folder named like the issue, e.g. src408 or 2008-04)")
    [print(f"     {os.path.relpath(a[0], src)}  could be: {', '.join(a[1][:6])}{' …' if len(a[1]) > 6 else ''}") for a in ambiguous[:20]]
    print(f"  unknown:   {len(unknown)}  (not on the missing list; photographs go through the owner console)")
    [print(f"     {os.path.relpath(u, src)}") for u in unknown[:10]]
    if not apply: print("\nreport only — add --apply to place the matches"); return 0
    placed = 0
    for full, rel, _ in matched:
        dst = os.path.join(dest, rel); os.makedirs(os.path.dirname(dst), exist_ok=True)
        if not os.path.exists(dst): shutil.copy2(full, dst); placed += 1
    print(f"\nplaced {placed} file(s) under {dest}")
    if dest == FILES:
        py = sys.executable
        subprocess.run([py, os.path.join(ROOT, "tools/magazine/extract.py")], check=True)   # copies + redacts into site/
        subprocess.run([py, os.path.join(ROOT, "tools/magazine/generate.py")], check=True)
        want2, _ = wanted_list(); print(f"still missing after this run: {len([w for w in want2 if not w[0].endswith('/*')])}")
    return 0
if __name__ == "__main__": sys.exit(main(sys.argv[1:]))
