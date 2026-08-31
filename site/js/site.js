const SITE = {
  youtube: "https://www.youtube.com/@sreenivasaainapurapu3741/featured",
  facebook: "https://www.facebook.com/sreenivasa.ainapurapu",
  whatsappGroup: "https://chat.whatsapp.com/EAEwM6yk9jG3zIiRd6qOKg",
  whatsappDirect: "https://wa.me/13146015309",
};

const DEFAULT_WA = "https://wa.me/13146015309";
const DEFAULT_TEL = "tel:+13146015309";
const DEFAULT_GROUP = "https://chat.whatsapp.com/EAEwM6yk9jG3zIiRd6qOKg";
const DEFAULT_PHONE = "+1 314 601 5309";

function phoneToTel(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

function phoneToWa(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

function mergeSite(base, overlay) {
  const o = overlay && typeof overlay === "object" ? overlay : {};
  const out = JSON.parse(JSON.stringify(base || {}));
  out.links = out.links || {};
  out.person = out.person || {};
  out.copy = out.copy || {};
  if (o.personName) out.person.name = o.personName;
  if (o.publicEmail) out.links.email = o.publicEmail;
  if (o.phone) {
    out.links.phone = o.phone;
    out.links.phoneTel = phoneToTel(o.phone);
    out.links.whatsappDirect = phoneToWa(o.phone);
  }
  if (o.whatsappGroup) out.links.whatsappGroup = o.whatsappGroup;
  if (o.facebook) out.links.facebook = o.facebook;
  if (o.youtube) out.links.youtube = o.youtube;
  if (o.yearsLine) out.copy.yearsLine = o.yearsLine;
  if (o.whoLine) out.copy.whoLine = o.whoLine;
  if (o.homepageLede) out.copy.homepageLede = o.homepageLede;
  if (o.donateMode) out.copy.donateMode = o.donateMode;
  if (o.donateHow) out.copy.donateHow = o.donateHow;
  if (o.donateZelle) out.copy.donateZelle = o.donateZelle;
  if (o.donateVenmo) out.copy.donateVenmo = o.donateVenmo;
  if (o.donatePaypal) out.copy.donatePaypal = o.donatePaypal;
  if (o.enrollLive) out.copy.enrollLive = o.enrollLive;
  // Learn and Give pages read live answers saved from the owner console.
  out.copy.learnFacts = {
    ages: o.learnAges || "",
    when: o.learnWhen || "",
    where: o.learnWhere || "",
    cost: o.learnCost || "",
    format: o.learnFormat || "",
  };
  out.copy.giveExamples = Array.isArray(o.giveExamples) ? o.giveExamples.filter(Boolean).slice(0, 3) : [];

  const hidden = new Set(o.hiddenEventIds || []);
  const patches = o.eventPatches || {};
  const extras = o.extraEvents || [];
  const baseEvents = Array.isArray(out.events) ? out.events : [];
  const merged = baseEvents
    .filter((e) => !hidden.has(e.id))
    .map((e) => {
      const patch = patches[e.id];
      if (!patch) return e;
      const next = { ...e };
      for (const [k, v] of Object.entries(patch)) {
        if (v !== "" && v != null) next[k] = v;
      }
      return next;
    });
  for (const extra of extras) {
    if (!extra || !extra.id || hidden.has(extra.id)) continue;
    if (!merged.some((e) => e.id === extra.id)) merged.push(extra);
  }
  out.events = merged;
  return out;
}

function zelleTarget(data) {
  const C = (data && data.copy) || {};
  return String(C.donateZelle || "").trim();
}

function venmoHref(handle) {
  const name = String(handle || "").replace(/^@/, "").trim();
  return name ? `https://venmo.com/${encodeURIComponent(name)}` : "";
}

function paypalHref(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  const slug = s.replace(/^paypal\.me\//i, "").replace(/^\//, "");
  return slug ? `https://paypal.me/${slug.replace(/^\/+/, "")}` : "";
}

function renderPayMethods(data) {
  const box = document.getElementById("pay-methods");
  if (!box) return;
  const C = data.copy || {};
  const zelle = zelleTarget(data);
  const parts = [];
  if (zelle) {
    parts.push(`<article class="pay-method">
      <h3>Zelle</h3>
      <p>Send to <strong>${esc(zelle)}</strong> — Sreenivasa Ainapurapu. Open your bank app, then tell him below so he can thank you.</p>
      <button type="button" class="btn btn-ghost" data-copy="${esc(zelle)}">Copy the Zelle name or number</button>
    </article>`);
  }
  const venmo = venmoHref(C.donateVenmo);
  if (venmo) {
    parts.push(`<article class="pay-method">
      <h3>Venmo</h3>
      <p>If you use Venmo, send there and still leave your name on the form.</p>
      <a class="btn btn-primary" href="${esc(venmo)}" target="_blank" rel="noopener">Open Venmo</a>
    </article>`);
  }
  const paypal = paypalHref(C.donatePaypal);
  if (paypal) {
    parts.push(`<article class="pay-method">
      <h3>PayPal</h3>
      <a class="btn btn-primary" href="${esc(paypal)}" target="_blank" rel="noopener">Open PayPal</a>
    </article>`);
  }
  if (!parts.length && C.donateHow) {
    parts.push(`<article class="pay-method"><p>${esc(C.donateHow)}</p></article>`);
  }
  box.innerHTML = parts.join("");
  box.hidden = !parts.length;
  box.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(btn.getAttribute("data-copy") || "");
      btn.textContent = "Copied";
    });
  });
}

