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
  if (o.enrollLive) out.copy.enrollLive = o.enrollLive;

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
    if (C.donateMode === "how" && C.donateHow) {
      how.hidden = false;
      how.textContent = C.donateHow;
    } else {
      how.hidden = true;
    }
  }
  if (C.donateMode === "hide") {
    document.querySelectorAll("[data-donate]").forEach((el) => { el.hidden = true; });
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
    actions.push(`<a class="btn btn-primary" href="${esc(event.joinUrl)}">Click to join</a>`);
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
  return `
    <article class="${cls}" id="${esc(event.id)}" data-event-title="${esc(event.title)}">
      <div>
        <p class="kicker">${esc(kicker)}</p>
        <h2>${esc(event.titleTe || event.title)}</h2>
        <p class="when">${esc(formatEventWhen(event))}</p>
        ${presenter}
        ${event.inviteTe ? `<p class="invite-te">${esc(event.inviteTe)}</p>` : ""}
        <p>${esc(event.blurbTe || event.blurb || event.openTo || "")}</p>
        ${event.hostTe ? `<p>— ${esc(event.hostTe)}</p>` : ""}
        ${actionBar}
      </div>
      ${flyer}
    </article>
  `;
}

function renderNextEvent(data, el) {
  const next = (data.events || []).find(isUpcoming);
  if (!next) {
    el.innerHTML = `<article class="event-card"><h2>No public group session is listed yet</h2><p>Join the WhatsApp group to hear about the next one, or request a 1:1.</p></article>`;
    return;
  }
  el.innerHTML = eventCard(next, { featured: true });
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
    const res = await fetch("/api/photos");
    if (!res.ok) return;
    const { photos } = await res.json();
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
      past.length ? past.map((e) => eventCard(e)).join("") : "<p class=\"muted\" id=\"earlier-empty\">No earlier flyers yet. Photos uploaded from admin for earlier events land here.</p>"
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
    ...upcoming.map((e) => `<option value="${e.id}">Join group: ${e.title} — ${e.timezoneLabel}</option>`),
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

function renderSessions(data, el) {
  const sessions = (data.sessions || []).filter((s) => !s.featured);
  if (!sessions.length) return;
  el.innerHTML = sessions.map(renderSessionCard).join("");
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
  enroll: "Received. Sreenivasa will write back about a seat.",
  donate: "Received. He will send how to give — this page does not take a card.",
  volunteer: "Received. He will write back about where help is needed.",
  talk: "Received. He will write back about the sitting.",
  poetry: "Received. He will send what is already public, or a time to hear it.",
  contact: "Received. Sreenivasa will reply from the admin page.",
};

function composeIntentMessage(data) {
  if (data.message && data.message.trim()) return data.message.trim();
  return [
    data.program && `Program: ${data.program}`,
    data.student && `Student: ${data.student}`,
    data.org && `Host: ${data.org}`,
    data.place && `Place: ${data.place}`,
    data.when && `When: ${data.when}`,
    data.topic && `Topic: ${data.topic}`,
    data.amount && `Gift in mind: ${data.amount}`,
    data.notes && data.notes.trim(),
  ].filter(Boolean).join("\n") || "A note from the website.";
}

function wireIntentForms() {
  document.querySelectorAll("form.intent").forEach((form) => {
    form.addEventListener("submit", async (ev) => {
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
        note.textContent = res.ok
          ? (INTENT_OK[kind] || INTENT_OK.contact)
          : (out.error || "Could not send. Try WhatsApp.");
      }
      if (res.ok) form.reset();
    });
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
});
