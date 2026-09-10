#!/usr/bin/env python3
"""Every recording on the channel, listed on the Watch page so a visitor can find a sitting.

Re-lists the YouTube channel (regular uploads and live-streamed sittings), checks each recording
still plays for a visitor, keeps a snapshot in research/transcripts/channel-videos.tsv, and rewrites
the block between the channel markers in site/watch.html. Recordings already featured elsewhere on
the page are not listed twice.

    .venv-whisper/bin/python tools/channel.py            # re-list the channel, then write the page
    .venv-whisper/bin/python tools/channel.py --offline  # rebuild the page from the last snapshot

Titles are his, verbatim. Nothing is invented: no descriptions, no dates, no translations. The
group headings are the only words this tool writes, and each group is decided by his own title
(or, in OVERRIDES, by his own video description).
"""
import html
import os
import re
import subprocess
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# The venv's yt-dlp, not the system one: the system build (2024.04) lists nothing for this channel.
YTDLP = os.path.join(ROOT, ".venv-whisper", "bin", "yt-dlp")
CHANNEL = "https://www.youtube.com/channel/UC9_k_PSwL4R_kCzjXe7biSg"
SNAPSHOT = os.path.join(ROOT, "research", "transcripts", "channel-videos.tsv")
PAGE = os.path.join(ROOT, "site", "watch.html")
START = "<!-- channel:start"
END = "<!-- channel:end -->"
TELUGU = re.compile(r"[ఀ-౿]")
LATIN = re.compile(r"[A-Za-z]")

# Multi-day sittings: one recording a day. (pattern, name shown, second name shown or None)
TE_ORDINALS = {"మొదటి": 1, "రెండవ": 2, "మూడవ": 3, "నాల్గవ": 4, "ఐదవ": 5, "ఆరవ": 6, "ఏడవ": 7}
SERIES = [
    (re.compile(r"సుందర కాండము\s*-\s*Day\s*(\d+)"), "సుందర కాండము", None),
    (re.compile(r"Sri\s*Rama\s*Katha\s*Vahini\s*-?\s*Day\s*(\d+)", re.I), "Sri Rama KathaVahini", None),
    (re.compile(r"(?:Sri Bhagawataamruta Jhari|శ్రీమద్భాగవతామృత ఝరి)\s*-?\s*Day\s*(\d+)"),
     "Sri Bhagawataamruta Jhari", "శ్రీమద్భాగవతామృత ఝరి"),
    (re.compile(r"భాగవత సప్తాహ ప్రసంగలహరి\s*(\S+?)రోజు"), "భాగవత సప్తాహ ప్రసంగలహరి", None),
]
GROUPS = [
    ("harikatha", "Harikatha", re.compile(r"harikatha|హరికథ", re.I)),
    ("maths", "Medhavadhanam and Vedic mathematics", re.compile(r"medhavadhanam|vedic math|ekadhikena", re.I)),
    ("workshops", "Workshops", re.compile(r"workshop", re.I)),
    ("talks", "Talks, stories and the other arts", None),
]
# Where the title alone does not say, the video's own description does.
OVERRIDES = {
    "zxf8MMyAV0I": "maths",  # description: a talk on the Vedic mathematics sutra Vilokanam
}


def list_channel():
    rows = []
    for tab in ("videos", "streams"):
        out = subprocess.run(
            [YTDLP, "--flat-playlist", "--print", "%(id)s\t%(duration_string)s\t%(title)s", f"{CHANNEL}/{tab}"],
            capture_output=True, text=True, timeout=600,
        )
        found = [line.split("\t", 2) for line in out.stdout.splitlines() if line.count("\t") >= 2]
        if out.returncode != 0 or not found:
            # Refuse to write an empty list over a good one.
            sys.exit(f"yt-dlp listed nothing under {tab} (exit {out.returncode}): {out.stderr.strip()[-300:]}")
        rows += [{"tab": tab, "id": i, "duration": d, "title": t.strip()} for i, d, t in found]
    return rows


def playability(video_id):
    """What a visitor gets: OK, or YouTube's reason (LOGIN_REQUIRED, UNPLAYABLE, ERROR).
    Returns (status, publish date or '')."""
    req = urllib.request.Request(
        f"https://www.youtube.com/watch?v={video_id}",
        headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "en"},
    )
    try:
        page = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")
    except Exception as e:  # a network fault is not a verdict on the video
        return f"UNCHECKED:{type(e).__name__}", ""
    status = re.search(r'"playabilityStatus":\{"status":"(\w+)"', page)
    date = re.search(r'"(?:publishDate|uploadDate)":"(\d{4}-\d{2}-\d{2})', page)
    return (status.group(1) if status else "UNCHECKED:no-status"), (date.group(1) if date else "")


def write_snapshot(rows):
    with open(SNAPSHOT, "w", encoding="utf-8") as f:
        f.write("tab\tid\tduration\tstatus\tpublished\ttitle\n")
        for r in rows:
            f.write(f"{r['tab']}\t{r['id']}\t{r['duration']}\t{r['status']}\t{r['published']}\t{r['title']}\n")