function wireGiftAmounts(data) {
  const zelle = zelleTarget(data);
  document.querySelectorAll("[data-gift]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const amt = btn.getAttribute("data-gift");
      const input = document.querySelector("form[data-donate] [name=amount]");
      if (input) input.value = `$${amt}`;
      const note = document.querySelector("form[data-donate] [name=notes]");
      if (note && !note.value.trim()) {
        note.value = zelle
          ? `I am sending $${amt} via Zelle to ${zelle}.`
          : `Gift in mind: $${amt}.`;
      }
    });
  });
}

function applyPublicSite(data) {
  const L = data.links || {};
  const C = data.copy || {};
  const P = data.person || {};
  if (L.whatsappDirect) {
    document.querySelectorAll(`a[href="${DEFAULT_WA}"]`).forEach((a) => { a.href = L.whatsappDirect; });
    SITE.whatsappDirect = L.whatsappDirect;
  }
  if (L.phoneTel) {
    document.querySelectorAll(`a[href="${DEFAULT_TEL}"]`).forEach((a) => { a.href = `tel:${L.phoneTel}`; });
  }
  if (L.whatsappGroup) {
    document.querySelectorAll(`a[href="${DEFAULT_GROUP}"]`).forEach((a) => { a.href = L.whatsappGroup; });
    SITE.whatsappGroup = L.whatsappGroup;
  }
  if (L.facebook) SITE.facebook = L.facebook;
  if (L.youtube) SITE.youtube = L.youtube;
  if (L.phone && L.phone !== DEFAULT_PHONE) {
    document.querySelectorAll("[data-bind='links.phone']").forEach((el) => { el.textContent = L.phone; });
  }
  const publicEmail = document.getElementById("public-email");
  if (publicEmail && L.email) {
    publicEmail.hidden = false;
    publicEmail.textContent = `Public email: ${L.email}`;
  }
  if (P.name) {
    document.querySelectorAll("[data-bind='person.name']").forEach((el) => { el.textContent = P.name; });
  }
  if (C.whoLine) {
    document.querySelectorAll("[data-bind='copy.whoLine']").forEach((el) => { el.textContent = C.whoLine; });
  }
  if (C.homepageLede) {
    document.querySelectorAll("[data-bind='copy.homepageLede']").forEach((el) => { el.textContent = C.homepageLede; });
  }
  if (C.yearsLine) {
    document.querySelectorAll("[data-bind='copy.yearsLine']").forEach((el) => { el.textContent = C.yearsLine; });
  }
  const how = document.getElementById("donate-how");
  if (how) {
    if (C.donateHow && C.donateMode !== "hide") {
      how.hidden = false;
      how.textContent = C.donateHow;
    } else {
      how.hidden = true;
    }
  }
  if (C.donateMode === "hide") {
    document.querySelectorAll("[data-donate]").forEach((el) => { el.hidden = true; });
  } else {
    renderPayMethods(data);
    wireGiftAmounts(data);
  }
  const live = C.enrollLive || {};
  document.querySelectorAll("[data-enroll]").forEach((el) => {
    const key = el.getAttribute("data-enroll");
    if (live[key] === false) el.hidden = true;
  });
}

