/** Owner-facing build menu — things Pradeep can ship to save Sreenivasa time. */
export const BUILD_GROUPS = [
  { id: "quick", title: "Save me time on things I do often" },
  { id: "site", title: "Make the public site work harder for me" },
  { id: "later", title: "Bigger — only if I ask" },
];

export const BUILD_ITEMS = [
  {
    id: "wa-invite",
    group: "quick",
    title: "Copy a sitting invite for WhatsApp",
    why: "One button — date, Zoom link, and flyer text ready to paste in your group.",
  },
  {
    id: "duplicate-sitting",
    group: "quick",
    title: "Start a new sitting from the last one",
    why: "Copy an old sitting and change the date — not a blank form every time.",
  },
  {
    id: "longer-signin",
    group: "quick",
    title: "Stay signed in longer on my phone",
    why: "Fewer six-digit codes when I come back to update the site.",
  },
  {
    id: "seed-2008-magazine",
    group: "quick",
    title: "Put my May and August 2008 magazine PDFs online",
    why: "You already have the files — upload them so I do not have to hunt and attach again.",
  },
  {
    id: "batch-magazine",
    group: "quick",
    title: "Upload several magazine issues at once",
    why: "Drop a few PDFs in one go instead of one visit per issue.",
  },
  {
    id: "rsvp-list",
    group: "quick",
    title: "A simple list of who said I'm coming",
    why: "Copy or print names for a sitting without digging through messages.",
  },
  {
    id: "give-one-page",
    group: "quick",
    title: "One short Give setup page in my login",
    why: "Zelle, Venmo, PayPal, and check instructions in one place — not buried in a long form.",
  },
  {
    id: "auto-hide-past",
    group: "site",
    title: "Hide past sittings automatically",
    why: "After a sitting passes, the site shows the next one or WhatsApp — I should not hide old ones by hand.",
  },
  {
    id: "reply-shortcuts",
    group: "site",
    title: "Short reply buttons for visitor messages",
    why: "Tap “Thanks — I will WhatsApp you” instead of typing the same line again.",
  },
  {
    id: "mark-handled",
    group: "site",
    title: "Mark a visitor message as handled",
    why: "When I already answered on WhatsApp, clear it without writing a reply here.",
  },
  {
    id: "mobile-admin",
    group: "site",
    title: "Easier login on my phone",
    why: "Bigger buttons and a simpler menu when I am not at a computer.",
  },
  {
    id: "dns-handoff",
    group: "later",
    title: "Instructions to point sanghamitra.org here",
    why: "Plain steps when I am ready — not before.",
  },
  {
    id: "telugu-pages",
    group: "later",
    title: "Telugu alongside English on key pages",
    why: "Home, Learn, or Events in both languages — only if I want it.",
  },
  {
    id: "magazine-restart",
    group: "later",
    title: "Help restart the magazine as something new",
    why: "Not just old PDFs — a path to new issues if I want that again.",
  },
];

export function buildCatalogForUi() {
  return BUILD_GROUPS.map((g) => ({
    ...g,
    items: BUILD_ITEMS.filter((i) => i.group === g.id),
  }));
}

export function formatBuildPicksText({ picks, note, authorName }) {
  const chosen = BUILD_ITEMS.filter((i) => picks.includes(i.id));
  const skipped = BUILD_ITEMS.filter((i) => !picks.includes(i.id));
  const lines = [
    `${authorName} chose what to build next on Sanghamitra:`,
    "",
  ];
  if (chosen.length) {
    lines.push("Build these:");
    chosen.forEach((item, n) => {
      lines.push(`${n + 1}. ${item.title}`);
      if (item.why) lines.push(`   ${item.why}`);
    });
  } else {
    lines.push("Build these: (none checked — see note below)");
  }
  if (note) {
    lines.push("");
    lines.push("Note:");
    lines.push(note);
  }
  if (skipped.length && chosen.length) {
    lines.push("");
    lines.push("Not chosen this round:");
    skipped.forEach((item) => lines.push(`- ${item.title}`));
  }
  lines.push("");
  lines.push("Open admin: https://sanghamitra.pages.dev/admin/#build-next");
  return lines.join("\n");
}

export function formatBuildPicksHtml({ picks, note, authorName }) {
  const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const chosen = BUILD_ITEMS.filter((i) => picks.includes(i.id));
  const chosenHtml = chosen.length
    ? `<ol>${chosen.map((item) => `<li><strong>${esc(item.title)}</strong>${item.why ? `<br><span style="color:#555">${esc(item.why)}</span>` : ""}</li>`).join("")}</ol>`
    : "<p><em>None checked — see note below.</em></p>";
  const noteHtml = note ? `<p><strong>Note:</strong></p><pre style="white-space:pre-wrap;font-family:Georgia,serif">${esc(note)}</pre>` : "";
  return `<p><strong>${esc(authorName)}</strong> chose what to build next on Sanghamitra.</p><p><strong>Build these:</strong></p>${chosenHtml}${noteHtml}<p><a href="https://sanghamitra.pages.dev/admin/#build-next">Open in admin</a></p>`;
}
