#!/usr/bin/env python3
"""Rewrite public-page nav + footer to the org chrome. Admin/intake left alone."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1] / "site"

# class="on-wide" hides a link on phones, where eight links wrap into three rows
# under a sticky header. Learn / Give / Invite / Contact / Enroll survive there;
# the rest stay one tap away in the footer.
NAV = """      <nav>
        <a href="about.html" class="on-wide"{about}>About</a>
        <a href="learn.html"{learn}>Learn</a>
        <a href="poetry.html" class="on-wide"{poetry}>Poetry</a>
        <a href="talks.html"{talks}>Invite</a>
        <a href="give.html"{give}>Give</a>
        <a href="events.html" class="on-wide"{events}>Events</a>
        <a href="contact.html"{contact}>Contact</a>
        <a href="learn.html#enroll" class="cta"{enroll}>Enroll</a>
      </nav>"""

FOOTER = """  <footer class="site-footer">
    <div class="wrap footer-grid">
      <div>
        <p>© <span data-year>2026</span> Sanghamitra · సంఘమిత్ర</p>
        <p class="muted">An organization. Sreenivasa Ainapurapu is the founder and the face of the work.</p>
      </div>
      <p class="social">
        <a href="book.html">Get involved</a>
        <a href="learn.html#enroll">Enroll</a>
        <a href="give.html#donate">Donate</a>
        <a href="give.html#volunteer">Volunteer</a>
        <a href="talks.html">Book a talk</a>
        <a href="contact.html">Contact Sreenivasa</a>
        <a href="poetry.html">Poetry</a>
        <a href="magazine.html">Magazine</a>
        <a href="press.html">Press</a>
        <a href="watch.html">Watch</a>
        <a href="gallery.html">Gallery</a>
        <a href="traditions.html">Traditions</a>
        <a href="admin/login.html">Admin</a>
      </p>
      <p class="social channels">
        <a href="https://wa.me/13146015309">WhatsApp Sreenivasa</a>
        <a href="https://chat.whatsapp.com/EAEwM6yk9jG3zIiRd6qOKg">WhatsApp group</a>
        <a href="https://www.youtube.com/@sreenivasaainapurapu3741/featured">YouTube</a>
        <a href="https://www.facebook.com/sreenivasa.ainapurapu">Facebook</a>
      </p>
    </div>
  </footer>"""

CURRENT = {
    "about.html": "about",
    "learn.html": "learn",
    "poetry.html": "poetry",
    "talks.html": "talks",
    "give.html": "give",
    "events.html": "events",
    "contact.html": "contact",
    "book.html": "enroll",
}


def nav_for(name):
    page = CURRENT.get(name, "")
    flags = {k: "" for k in ("about", "learn", "poetry", "talks", "give", "events", "contact", "enroll")}
    if page in flags:
        flags[page] = ' aria-current="page"'
    if name == "index.html":
        pass
    return NAV.format(**flags)


def patch(path: Path):
    text = path.read_text()
    text2, n1 = re.subn(r"<nav>.*?</nav>", nav_for(path.name), text, count=1, flags=re.S)
    text3, n2 = re.subn(r'<footer class="site-footer">.*?</footer>', FOOTER, text2, count=1, flags=re.S)
    if n1 or n2:
        path.write_text(text3)
        print(f"{path.name}: nav={n1} footer={n2}")
    else:
        print(f"{path.name}: no match")


def main():
    # 404.html is skipped: it must use absolute paths, because it is served
    # at whatever bad URL the visitor typed, including deep ones.
    skip = {"intake.html", "404.html"}
    for path in sorted(ROOT.glob("*.html")):
        if path.name in skip:
            continue
        patch(path)


if __name__ == "__main__":
    main()