async function loadSite() {
  const res = await fetch("/data/site.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load site data");
  const base = await res.json();
  let overlay = {};
  try {
    const live = await fetch("/api/site", { cache: "no-store" });
    if (live.ok) {
      const body = await live.json();
      overlay = body.overlay || {};
    }
  } catch {
    overlay = {};
  }
  const merged = mergeSite(base, overlay);
  if (merged.links && merged.links.whatsappDirect) SITE.whatsappDirect = merged.links.whatsappDirect;
  if (merged.links && merged.links.whatsappGroup) SITE.whatsappGroup = merged.links.whatsappGroup;
  return merged;
}

function formatEventWhen(event) {
  if (event.whenLabel) return event.whenLabel;
  try {
    const start = new Date(event.startsAt);
    const date = new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(start);
    return `${date} · ${event.timezoneLabel}`;
  } catch {
    return event.timezoneLabel;
  }
}

function isUpcoming(event) {
  return new Date(event.startsAt).getTime() + (event.durationMinutes || 90) * 60000 > Date.now();
}

function shareInvite(event) {
  const page = (typeof location !== "undefined" && location.origin)
    ? `${location.origin}/events.html#${event.id}`
    : `https://sanghamitra.pages.dev/events.html#${event.id}`;
  return [
    `Namaste. Please join Sanghamitra for ${event.title}${event.titleTe ? ` (${event.titleTe})` : ""}.`,
    event.timezoneLabel || formatEventWhen(event),
    event.joinUrl ? `Zoom: ${event.joinUrl}` : "",
    `Details: ${page}`,
    "Everyone is welcome.",
  ].filter(Boolean).join("\n");
}

function rsvpAndShare(event) {
  const invite = shareInvite(event);
  const waFriends = `https://wa.me/?text=${encodeURIComponent(invite)}`;
  return `
    <form class="intent rsvp-form">
      <input type="hidden" name="kind" value="rsvp">
      <input type="hidden" name="eventId" value="${esc(event.id)}">
      <input type="hidden" name="eventTitle" value="${esc(event.title)}">
      <h3>I’m coming</h3>
      <p>He gets your name. After the sitting he can thank you, and parents can ask about a class seat.</p>
      <div class="form-row">
        <label>Your name <input name="name" required autocomplete="name"></label>
        <label>Email <input name="email" type="email" required autocomplete="email"></label>
      </div>
      <div class="form-row">
        <label>Phone <input name="phone" type="tel" autocomplete="tel"></label>
        <label>City <input name="place" autocomplete="address-level2"></label>
      </div>
      <label class="opt"><input type="checkbox" name="alsoEnroll" value="yes"> Also enroll a student for math or SAT</label>
      <button class="btn btn-primary" type="submit">Save my name</button>
      <p class="intent-note" data-note></p>
    </form>
    <div class="share-pack">
      <p>Forward this sitting to family.</p>
      <div class="actions">
        <button type="button" class="btn btn-ghost" data-share-copy="${encodeURIComponent(invite)}">Copy invite</button>
        <a class="btn btn-dark" href="${esc(waFriends)}" target="_blank" rel="noopener">WhatsApp friends</a>
      </div>
    </div>`;
}

