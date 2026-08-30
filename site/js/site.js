const SITE = {
  youtube: "https://www.youtube.com/@sreenivasaainapurapu3741/featured",
  facebook: "https://www.facebook.com/sreenivasa.ainapurapu",
  whatsapp: "https://chat.whatsapp.com/EAEwM6yk9jG3zIiRd6qOKg",
};

async function loadSite() {
  const res = await fetch("data/site.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load site data");
  return res.json();
}

function formatEventWhen(event) {
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
  const cls = `event-card${featured ? " featured" : ""}${event.flyer ? " event-with-flyer" : ""}`;
  const flyer = event.flyer
    ? `<a class="flyer-link" href="${event.pdf || event.flyer}"><img class="flyer" src="${event.flyer}" alt="${event.title} invitation"></a>`
    : "";
  const presenter = event.presenterTe || event.presenter
    ? `<p class="presenter">${event.presenterTe || ""}${event.presenter ? ` · ${event.presenter}` : ""}</p>`
    : "";
  return `
    <article class="${cls}" id="${event.id}">
      <div>
        <p class="kicker">${event.kind === "group" ? "Group session" : "Session"}</p>
        <h2>${event.titleTe || event.title}</h2>
        <p class="when">${formatEventWhen(event)}</p>
        ${presenter}
        <p class="invite-te">${event.inviteTe || ""}</p>
        <p>${event.blurbTe || event.blurb || event.openTo || ""}</p>
        <p>${event.hostTe ? `— ${event.hostTe}` : ""}</p>
        <div class="actions">
          <a class="btn btn-primary" href="${event.joinUrl}">Click to join</a>
          ${event.ics ? `<a class="btn btn-ghost" href="${event.ics}">Add to calendar</a>` : ""}
          ${event.pdf ? `<a class="btn btn-ghost" href="${event.pdf}">Open the PDF</a>` : ""}
        </div>
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

function renderEventList(data, el) {
  const upcoming = (data.events || []).filter(isUpcoming);
  const past = (data.events || []).filter((e) => !isUpcoming(e));
  el.innerHTML = [
    upcoming.length ? upcoming.map((e) => eventCard(e, { featured: true })).join("") : "<p>No upcoming group sessions are listed. Request a 1:1 or watch the WhatsApp group.</p>",
    past.length ? `<h2>Earlier sessions</h2>${past.map((e) => eventCard(e)).join("")}` : "",
  ].join("");
}

function fillBookingChoices(data, select) {
  const upcoming = (data.events || []).filter(isUpcoming);
  select.innerHTML = [
    `<option value="">I want a new 1:1 time</option>`,
    ...upcoming.map((e) => `<option value="${e.id}">Join group: ${e.title} — ${e.timezoneLabel}</option>`),
  ].join("");
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
      <p><strong>Your request is ready.</strong> Send it in the WhatsApp group so Sreenivasa can confirm.</p>
      <pre style="white-space:pre-wrap">${message.replace(/</g, "&lt;")}</pre>
      <div class="actions">
        <a class="btn btn-primary" href="${SITE.whatsapp}" target="_blank" rel="noopener">Open WhatsApp group</a>
        <button type="button" class="btn btn-ghost" id="copy-request">Copy request</button>
      </div>
    `;
    notice.querySelector("#copy-request").addEventListener("click", async () => {
      await navigator.clipboard.writeText(message);
      notice.querySelector("#copy-request").textContent = "Copied";
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  let data;
  try {
    data = await loadSite();
  } catch {
    data = { events: [], booking: {} };
  }

  const next = document.getElementById("next-event");
  if (next) renderNextEvent(data, next);
  const list = document.getElementById("event-list");
  if (list) renderEventList(data, list);
  if (document.getElementById("booking-form")) wireBookingForm(data);
});