def read_snapshot():
    with open(SNAPSHOT, encoding="utf-8") as f:
        lines = f.read().splitlines()
    if not lines or not lines[0].startswith("tab\tid"):
        sys.exit("The snapshot is in the old format; run once without --offline.")
    keys = lines[0].split("\t")
    return [dict(zip(keys, line.split("\t", len(keys) - 1))) for line in lines[1:] if line.strip()]


def human_duration(d):
    parts = [int(p) for p in d.split(":")] if d and d != "NA" else []
    if len(parts) == 3:
        return f"{parts[0]} h {parts[1]} min" if parts[1] else f"{parts[0]} h"
    if len(parts) == 2:
        return f"{max(parts[0], 1)} min"
    return ""


def lang_attr(title):
    return ' lang="te"' if TELUGU.search(title) and not LATIN.search(title) else ""


def watch_url(video_id):
    return f"https://www.youtube.com/watch?v={video_id}"


def series_of(title):
    for pattern, name, alt in SERIES:
        m = pattern.search(title)
        if not m:
            continue
        day = m.group(1)
        day = int(day) if day.isdigit() else TE_ORDINALS.get(day)
        if day:
            return name, alt, day
    return None


def render(rows, featured):
    listed = [r for r in rows if r["id"] not in featured and r["status"] == "OK"]
    listed.sort(key=lambda r: r.get("published") or "", reverse=True)  # newest first
    series, groups = {}, {key: [] for key, _, _ in GROUPS}
    for r in listed:
        s = series_of(r["title"])
        if s:
            name, alt, day = s
            series.setdefault((name, alt), []).append((day, r))
            continue
        key = OVERRIDES.get(r["id"])
        if not key:
            key = next(k for k, _, rx in GROUPS if rx is None or rx.search(r["title"]))
        groups[key].append(r)

    out = [f"{START} — generated by tools/channel.py; edit the tool, not this block -->",
           '<section id="channel">',
           '  <p class="kicker">On the channel</p>',
           "  <h2>Every sitting on the channel.</h2>",
           f'  <p class="lede">{len(listed)} more recordings: Harikatha, week-long readings of the Bhagavatam and the '
           "Ramayana, Medhavadhanam years, and talks. The titles are the ones on YouTube, many of them in Telugu, "
           "and every recording is free to watch.</p>"]
    if series:
        out.append("  <h3>Week-long sittings, one recording a day</h3>")
        for (name, alt), days in series.items():
            days.sort(key=lambda x: x[0])
            label = f'<strong{lang_attr(name)}>{html.escape(name)}</strong>'
            if alt:
                label += f' · <span{lang_attr(alt)}>{html.escape(alt)}</span>'
            links = " · ".join(
                f'<a href="{watch_url(r["id"])}" aria-label="{html.escape(name)}, day {d}">Day {d}</a>'
                + (f' <span class="muted">{human_duration(r["duration"])}</span>' if human_duration(r["duration"]) else "")
                for d, r in days
            )
            out += ['  <div class="series">', f"    <p>{label}</p>", f'    <p class="series-days">{links}</p>', "  </div>"]
    for key, heading, _ in GROUPS:
        items = groups[key]
        if not items:
            continue
        out += [f"  <h3>{heading}</h3>", '  <ul class="column-list channel-list">']
        for r in items:
            dur = human_duration(r["duration"])
            out.append(f'    <li><a href="{watch_url(r["id"])}"{lang_attr(r["title"])}>{html.escape(r["title"])}</a>'
                       + (f' <span class="muted">{dur}</span>' if dur else "") + "</li>")
        out.append("  </ul>")
    out += ["</section>", END]
    return "\n".join(out), len(listed)


def main():
    offline = "--offline" in sys.argv
    if offline:
        rows = read_snapshot()
    else:
        rows = list_channel()
        with ThreadPoolExecutor(8) as pool:
            for r, (status, published) in zip(rows, pool.map(playability, [r["id"] for r in rows])):
                r["status"], r["published"] = status, published
        write_snapshot(rows)

    page = open(PAGE, encoding="utf-8").read()
    a, b = page.find(START), page.find(END)
    if a < 0 or b < a:
        sys.exit(f"No channel markers in {PAGE}.")
    outside = page[:a] + page[b + len(END):]
    featured = set(re.findall(r"(?:v=|embed/)([A-Za-z0-9_-]{11})", outside))
    block, n = render(rows, featured)
    open(PAGE, "w", encoding="utf-8").write(page[:a] + block + page[b + len(END):])

    skipped = [r for r in rows if r["status"] != "OK"]
    print(f"{len(rows)} on the channel · {len(featured & {r['id'] for r in rows})} featured above · {n} listed")
    for r in skipped:
        print(f"  not listed ({r['status']}): {r['id']} {r['title']}")


if __name__ == "__main__":
    main()
