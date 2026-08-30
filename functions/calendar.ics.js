import { readOverlay, mergeSite } from "../lib/site-content.js";

function pad(n) {
  return String(n).padStart(2, "0");
}

function icsUtc(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function icsEnd(iso, minutes) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  d.setUTCMinutes(d.getUTCMinutes() + (Number(minutes) > 0 ? Number(minutes) : 90));
  return icsUtc(d.toISOString());
}

function icsText(s) {
  return String(s || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function isUpcoming(event) {
  const start = new Date(event.startsAt).getTime();
  if (Number.isNaN(start)) return false;
  return start + (event.durationMinutes || 90) * 60000 > Date.now();
}

export async function onRequestGet(context) {
  const origin = new URL(context.request.url).origin;
  let base = { events: [] };
  try {
    const res = await fetch(`${origin}/data/site.json`, { cf: { cacheTtl: 60 } });
    if (res.ok) base = await res.json();
  } catch {
    base = { events: [] };
  }
  const { overlay } = await readOverlay(context.env);
  const merged = mergeSite(base, overlay);
  const events = (merged.events || []).filter(isUpcoming);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sanghamitra//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Sanghamitra sittings",
  ];
  for (const event of events) {
    const start = icsUtc(event.startsAt);
    const end = icsEnd(event.startsAt, event.durationMinutes);
    if (!start) continue;
    const page = `${origin}/events.html#${event.id}`;
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${icsText(event.id)}@sanghamitra.org`);
    lines.push(`DTSTAMP:${icsUtc(new Date().toISOString())}`);
    lines.push(`DTSTART:${start}`);
    if (end) lines.push(`DTEND:${end}`);
    lines.push(`SUMMARY:${icsText(event.title || "Sanghamitra sitting")}`);
    lines.push(`DESCRIPTION:${icsText([event.blurb, event.joinUrl, page].filter(Boolean).join("\\n"))}`);
    if (event.joinUrl) lines.push(`URL:${event.joinUrl}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'attachment; filename="sanghamitra.ics"',
      "cache-control": "public, max-age=300",
    },
  });
}