function shortEventDate(event) {
  if (!event.startsAt) return "";
  try {
    return new Date(event.startsAt).toLocaleDateString("en", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

function eventCard(event, { featured = false } = {}) {
  const upcoming = isUpcoming(event);
  const cls = `event-card${featured ? " featured" : ""}${event.flyer ? " event-with-flyer" : ""}`;
  const flyer = event.flyer
    ? `<a class="flyer-link" href="${event.pdf || event.flyer}"><img class="flyer" src="${event.flyer}" alt="${esc(event.title)} invitation"></a>`
    : "";
  const presenter = event.presenterTe || event.presenter
    ? `<p class="presenter">${event.presenterTe || ""}${event.presenter ? ` · ${esc(event.presenter)}` : ""}</p>`
    : "";
  const kicker = event.kicker || (event.kind === "group" ? "Group session" : "Session");
  const actions = [];
  if (upcoming && event.joinUrl) {
    const whenShort = shortEventDate(event);
    const joinLabel = whenShort ? `Join on Zoom · ${whenShort}` : "Join on Zoom";
    actions.push(`<a class="btn btn-primary" href="${esc(event.joinUrl)}">${joinLabel}</a>`);
  }
  if (upcoming && event.ics) {
    actions.push(`<a class="btn btn-ghost" href="${esc(event.ics)}">Add to calendar</a>`);
  }
  if (event.pdf) {
    actions.push(`<a class="btn btn-ghost" href="${esc(event.pdf)}">Open the PDF</a>`);
  }
  if (!upcoming && event.moreHref) {
    actions.push(`<a class="btn btn-ghost" href="${esc(event.moreHref)}">${esc(event.moreLabel || "Read more")}</a>`);
  }
  const actionBar = actions.length ? `<div class="actions">${actions.join("")}</div>` : "";
  const convert = upcoming && event.kind !== "learn" ? rsvpAndShare(event) : "";
  return `
    <article class="${cls}" id="${esc(event.id)}" data-event-title="${esc(event.title)}">
      <div>
        <p class="kicker">${esc(kicker)}</p>
        <h2>${esc(event.title)}${event.titleTe ? ` <span class="te">${esc(event.titleTe)}</span>` : ""}</h2>
        <p class="when">${esc(formatEventWhen(event))}</p>
        ${presenter}
        ${event.inviteTe ? `<p class="invite-te">${esc(event.inviteTe)}</p>` : ""}
        <p>${esc(event.blurb || event.openTo || "")}</p>
        ${event.blurbTe ? `<p class="te">${esc(event.blurbTe)}</p>` : ""}
        ${event.hostTe ? `<p>— ${esc(event.hostTe)}</p>` : ""}
        ${flyer}
        ${actionBar}
        ${convert}
      </div>
    </article>
  `;
}

function renderNextEvent(data, el) {
  const next = (data.events || []).find(isUpcoming);
  if (next) {
    el.innerHTML = eventCard(next, { featured: true });
    return;
  }
  // Nothing upcoming. Show the last sitting and the two places the next one gets
  // announced, so the page never reads as abandoned between gatherings.
  const last = (data.events || [])
    .filter((e) => !isUpcoming(e))
    .sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt))[0];
  const group = SITE.whatsappGroup;
  const channel = SITE.youtube;
  el.innerHTML = `
    <article class="event-card featured${last && last.flyer ? " event-with-flyer" : ""}">
      <div>
        <p class="kicker">Between gatherings</p>
        <h2>${last ? `The last sitting was ${esc(last.title)}` : "The next sitting is being arranged"}</h2>
        <p class="when">${last ? esc(formatEventWhen(last)) : ""}</p>
        <p>Dates for the next one go out on WhatsApp first. Recordings of past sittings stay on the channel.</p>
        ${last && last.flyer ? `<a class="flyer-link" href="${esc(last.pdf || last.flyer)}"><img class="flyer" src="${esc(last.flyer)}" alt="${esc(last.title)} invitation"></a>` : ""}
        <div class="actions">
          <a class="btn btn-primary" href="${esc(group)}">Join the WhatsApp group</a>
          <a class="btn btn-dark" href="${esc(channel)}">Watch on YouTube</a>
          <a class="btn btn-ghost" href="events.html">All events</a>
        </div>
      </div>
    </article>`;
}

let photosPromise = null;
function loadPhotosOnce() {
  if (!photosPromise) {
    photosPromise = fetch("/api/photos")
      .then((res) => (res.ok ? res.json() : { photos: [] }))
      .then((body) => body.photos || [])
      .catch(() => []);
  }
  return photosPromise;
}

async function attachActivityPhotos() {
  const slots = [...document.querySelectorAll("[data-activity]")];
  if (!slots.length) return;
  const photos = await loadPhotosOnce();
  const byActivity = new Map();
  for (const p of photos) {
    if (!p.activity) continue;
    if (!byActivity.has(p.activity)) byActivity.set(p.activity, p);
  }
  for (const slot of slots) {
    const photo = byActivity.get(slot.getAttribute("data-activity"));
    if (!photo) continue;
    slot.insertAdjacentHTML("beforeend", `
      <figure class="activity-photo">
        <img src="/media/${esc(photo.id)}" alt="${esc(photo.caption || "Sanghamitra")}" loading="lazy">
        ${photo.caption ? `<figcaption>${esc(photo.caption)}</figcaption>` : ""}
      </figure>`);
  }
}

// --- Poetry shelf and magazine archive (published from owner console) ---
function libraryItemActions(item) {
  const label = item.type === "application/pdf" ? "Open the PDF" : "Open it";
  return `<div class="actions">
    <a class="btn btn-dark" href="/media/${esc(item.id)}" target="_blank" rel="noopener">${label}</a>
    <a class="btn btn-ghost" href="/media/${esc(item.id)}" download>Save a copy</a>
  </div>`;
}

function libraryCover(item) {
  const alt = `Cover preview of ${item.title}`;
  if (item.type && item.type.startsWith("image/")) {
    return `<a class="library-cover" href="/media/${esc(item.id)}" target="_blank" rel="noopener">
      <img src="/media/${esc(item.id)}" alt="${esc(alt)}" loading="lazy">
    </a>`;
  }
  if (item.type !== "application/pdf") return "";

  if (item.hasPreview) {
    return `<a class="library-cover" href="/media/${esc(item.id)}" target="_blank" rel="noopener">
      <img src="/media/preview/${esc(item.id)}" alt="${esc(alt)}" loading="lazy">
    </a>`;
  }

  return `<a class="library-cover library-cover-pending" href="/media/${esc(item.id)}" target="_blank" rel="noopener" data-pdf-preview="${esc(item.id)}">
    <span class="library-cover-placeholder">Loading cover…</span>
  </a>`;
}

async function fillPdfPreviews(root) {
  if (!window.SMPdfPreview) return;
  const pending = [...root.querySelectorAll("[data-pdf-preview]")];
  for (const link of pending) {
    const id = link.getAttribute("data-pdf-preview");
    if (!id) continue;
    try {
      const dataUrl = await window.SMPdfPreview.renderFirstPageDataUrl(`/media/${id}`, 520);
      link.innerHTML = `<img src="${dataUrl}" alt="">`;
      link.classList.remove("library-cover-pending");
      link.removeAttribute("data-pdf-preview");
    } catch {
      link.innerHTML = `<span class="library-cover-placeholder">Open the PDF</span>`;
      link.classList.remove("library-cover-pending");
      link.removeAttribute("data-pdf-preview");
    }
  }
}

function renderLibraryItem(item) {
  return `<article class="card library-item">
    ${libraryCover(item)}
    <div class="library-body">
      ${item.when ? `<p class="kicker">${esc(item.when)}</p>` : ""}
      <h2>${esc(item.title)}</h2>
      ${item.note ? `<p>${esc(item.note)}</p>` : ""}
      ${libraryItemActions(item)}
    </div>
  </article>`;
}

async function mountMagazineShelf(el) {
  let items = [];
  try {
    const res = await fetch("/api/library");
    if (res.ok) items = ((await res.json()).items || []).filter((i) => i.shelf === "magazine");
  } catch {
    items = [];
  }
  if (!items.length) return;

  const empty = document.querySelector('[data-library-empty="magazine"]');
  if (empty) empty.hidden = true;

  const sorted = [...items].sort((a, b) => {
    const ay = Number(a.year) || 0;
    const by = Number(b.year) || 0;
    if (by !== ay) return by - ay;
    const am = Number(a.month) || 0;
    const bm = Number(b.month) || 0;
    if (bm !== am) return bm - am;
    return Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0);
  });

  const byYear = new Map();
  for (const item of sorted) {
    const year = item.year ? String(item.year) : "Undated";
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year).push(item);
  }
  const years = [...byYear.entries()].sort(([a], [b]) => {
    const na = Number(a);
    const nb = Number(b);
    if (Number.isFinite(na) && Number.isFinite(nb)) return nb - na;
    if (Number.isFinite(na)) return -1;
    if (Number.isFinite(nb)) return 1;
    return a.localeCompare(b);
  });

  el.innerHTML = years.map(([year, issues]) => `
    <section class="magazine-year">
      <h2>${esc(year)}</h2>
      <div class="magazine-months">
        ${issues.map((item) => renderLibraryItem(item)).join("")}
      </div>
    </section>`).join("");

  await fillPdfPreviews(el);
}

