// The eight activities Sreenivasa named. Slugs match the section ids on about.html
// and the data-activity attributes on index.html, so a photo tagged here lands on
// the right card without any further mapping.
export const ACTIVITIES = [
  { slug: "sharing", label: "Sharing and caring" },
  { slug: "math-club", label: "Ramanujan MathemaTRICKS Club" },
  { slug: "telugu", label: "Telugu" },
  { slug: "poetry", label: "Writing poetry" },
  { slug: "knowledge", label: "Knowledge sharing" },
  { slug: "meditation", label: "Meditation, anger, stress" },
  { slug: "arts", label: "Ancient art forms" },
  { slug: "magazine", label: "Sanghamitra magazine" },
];

export const ACTIVITY_SLUGS = ACTIVITIES.map((a) => a.slug);

export function normalizeActivity(value) {
  const slug = String(value || "").trim();
  return ACTIVITY_SLUGS.includes(slug) ? slug : "";
}
