export async function onRequestGet(context) {
  const id = context.params.id;
  const rec = await context.env.ADMIN.getWithMetadata(`preview:${id}`, { type: "arrayBuffer" });
  if (!rec || !rec.value) return new Response("Not found", { status: 404 });
  const type = (rec.metadata && rec.metadata.type) || "image/jpeg";
  return new Response(rec.value, {
    headers: {
      "content-type": type,
      "cache-control": "public, max-age=604800",
    },
  });
}
