// Search box on magazine.html. Reads data/magazine-search-index.json, which
// tools/magazine/generate.py writes in the same run as the pages it points at.
// Plain substring matching: it works the same on Telugu script as on English,
// with no word-splitting or stemming that only understands Latin letters.
(function () {
  const box = document.getElementById("search");
  const input = document.getElementById("magazine-q");
  const status = box && box.querySelector("[data-search-status]");
  const list = box && box.querySelector("[data-search-results]");
  if (!box || !input || !status || !list) return;
  box.hidden = false; // without JavaScript the box would do nothing, so it stays hidden

  const HINT = status.textContent;
  const LIMIT = 40;
  const STATE = { read: "read online", pdf: "PDF", whole: "in the whole issue", none: "not online yet" };
  const RANK = { read: 3, pdf: 2, whole: 1, none: 0 };
  let entries = null;
  let loading = null;

  // Same text, same form: composed Unicode, no invisible joiners, one space, Latin lower-cased.
  // toLowerCase leaves Telugu untouched, which is what we want.
  const norm = (s) => String(s || "").normalize("NFC").replace(/[​-‍﻿]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

  function load() {
    if (!loading) {
      loading = fetch("data/magazine-search-index.json")
        .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then((data) => {
          entries = (data.entries || []).map((e) => ({
            e,
            title: norm([e.t, e.te, e.alt].join(" ")),
            who: norm([e.by].concat(e.aka || []).join(" ")),
            col: norm([e.col, e.ck, e.note].join(" ")),
            when: norm([e.iss, e.when, e.y].join(" ")),
            body: norm(e.body),
          }));
        });
    }
    return loading;
  }

  function score(x, terms) {
    let s = 0;
    for (const q of terms) {
      const hit = x.title.includes(q) ? 6 : x.who.includes(q) ? 5 : x.col.includes(q) ? 4 : x.when.includes(q) ? 3 : x.body.includes(q) ? 1 : 0;
      if (!hit) return 0; // every word typed must be found somewhere
      s += hit;
    }
    if (x.e.k !== "item") s += 3; // an issue or a column is the better door when its own name matches
    return s * 10 + (RANK[x.e.st] || 0);
  }

  function snippet(text, terms) {
    const low = norm(text);
    const q = terms.find((t) => low.includes(t));
    if (!q) return "";
    const at = low.indexOf(q);
    const start = Math.max(0, at - 60);
    // The index text is already one-spaced, so positions in the lower-cased copy match the original.
    const src = String(text).normalize("NFC");
    return (start ? "…" : "") + src.slice(start, at + q.length + 80).trim() + "…";
  }

  function el(tag, cls, text, attrs) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, v);
    return n;
  }

  function row(x, terms) {
    const e = x.e;
    const li = el("li");
    const external = e.st === "pdf" && e.k === "item";
    const linkAttrs = external ? { href: e.url, target: "_blank", rel: "noopener" } : { href: e.url };
    if (e.k === "item") {
      const lang = e.lang === "en" ? "English" : "Telugu";
      li.append(el("span", "lang-mark", lang.slice(0, 2), { title: lang }), " ");
      li.append(el("a", "", e.t, linkAttrs));
      if (e.te) li.append(" ", el("span", "", e.te, { lang: "te" }));
      li.append(el("span", "tag" + (e.st === "none" ? " tag-missing" : ""), STATE[e.st]));
      const meta = el("span", "muted search-meta");
      if (e.by) meta.append(document.createTextNode(e.by + " · "));
      meta.append(el("a", "", e.iss, { href: e.issue }));
      if (e.col && e.col !== e.t) meta.append(document.createTextNode(" · " + e.col));
      li.append(meta);
      if (e.st === "none") li.append(el("span", "muted search-meta", "Only its name survives in the contents of this issue so far."));
      const meta2 = x.title + " " + x.who + " " + x.col + " " + x.when;
      const inBodyOnly = terms.filter((t) => !meta2.includes(t) && x.body.includes(t));
      if (inBodyOnly.length) {
        const s = snippet(e.body, inBodyOnly);
        if (s) li.append(el("span", "muted search-meta search-snippet", s));
      }
    } else {
      li.append(el("span", "lang-mark", e.k === "issue" ? "Issue" : "Column"), " ");
      li.append(el("a", "", e.t, linkAttrs));
      const n = e.n || 0;
      const what = e.k === "issue"
        ? [e.when, n ? `${n} piece${n === 1 ? "" : "s"} to read` : "", e.st === "whole" ? "whole issue" : ""]
        : [n ? `${n} instalment${n === 1 ? "" : "s"} to read` : "none online yet", e.note || ""];
      li.append(el("span", "muted search-meta", what.filter(Boolean).join(" · ")));
    }
    return li;
  }

  function render(raw) {
    const terms = norm(raw).split(" ").filter(Boolean);
    list.replaceChildren();
    if (!terms.length) { status.textContent = HINT; return; }
    const hits = [];
    for (const x of entries) {
      const s = score(x, terms);
      if (s) hits.push([s, x]);
    }
    hits.sort((a, b) => b[0] - a[0] || (b[1].e.y || 0) - (a[1].e.y || 0) || (b[1].e.m || 0) - (a[1].e.m || 0));
    if (!hits.length) {
      status.textContent = `Nothing in the magazine matches “${raw.trim()}”. Try fewer letters, one word at a time, or look through the issues and columns below. Many Telugu pieces are known only by their column name so far, not by their own title.`;
      return;
    }
    const shown = hits.slice(0, LIMIT);
    status.textContent = hits.length > LIMIT
      ? `${hits.length} matches. The first ${LIMIT} are below; add another word to narrow them.`
      : `${hits.length} match${hits.length === 1 ? "" : "es"}.`;
    for (const [, x] of shown) list.append(row(x, terms));
  }

  let timer = 0;
  function onInput() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const q = input.value;
      try {
        const u = new URL(location.href);
        if (q.trim()) u.searchParams.set("q", q.trim()); else u.searchParams.delete("q");
        history.replaceState(null, "", u);
      } catch { /* the address bar is a convenience only */ }
      if (entries) return render(q);
      status.textContent = "Loading the magazine’s contents…";
      load().then(() => render(input.value)).catch(() => {
        status.textContent = "The search could not load just now. Every issue and column is still listed below.";
      });
    }, 120);
  }

  input.addEventListener("input", onInput);
  input.addEventListener("focus", () => { load().catch(() => {}); }, { once: true });
  const q0 = new URLSearchParams(location.search).get("q");
  if (q0) { input.value = q0; onInput(); }
})();
