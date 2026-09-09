import { json, requireAdmin } from "../lib/auth.js";

// The question of the week. Two sources, in this order:
//   1. Whatever Sreenivasa posts from /admin (KV key "quiz:current") — his own, always wins.
//   2. Otherwise one of his old Question Gallery questions, chosen by the week number so it is
//      stable for seven days and moves on its own. The archive keeps the site alive between his posts.
// Answers are never published here; that was his rule, and people write to him.

function weekIndex(d = new Date()) {
  const start = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - start) / 604800000)
    + d.getUTCFullYear() * 53;
}

export async function onRequestGet(context) {
  const raw = await context.env.ADMIN.get("quiz:current");
  const own = raw ? JSON.parse(raw) : null;
  if (own && own.q) {
    return json({ source: "owner", q: own.q, postedAt: own.postedAt || null, note: own.note || null },
      200, { "cache-control": "no-store" });
  }
  return json({ source: "archive" }, 200, { "cache-control": "no-store" });
}

export async function onRequestPost(context) {
  const gate = await requireAdmin(context);
  if (gate.response) return gate.response;
  let body;
  try { body = await context.request.json(); } catch { return json({ error: "Send JSON" }, 400); }
  const q = String(body.q || "").trim().slice(0, 600);
  const note = String(body.note || "").trim().slice(0, 300);
  if (body.action === "clear") {
    await context.env.ADMIN.delete("quiz:current");
    return json({ ok: true, cleared: true });
  }
  if (!q) return json({ error: "Type this week's question" }, 400);
  const rec = { q, note: note || null, postedAt: new Date().toISOString(), postedBy: gate.user.email };
  await context.env.ADMIN.put("quiz:current", JSON.stringify(rec));
  return json({ ok: true, ...rec });
}
