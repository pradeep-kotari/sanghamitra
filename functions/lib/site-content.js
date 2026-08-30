import { ensureDb } from "./db.js";

const OVERLAY_KEY = "site_overlay";
const MAX_JSON = 80_000;

const EMPTY = {
  personName: "",
  yearsLine: "",
  whoLine: "",
  homepageLede: "",
  publicEmail: "",
  phone: "",
  whatsappGroup: "",
  facebook: "",
  youtube: "",
  donateMode: "ask",
  donateHow: "",
  enrollLive: { math: true, sat: true, telugu: true },
  eventPatches: {},
  extraEvents: [],
  hiddenEventIds: [],
};

export function defaultOverlay() {
  return structuredClone(EMPTY);
}

export function normalizeOverlay(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  const enroll = src.enrollLive && typeof src.enrollLive === "object" ? src.enrollLive : {};
  const patches = src.eventPatches && typeof src.eventPatches === "object" ? src.eventPatches : {};
  const extra = Array.isArray(src.extraEvents) ? src.extraEvents.filter((e) => e && e.id && e.title) : [];
  const hidden = Array.isArray(src.hiddenEventIds) ? src.hiddenEventIds.map(String) : [];
  const mode = ["ask", "how", "hide"].includes(src.donateMode) ? src.donateMode : "ask";
  return {
    personName: String(src.personName || "").slice(0, 120),
    yearsLine: String(src.yearsLine || "").slice(0, 240),
    whoLine: String(src.whoLine || "").slice(0, 400),
    homepageLede: String(src.homepageLede || "").slice(0, 800),
    publicEmail: String(src.publicEmail || "").slice(0, 120),
    phone: String(src.phone || "").slice(0, 40),
    whatsappGroup: String(src.whatsappGroup || "").slice(0, 240),
    facebook: String(src.facebook || "").slice(0, 240),
    youtube: String(src.youtube || "").slice(0, 240),
    donateMode: mode,
    donateHow: String(src.donateHow || "").slice(0, 800),
    enrollLive: {
      math: enroll.math !== false,
      sat: enroll.sat !== false,
      telugu: enroll.telugu !== false,
    },
    eventPatches: Object.fromEntries(
      Object.entries(patches).slice(0, 40).map(([id, patch]) => [String(id).slice(0, 80), sanitizeEvent(patch, id)]),
    ),
    extraEvents: extra.slice(0, 40).map((e) => sanitizeEvent(e, e.id)),
    hiddenEventIds: hidden.slice(0, 40),
  };
}

function sanitizeEvent(event, fallbackId) {
  const e = event && typeof event === "object" ? event : {};
  return {
    id: String(e.id || fallbackId || "").slice(0, 80),
    title: String(e.title || "").slice(0, 160),
    kind: e.kind === "learn" ? "learn" : "group",
    kicker: String(e.kicker || "").slice(0, 80),
    presenter: String(e.presenter || "").slice(0, 160),
    blurb: String(e.blurb || "").slice(0, 800),
    startsAt: String(e.startsAt || "").slice(0, 40),
    timezoneLabel: String(e.timezoneLabel || "").slice(0, 160),
    whenLabel: String(e.whenLabel || "").slice(0, 160),
    durationMinutes: Number(e.durationMinutes) > 0 ? Number(e.durationMinutes) : 90,
    joinUrl: String(e.joinUrl || "").slice(0, 300),
    ics: String(e.ics || "").slice(0, 200),
    pdf: String(e.pdf || "").slice(0, 200),
    flyer: String(e.flyer || "").slice(0, 200),
    moreHref: String(e.moreHref || "").slice(0, 200),
    moreLabel: String(e.moreLabel || "").slice(0, 80),
    inviteTe: String(e.inviteTe || "").slice(0, 200),
    titleTe: String(e.titleTe || "").slice(0, 160),
  };
}

export async function readOverlay(env) {
  const db = await ensureDb(env);
  const row = await db.prepare("SELECT value, by_name, updated_at FROM site_content WHERE key = ?").bind(OVERLAY_KEY).first();
  if (!row) return { overlay: defaultOverlay(), updatedAt: null, updatedBy: null };
  let parsed = {};
  try {
    parsed = JSON.parse(row.value);
  } catch {
    parsed = {};
  }
  return {
    overlay: normalizeOverlay(parsed),
    updatedAt: row.updated_at || null,
    updatedBy: row.by_name || null,
  };
}

export async function writeOverlay(env, raw, user) {
  const overlay = normalizeOverlay(raw);
  const value = JSON.stringify(overlay);
  if (value.length > MAX_JSON) {
    const err = new Error("That save is too large.");
    err.status = 400;
    throw err;
  }
  const db = await ensureDb(env);
  const now = new Date().toISOString();
  await db.prepare(
    `INSERT INTO site_content (key, value, by_email, by_name, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, by_email = excluded.by_email, by_name = excluded.by_name, updated_at = excluded.updated_at`,
  ).bind(OVERLAY_KEY, value, user.email, user.name, now).run();
  return { overlay, updatedAt: now, updatedBy: user.name };
}

export function phoneToTel(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

export function phoneToWa(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

export function mergeSite(base, overlay) {
  const o = normalizeOverlay(overlay);
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
  out.copy.donateMode = o.donateMode;
  if (o.donateHow) out.copy.donateHow = o.donateHow;
  out.copy.enrollLive = o.enrollLive;

  const hidden = new Set(o.hiddenEventIds);
  const baseEvents = Array.isArray(out.events) ? out.events : [];
  const merged = baseEvents
    .filter((e) => !hidden.has(e.id))
    .map((e) => {
      const patch = o.eventPatches[e.id];
      if (!patch) return e;
      const next = { ...e };
      for (const [k, v] of Object.entries(patch)) {
        if (v !== "" && v != null) next[k] = v;
      }
      return next;
    });
  for (const extra of o.extraEvents) {
    if (hidden.has(extra.id)) continue;
    if (!merged.some((e) => e.id === extra.id)) merged.push(extra);
  }
  out.events = merged;
  return out;
}