async function mountLibrary(shelf, el) {
  if (shelf === "magazine") return mountMagazineShelf(el);

  let items = [];
  try {
    const res = await fetch("/api/library");
    if (res.ok) items = ((await res.json()).items || []).filter((i) => i.shelf === shelf);
  } catch {
    items = [];
  }
  if (!items.length) return;
  const empty = document.querySelector(`[data-library-empty="${shelf}"]`);
  if (empty) empty.hidden = true;
  el.innerHTML = items.map((i) => renderLibraryItem(i)).join("");
  await fillPdfPreviews(el);
}

function eventPhotoRow(photos) {
  return `<div class="event-photos photos">${photos.map((p) => `
    <figure>
      <a href="${esc(p.src)}"><img src="${esc(p.src)}" alt="${esc(p.caption || "Event photo")}"></a>
      ${p.caption ? `<figcaption>${esc(p.caption)}</figcaption>` : ""}
    </figure>`).join("")}</div>`;
}

function findEventArticle(root, key) {
  if (!key) return null;
  const byId = root.querySelector(`#${CSS.escape(key)}`);
  if (byId) return byId;
  const needle = key.trim().toLowerCase();
  return [...root.querySelectorAll("[data-event-title]")].find((a) =>
    (a.getAttribute("data-event-title") || "").trim().toLowerCase() === needle
  ) || null;
}

