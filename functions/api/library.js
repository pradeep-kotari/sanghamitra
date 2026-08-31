import { json, requireAdmin } from "../lib/auth.js";
import { isOwnerEmail, notifyBuilderOwnerUpload } from "../lib/email.js";
import {
  formatIssueWhen,
  normalizeMagazineIssue,
  readMagazineFields,
  sortMagazineItems,
} from "../lib/library.js";

// Two shelves Sreenivasa fills himself from /admin: the Satakam he published, and
// any magazine issues he still has. Nothing here is ever invented — the public pages
// keep their honest "not here yet" line until a real file is uploaded.
export const SHELVES = ["satakam", "magazine"];

const ALLOWED = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_BYTES = 20 * 1024 * 1024;
const MAX_PREVIEW_BYTES = 2 * 1024 * 1024;

async function listItems(env) {
  const raw = await env.ADMIN.get("library");
  return raw ? JSON.parse(raw) : [];
}

export async function onRequestGet(context) {
  const items = await listItems(context.env);
  const magazine = sortMagazineItems(items.filter((i) => i.shelf === "magazine"));
  const other = items.filter((i) => i.shelf !== "magazine");
  return json({ items: [...magazine, ...other] });
}

export async function onRequestPost(context) {
  const gate = await requireAdmin(context);
  if (gate.response) return gate.response;

  const form = await context.request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") return json({ error: "Choose a file" }, 400);
  if (!ALLOWED.has(file.type)) return json({ error: "Use a PDF, JPEG, PNG, or WebP" }, 400);
  if (file.size > MAX_BYTES) return json({ error: "File is over 20 MB" }, 400);

  const shelfRaw = String(form.get("shelf") || "").trim();
  if (!SHELVES.includes(shelfRaw)) return json({ error: "Choose the Satakam or the magazine" }, 400);

  const title = String(form.get("title") || "").trim().slice(0, 160);
  if (!title) return json({ error: "Give it a title" }, 400);
  const note = String(form.get("note") || "").trim().slice(0, 400);

  let when = String(form.get("when") || "").trim().slice(0, 60);
  let year = null;
  let month = null;
  if (shelfRaw === "magazine") {
    const issue = readMagazineFields(form);
    if (issue.error) return json({ error: issue.error }, 400);
    year = issue.year;
    month = issue.month;
    when = issue.when;
  }

  const id = crypto.randomUUID();
  await context.env.ADMIN.put(`blob:${id}`, await file.arrayBuffer(), {
    metadata: { type: file.type },
  });

  let hasPreview = false;
  const preview = form.get("preview");
  if (preview && typeof preview !== "string") {
    if (!preview.type.startsWith("image/")) {
      return json({ error: "Preview must be an image" }, 400);
    }
    if (preview.size > MAX_PREVIEW_BYTES) {
      return json({ error: "Preview is over 2 MB" }, 400);
    }
    await context.env.ADMIN.put(`preview:${id}`, await preview.arrayBuffer(), {
      metadata: { type: preview.type },
    });
    hasPreview = true;
  } else if (file.type.startsWith("image/")) {
    hasPreview = true;
  }

  const items = await listItems(context.env);
  const item = normalizeMagazineIssue({
    id,
    shelf: shelfRaw,
    title,
    note,
    when,
    year,
    month,
    type: file.type,
    hasPreview,
    uploadedBy: gate.user.email,
    createdAt: new Date().toISOString(),
  });
  items.unshift(item);
  await context.env.ADMIN.put("library", JSON.stringify(items.slice(0, 200)));
  if (isOwnerEmail(gate.user.email)) {
    const kind = shelfRaw === "magazine" ? "a magazine issue" : "poetry";
    const detail = shelfRaw === "magazine" && when ? `Issue: ${when}` : "";
    context.waitUntil(
      notifyBuilderOwnerUpload(context.env, {
        authorName: gate.user.name,
        kind,
        title,
        detail,
      }).catch(() => null),
    );
  }
  return json({ ok: true, item });
}
