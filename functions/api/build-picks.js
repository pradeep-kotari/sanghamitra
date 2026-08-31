import { json, requireAdmin } from "../lib/auth.js";
import { buildCatalogForUi } from "../lib/build-catalog.js";
import { readBuildPicks, writeBuildPicks } from "../lib/build-picks.js";
import { isOwnerEmail, notifyBuilderBuildPicks } from "../lib/email.js";

export async function onRequestGet(context) {
  const gate = await requireAdmin(context);
  if (gate.response) return gate.response;
  try {
    const saved = await readBuildPicks(context.env);
    return json({ groups: buildCatalogForUi(), ...saved });
  } catch (err) {
    return json({ error: err.message || "Could not load build list" }, err.status || 500);
  }
}

export async function onRequestPost(context) {
  const gate = await requireAdmin(context);
  if (gate.response) return gate.response;
  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Send JSON" }, 400);
  }
  try {
    const saved = await writeBuildPicks(context.env, {
      picks: body.picks,
      note: body.note,
    }, gate.user);
    if (isOwnerEmail(gate.user.email)) {
      context.waitUntil(
        notifyBuilderBuildPicks(context.env, {
          authorName: gate.user.name,
          picks: saved.picks,
          note: saved.note,
        }).catch(() => null),
      );
    }
    return json({ ok: true, groups: buildCatalogForUi(), ...saved });
  } catch (err) {
    return json({ error: err.message || "Could not save choices" }, err.status || 500);
  }
}