async function attachEventPhotos(el) {
  try {
    const photos = await loadPhotosOnce();
    const eventPhotos = (photos || []).filter((p) => p.place === "events" || p.place === "both");
    if (!eventPhotos.length) return;

    const groups = new Map();
    for (const p of eventPhotos) {
      const key = String(p.eventId || p.eventTitle || "").trim() || "__loose";
      const list = groups.get(key) || [];
      list.push({ src: `/media/${p.id}`, caption: p.caption || "" });
      groups.set(key, list);
    }

    let earlier = el.querySelector("#earlier-sessions");
    if (!earlier) {
      el.insertAdjacentHTML("beforeend", `<div id="earlier-sessions"><h2>Earlier sessions</h2></div>`);
      earlier = el.querySelector("#earlier-sessions");
    }

    for (const [key, list] of groups) {
      if (key === "__loose") continue;
      const article = findEventArticle(el, key);
      if (article) {
        article.insertAdjacentHTML("beforeend", eventPhotoRow(list));
        continue;
      }
      earlier.insertAdjacentHTML("beforeend", `
        <article class="event-card event-with-photos">
          <div>
            <p class="kicker">Earlier sitting</p>
            <h2>${esc(key)}</h2>
          </div>
          ${eventPhotoRow(list)}
        </article>`);
    }

    const loose = groups.get("__loose");
    if (loose) {
      earlier.insertAdjacentHTML("beforeend", `
        <article class="event-card event-with-photos">
          <div>
            <p class="kicker">Earlier sittings</p>
            <h2>Photos from the hall</h2>
          </div>
          ${eventPhotoRow(loose)}
        </article>`);
    }
  } catch {
    /* public photos are optional */
  }
}

function renderEventList(data, el) {
  const upcoming = (data.events || []).filter(isUpcoming);
  const past = (data.events || []).filter((e) => !isUpcoming(e))
    .sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt));
  el.innerHTML = [
    upcoming.length ? upcoming.map((e) => eventCard(e, { featured: true })).join("") : "<p>No upcoming group sessions are listed. Request a 1:1 or watch the WhatsApp group.</p>",
    `<div id="earlier-sessions"><h2>Earlier sessions</h2>${
      past.length ? past.map((e) => eventCard(e)).join("") : "<p class=\"muted\" id=\"earlier-empty\">No earlier sessions are listed yet.</p>"
    }</div>`,
  ].join("");
  attachEventPhotos(el).then(() => {
    if (el.querySelector("#earlier-sessions .event-card") && el.querySelector("#earlier-empty")) {
      el.querySelector("#earlier-empty").remove();
    }
  });
}

