function esc(s) {
  return String(s || "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function figureHtml(p) {
  const caption = esc(p.caption || "");
  const alt = esc(p.alt || p.caption || "Sanghamitra photo");
  const src = esc(p.src);
  return `
    <figure>
      <a class="gallery-open" href="${src}">
        <img src="${src}" alt="${alt}" loading="lazy">
      </a>
      <figcaption>${caption}</figcaption>
    </figure>`;
}

function wireLightbox(root) {
  root.querySelectorAll(".gallery-open").forEach((link) => {
    link.addEventListener("click", (ev) => {
      ev.preventDefault();
      const img = link.querySelector("img");
      const box = document.createElement("div");
      box.className = "lightbox";
      box.innerHTML = `<img src="${esc(link.getAttribute("href"))}" alt="${esc(img && img.alt)}"><p>${esc(img && img.closest("figure") && img.closest("figure").querySelector("figcaption") ? img.closest("figure").querySelector("figcaption").textContent : "")}</p><button type="button" class="lightbox-close">Close</button>`;
      const close = () => box.remove();
      box.addEventListener("click", (e) => {
        if (e.target === box || e.target.classList.contains("lightbox-close")) close();
      });
      document.addEventListener("keydown", function onKey(e) {
        if (e.key === "Escape") {
          document.removeEventListener("keydown", onKey);
          close();
        }
      });
      document.body.append(box);
    });
  });
}

async function loadUploaded() {
  try {
    const res = await fetch("/api/photos");
    if (!res.ok) return [];
    const { photos } = await res.json();
    return (photos || [])
      .filter((p) => !p.place || p.place === "gallery" || p.place === "both")
      .map((p) => ({
        src: `/media/${p.id}`,
        caption: p.caption || "",
        alt: p.caption || "Sanghamitra photo",
      }));
  } catch {
    return [];
  }
}

async function mountGallery(target) {
  const el = document.querySelector(target);
  if (!el) return;
  const photos = await loadUploaded();
  if (!photos.length) return;
  el.innerHTML = photos.map(figureHtml).join("");
  el.classList.add("photos");
  el.hidden = false;
}

async function mountGalleryPage() {
  const wall = document.getElementById("gallery-wall");
  const note = document.getElementById("gallery-empty");
  if (!wall) return;
  const uploaded = await loadUploaded();
  if (uploaded.length) {
    wall.insertAdjacentHTML("afterbegin", uploaded.map(figureHtml).join(""));
  }
  if (!wall.querySelector("figure")) {
    if (note) note.hidden = false;
    return;
  }
  if (note) note.hidden = true;
  wireLightbox(wall);
}

document.addEventListener("DOMContentLoaded", () => {
  mountGallery("#uploaded-photos");
  mountGalleryPage();
});
