export async function onRequestGet(context) {
  const id = context.params.id;
  const rec = await context.env.ADMIN.getWithMetadata(`blob:${id}`, { type: "arrayBuffer" });
  if (!rec || !rec.value) return new Response("Not found", { status: 404 });
  const type = (rec.metadata && rec.metadata.type) || "image/jpeg";
  const headers = {
    "content-type": type,
    "cache-control": "public, max-age=86400",
  };
  if (type === "application/pdf") {
    headers["content-disposition"] = 'inline; filename="sanghamitra-magazine.pdf"';
  }
  return new Response(rec.value, { headers });
}