function fillBookingChoices(data, select) {
  const upcoming = (data.events || []).filter(isUpcoming);
  select.innerHTML = [
    `<option value="">I want a new 1:1 time</option>`,
    ...upcoming.map((e) => `<option value="${esc(e.id)}">Join group: ${esc(e.title)} — ${esc(e.timezoneLabel)}</option>`),
  ].join("");
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function youtubeWatchUrl(id, t) {
  return t ? `https://www.youtube.com/watch?v=${id}&t=${t}s` : `https://www.youtube.com/watch?v=${id}`;
}

function renderChapters(youtubeId, chapters) {
  if (!chapters || !chapters.length) return "";
  return `<ol class="chapters">${chapters.map((c) => (
    `<li><a href="${youtubeWatchUrl(youtubeId, c.t)}" target="_blank" rel="noopener">${esc(c.label)}</a></li>`
  )).join("")}</ol>`;
}

function renderSessionCard(session) {
  const parts = session.parts && session.parts.length
    ? session.parts.map((part) => `
        <div class="session-part">
          <p><a href="${youtubeWatchUrl(part.youtubeId)}" target="_blank" rel="noopener">${esc(part.label)}</a></p>
          ${renderChapters(part.youtubeId, part.chapters)}
        </div>`).join("")
    : renderChapters(session.youtubeId, session.chapters);
  const quote = session.quote
    ? `<blockquote class="quote session-quote">${esc(session.quote)}<footer>— ${esc(session.quoteAttrib || "from the recording")}</footer></blockquote>`
    : "";
  return `
    <article class="card session-card" id="${esc(session.id)}">
      <p class="kicker">${esc(session.when || "Recording")}</p>
      <h2>${esc(session.title)}</h2>
      <p>${esc(session.blurb || "")}</p>
      ${quote}
      ${parts}
      <div class="actions">
        <a class="btn btn-dark" href="${youtubeWatchUrl(session.youtubeId)}" target="_blank" rel="noopener">Watch on YouTube</a>
      </div>
    </article>`;
}

function renderDemoChapters(data, el, { videoId, limit = 5 } = {}) {
  const marks = [];
  for (const session of data.sessions || []) {
    for (const part of session.parts || [{ youtubeId: session.youtubeId, chapters: session.chapters }]) {
      if (videoId && part.youtubeId !== videoId) continue;
      for (const c of part.chapters || []) marks.push({ id: part.youtubeId, ...c });
    }
  }
  if (!marks.length) {
    const block = el.closest("section");
    if (block) block.hidden = true;
    return;
  }
  el.innerHTML = marks.slice(0, limit).map((c) => (
    `<li><a href="${youtubeWatchUrl(c.id, c.t)}" target="_blank" rel="noopener">${esc(c.label)}</a></li>`
  )).join("");
}

function renderSessions(data, el) {
  const sessions = (data.sessions || []).filter((s) => !s.featured);
  if (!sessions.length) return;
  el.innerHTML = sessions.map(renderSessionCard).join("");
}

function renderLearnFacts(data, el) {
  const f = (data.copy && data.copy.learnFacts) || {};
  const rows = [
    ["Ages", f.ages],
    ["When", f.when],
    ["Where", f.where],
    ["Cost", f.cost],
    ["Online or in person", f.format],
  ].filter(([, v]) => v && String(v).trim());
  if (!rows.length) return; // the page keeps its own honest "ask him" line
  const ask = document.querySelector("[data-facts-empty]");
  if (ask) ask.hidden = true;
  el.innerHTML = `<dl class="facts">${rows.map(([k, v]) => (
    `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`
  )).join("")}</dl>`;
}

// --- 6A: what a gift actually covers, in his words ---
function renderGiveExamples(data, el) {
  const items = (data.copy && data.copy.giveExamples) || [];
  if (!items.length) return;
  const ask = document.querySelector("[data-give-empty]");
  if (ask) ask.hidden = true;
  el.innerHTML = `<ul class="covers">${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
}

function composeRequest({ name, email, phone, path, topic, notes }) {
  return [
    "Namaste. I found Sanghamitra through the website.",
    `Name: ${name}`,
    email ? `Email: ${email}` : "",
    phone ? `Phone: ${phone}` : "",
    `Request: ${path}`,
    topic ? `Interest: ${topic}` : "",
    notes ? `Notes: ${notes}` : "",
  ].filter(Boolean).join("\n");
}

function wireBookingForm(data) {
  const form = document.getElementById("booking-form");
  const select = document.getElementById("session-choice");
  const notice = document.getElementById("booking-notice");
  if (!form || !select || !notice) return;
  fillBookingChoices(data, select);

  const embed = data.booking && data.booking.embedUrl;
  const embedWrap = document.getElementById("calendar-embed");
  if (embed && embedWrap) {
    embedWrap.classList.remove("hidden");
    embedWrap.querySelector("iframe").src = embed;
  }

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const body = Object.fromEntries(new FormData(form).entries());
    const chosen = (data.events || []).find((e) => e.id === body.session);
    const path = chosen
      ? `I would like to join the group session (${chosen.title}, ${chosen.timezoneLabel}).`
      : "I would like to book a 1:1 session. Please send an open time.";
    const message = composeRequest({ ...body, path });
    notice.classList.remove("hidden");
    notice.classList.add("ok");
    notice.innerHTML = `
      <p><strong>Your request is ready.</strong> Send it to Sreenivasa on WhatsApp so he can confirm.</p>
      <pre style="white-space:pre-wrap">${message.replace(/</g, "&lt;")}</pre>
      <div class="actions">
        <a class="btn btn-primary" href="${SITE.whatsappDirect}?text=${encodeURIComponent(message)}" target="_blank" rel="noopener">WhatsApp Sreenivasa</a>
        <a class="btn btn-ghost" href="${SITE.whatsappGroup}" target="_blank" rel="noopener">Or open the group</a>
        <button type="button" class="btn btn-ghost" id="copy-request">Copy request</button>
      </div>
    `;
    notice.querySelector("#copy-request").addEventListener("click", async () => {
      await navigator.clipboard.writeText(message);
      notice.querySelector("#copy-request").textContent = "Copied";
    });
  });
}

const INTENT_OK = {
  enroll: "Received. Sreenivasa will write back about a seat. Also send the same note on WhatsApp if you want him to see it today.",
  donate: "Received. He will send how to give — this page does not take a card.",
  volunteer: "Received. He will write back about where help is needed.",
  talk: "Received. He will write back about the sitting.",
  poetry: "Received. He will send what is already public, or a time to hear it.",
  contact: "Received. Sreenivasa will reply by email.",
  rsvp: "Your name is saved. Add the sitting to your calendar, then join on Zoom at the hour.",
};

function composeIntentMessage(data) {
  if (data.message && data.message.trim()) return data.message.trim();
  return [
    data.eventTitle && `Event: ${data.eventTitle}`,
    data.program && `Program: ${data.program}`,
    data.student && `Student: ${data.student}`,
    data.org && `Host: ${data.org}`,
    data.place && `Place: ${data.place}`,
    data.when && `When: ${data.when}`,
    data.topic && `Topic: ${data.topic}`,
    data.amount && `Gift in mind: ${data.amount}`,
    data.alsoEnroll === "yes" && "Also wants to enroll a student for math or SAT",
    data.notes && data.notes.trim(),
  ].filter(Boolean).join("\n") || "A note from the website.";
}

function intentWhatsAppHref(data) {
  const body = composeRequest({
    name: data.name,
    email: data.email,
    phone: data.phone,
    path: data.kind || "contact",
    topic: data.program || data.topic || data.eventTitle || "",
    notes: composeIntentMessage(data),
  });
  return `${SITE.whatsappDirect}?text=${encodeURIComponent(body)}`;
}

function wireIntentForms() {
  document.addEventListener("submit", async (ev) => {
    const form = ev.target.closest && ev.target.closest("form.intent");
    if (!form) return;
    ev.preventDefault();
    const note = form.querySelector("[data-note]");
    const data = Object.fromEntries(new FormData(form).entries());
    const kind = data.kind || "contact";
    const res = await fetch("/api/queries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        kind,
        message: composeIntentMessage(data),
      }),
    });
    const out = await res.json().catch(() => ({}));
    if (note) {
      if (res.ok) {
        note.innerHTML = `${INTENT_OK[kind] || INTENT_OK.contact}
          <span class="actions" style="margin-top:0.7rem">
            <a class="btn btn-primary" href="${intentWhatsAppHref(data)}" target="_blank" rel="noopener">Also send on WhatsApp</a>
          </span>`;
      } else {
        note.textContent = out.error || "Could not send. Try WhatsApp.";
      }
    }
    if (res.ok) form.querySelectorAll("input:not([type=hidden]), select, textarea").forEach((el) => {
      if (el.type === "checkbox") el.checked = false;
      else el.value = "";
    });
  });

  document.addEventListener("click", async (ev) => {
    const copyBtn = ev.target.closest && ev.target.closest("[data-share-copy]");
    if (!copyBtn) return;
    ev.preventDefault();
    const raw = copyBtn.getAttribute("data-share-copy") || "";
    let text = raw;
    try { text = decodeURIComponent(raw); } catch { /* already plain */ }
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "Copied";
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  wireIntentForms();

  let data;
  try {
    data = await loadSite();
  } catch {
    data = { events: [], booking: {}, links: {}, copy: {}, person: {} };
  }
  applyPublicSite(data);

  const next = document.getElementById("next-event");
  if (next) renderNextEvent(data, next);
  const list = document.getElementById("event-list");
  if (list) renderEventList(data, list);
  if (document.getElementById("booking-form")) wireBookingForm(data);
  const archive = document.getElementById("session-archive");
  if (archive) renderSessions(data, archive);

  const demo = document.getElementById("demo-chapters");
  if (demo) renderDemoChapters(data, demo, { videoId: demo.getAttribute("data-video") || "", limit: Number(demo.getAttribute("data-limit")) || 5 });
  const facts = document.getElementById("learn-facts");
  if (facts) renderLearnFacts(data, facts);
  const covers = document.getElementById("give-covers");
  if (covers) renderGiveExamples(data, covers);

  attachActivityPhotos();
  const satakam = document.getElementById("satakam-shelf");
  if (satakam) mountLibrary("satakam", satakam);
  const issues = document.getElementById("magazine-shelf");
  if (issues) mountLibrary("magazine", issues);
});
