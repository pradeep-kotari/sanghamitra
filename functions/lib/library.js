const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_ALIASES = new Map([
  ...MONTHS.map((name, i) => [name.toLowerCase(), i + 1]),
  ...MONTHS.map((name, i) => [name.slice(0, 3).toLowerCase(), i + 1]),
]);

export function formatIssueWhen(year, month) {
  const y = Number(year);
  const m = Number(month);
  if (!Number.isFinite(y) || y < 1900 || y > 2100) return "";
  if (Number.isFinite(m) && m >= 1 && m <= 12) return `${MONTHS[m - 1]} ${y}`;
  return String(y);
}

export function parseIssueWhen(when) {
  const raw = String(when || "").trim();
  if (!raw) return { year: null, month: null };

  const iso = raw.match(/^(\d{4})-(\d{1,2})$/);
  if (iso) return { year: Number(iso[1]), month: Number(iso[2]) };

  const named = raw.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (named) {
    const month = MONTH_ALIASES.get(named[1].toLowerCase()) || null;
    return { year: Number(named[2]), month };
  }

  const yearOnly = raw.match(/^(\d{4})$/);
  if (yearOnly) return { year: Number(yearOnly[1]), month: null };

  return { year: null, month: null };
}

export function normalizeMagazineIssue(item) {
  let year = Number(item.year);
  let month = Number(item.month);
  if (!Number.isFinite(year) || year < 1900 || year > 2100) year = null;
  if (!Number.isFinite(month) || month < 1 || month > 12) month = null;

  if (!year || !month) {
    const parsed = parseIssueWhen(item.when);
    if (!year && parsed.year) year = parsed.year;
    if (!month && parsed.month) month = parsed.month;
  }

  const when = formatIssueWhen(year, month) || String(item.when || "").trim();
  return { ...item, year: year || null, month: month || null, when };
}

export function magazineSortKey(item) {
  const issue = normalizeMagazineIssue(item);
  const upload = issue.createdAt ? Date.parse(issue.createdAt) : 0;
  return {
    year: issue.year || 0,
    month: issue.month || 0,
    upload: Number.isFinite(upload) ? upload : 0,
  };
}

export function sortMagazineItems(items) {
  return [...items]
    .map(normalizeMagazineIssue)
    .sort((a, b) => {
      const ka = magazineSortKey(a);
      const kb = magazineSortKey(b);
      if (kb.year !== ka.year) return kb.year - ka.year;
      if (kb.month !== ka.month) return kb.month - ka.month;
      return kb.upload - ka.upload;
    });
}

export function groupMagazineArchive(items) {
  const sorted = sortMagazineItems(items);
  if (!sorted.length) return { latest: null, years: [] };

  const [latest, ...rest] = sorted;
  const byYear = new Map();
  for (const item of rest) {
    const label = item.year ? String(item.year) : "Undated";
    if (!byYear.has(label)) byYear.set(label, []);
    byYear.get(label).push(item);
  }

  const years = [...byYear.entries()]
    .sort(([a], [b]) => {
      const na = Number(a);
      const nb = Number(b);
      if (Number.isFinite(na) && Number.isFinite(nb)) return nb - na;
      if (Number.isFinite(na)) return -1;
      if (Number.isFinite(nb)) return 1;
      return a.localeCompare(b);
    })
    .map(([year, issues]) => ({
      year,
      issues: sortMagazineItems(issues),
    }));

  return { latest, years };
}

export function readMagazineFields(form) {
  const yearRaw = String(form.get("year") || "").trim();
  const monthRaw = String(form.get("month") || "").trim();
  const year = yearRaw ? Number(yearRaw) : null;
  const month = monthRaw ? Number(monthRaw) : null;

  if (!Number.isFinite(year) || year < 1900 || year > 2100) {
    return { error: "Choose the issue year" };
  }
  if (!Number.isFinite(month) || month < 1 || month > 12) {
    return { error: "Choose the issue month" };
  }

  return {
    year,
    month,
    when: formatIssueWhen(year, month),
  };
}
