// "Download everything": packs what Sanghamitra holds into one zip, in the browser.
//
// The server only lists what exists (/api/export). The files are fetched here and stored without
// compression — photographs and PDFs are already compressed — so no library is needed and nothing
// runs into a server time limit. The zip format written is the plain 1989 one every computer can
// open: local headers, file bytes, a central directory, and an end record.
(function (root) {
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i += 1) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  function dosStamp(d) {
    return {
      time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
      date: ((Math.max(d.getFullYear(), 1980) - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
    };
  }

  // files: [{ name, data: Uint8Array }] → array of byte chunks forming one zip.
  function zipParts(files, when = new Date()) {
    const enc = new TextEncoder();
    const { time, date } = dosStamp(when);
    const parts = [];
    const central = [];
    let offset = 0;
    for (const f of files) {
      const name = enc.encode(f.name);
      const size = f.data.length;
      const crc = crc32(f.data);
      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, 20, true);
      local.setUint16(6, 0x0800, true); // names are UTF-8, so Telugu titles survive
      local.setUint16(8, 0, true); // stored
      local.setUint16(10, time, true);
      local.setUint16(12, date, true);
      local.setUint32(14, crc, true);
      local.setUint32(18, size, true);
      local.setUint32(22, size, true);
      local.setUint16(26, name.length, true);
      local.setUint16(28, 0, true);
      parts.push(new Uint8Array(local.buffer), name, f.data);

      const dir = new DataView(new ArrayBuffer(46));
      dir.setUint32(0, 0x02014b50, true);
      dir.setUint16(4, 20, true);
      dir.setUint16(6, 20, true);
      dir.setUint16(8, 0x0800, true);
      dir.setUint16(10, 0, true);
      dir.setUint16(12, time, true);
      dir.setUint16(14, date, true);
      dir.setUint32(16, crc, true);
      dir.setUint32(20, size, true);
      dir.setUint32(24, size, true);
      dir.setUint16(28, name.length, true);
      dir.setUint32(42, offset, true);
      central.push(new Uint8Array(dir.buffer), name);
      offset += 30 + name.length + size;
    }
    const dirSize = central.reduce((sum, b) => sum + b.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, files.length, true);
    end.setUint16(10, files.length, true);
    end.setUint32(12, dirSize, true);
    end.setUint32(16, offset, true);
    return [...parts, ...central, new Uint8Array(end.buffer)];
  }

  function slug(s, max = 60) {
    return String(s || "")
      .normalize("NFC")
      .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, max)
      .replace(/-+$/, "");
  }

  const EXT = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "application/pdf": "pdf",
  };
  const ext = (type) => EXT[String(type || "").split(";")[0].trim()] || "bin";

  const SHELF_DIR = { satakam: "poetry", magazine: "magazine-issues", "friend-messages": "friend-messages" };

  function readme(data, counts, missing) {
    const lines = [
      "SANGHAMITRA — A FULL COPY OF THE WEBSITE'S CONTENTS",
      "",
      `Taken ${new Date().toLocaleString("en", { dateStyle: "long", timeStyle: "short" })}.`,
      "",
      "Keep this file on your computer and on a second disk. If the website ever went away,",
      "everything in it could be put back from this one file.",
      "",
      "WHAT IS INSIDE",
      "",
      `  your-uploads/            ${counts.uploads} files you uploaded on your Sanghamitra page: photographs,`,
      "                           poetry, magazine issues and Friend Messages, with their cover pictures.",
      `  site-archive/            ${counts.archive} files from the old sanghamitra.org archive: photographs,`,
      "                           magazine articles, and the lists the website reads them from.",
      "  settings-and-messages/   Your details and homepage lines, your sittings and events,",
      "                           every message from visitors and your replies, your notes to Pradeep,",
      "                           your Telugu corrections, and the question of the week.",
      "                           These are .json files: plain text that any computer can open.",
      "",
      `  ${counts.files} files in all.`,
    ];
    if (missing.length) {
      lines.push("", "COULD NOT BE COPIED THIS TIME (try again later)", "");
      for (const m of missing) lines.push(`  ${m}`);
    }
    return lines.join("\r\n") + "\r\n";
  }

  async function collect(onProgress = () => {}) {
    const res = await fetch("/api/export", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not gather the list of files");

    const enc = new TextEncoder();
    const files = [];
    const used = new Set();
    const add = (name, bytes) => {
      let n = name;
      let i = 2;
      while (used.has(n)) n = name.replace(/(\.[^./]+)?$/, `-${i++}$1`);
      used.add(n);
      files.push({ name: n, data: bytes });
      return n;
    };

    const jobs = [];
    for (const p of data.photos || []) {
      const year = String(p.year || (p.createdAt || "").slice(0, 4) || "undated");
      const base = `${slug(p.caption) || "photo"}-${String(p.id).slice(0, 8)}`;
      jobs.push({ kind: "uploads", name: `your-uploads/photos/${p.activity || "unsorted"}/${year}/${base}.${ext(p.type)}`, url: `/media/${p.id}`, record: p });
    }
    for (const it of data.library || []) {
      const dir = SHELF_DIR[it.shelf] || "other";
      const base = [slug(it.when), slug(it.title) || "item", String(it.id).slice(0, 8)].filter(Boolean).join("-");
      jobs.push({ kind: "uploads", name: `your-uploads/${dir}/${base}.${ext(it.type)}`, url: `/media/${it.id}`, record: it });
      if (it.hasPreview && it.type === "application/pdf") {
        jobs.push({ kind: "uploads", name: `your-uploads/${dir}/${base}-cover.jpg`, url: `/media/preview/${it.id}` });
      }
    }

    const dataFiles = ["site.json", "magazine.json", "photos-archive.json", "quiz.json", "i18n.te.json"];
    for (const f of dataFiles) jobs.push({ kind: "archive", name: `site-archive/data/${f}`, url: `/data/${f}`, text: true });
    try {
      const archive = await (await fetch("/data/photos-archive.json", { cache: "no-store" })).json();
      for (const p of archive.photos || []) {
        if (p.file) jobs.push({ kind: "archive", name: `site-archive/${p.file}`, url: `/${p.file}` });
      }
    } catch { /* the lists are optional; the uploads are what matter */ }
    try {
      const mag = await (await fetch("/data/magazine.json", { cache: "no-store" })).json();
      for (const issue of mag.issues || []) {
        for (const item of issue.items || []) {
          if (item.file && item.available) {
            jobs.push({ kind: "archive", name: `site-archive/magazine/${item.file}`, url: `/magazine/${item.file}` });
          }
        }
      }
    } catch { /* same */ }

    const missing = [];
    const counts = { uploads: 0, archive: 0, files: 0 };
    let done = 0;
    const total = jobs.length;
    onProgress({ done, total });
    let next = 0;
    async function worker() {
      while (next < jobs.length) {
        const job = jobs[next++];
        try {
          const r = await fetch(job.url, { cache: "no-store" });
          const type = r.headers.get("content-type") || "";
          // An unknown path on this site can answer with an HTML page; that is not the file.
          if (!r.ok || (!job.text && type.includes("text/html"))) throw new Error(String(r.status));
          const bytes = new Uint8Array(await r.arrayBuffer());
          const name = add(job.name, bytes);
          if (job.record) job.record.fileInZip = name;
          counts[job.kind] += 1;
        } catch {
          missing.push(job.name);
        }
        done += 1;
        onProgress({ done, total });
      }
    }
    await Promise.all([worker(), worker(), worker(), worker()]);

    const json = (x) => enc.encode(JSON.stringify(x, null, 2));
    add("settings-and-messages/photos.json", json(data.photos || []));
    add("settings-and-messages/library.json", json(data.library || []));
    add("settings-and-messages/site-settings-and-sittings.json", json(data.site || {}));
    add("settings-and-messages/visitor-messages.json", json(data.messages || []));
    add("settings-and-messages/notes-to-pradeep.json", json(data.notes || {}));
    add("settings-and-messages/website-choices.json", json(data.decisions || []));
    add("settings-and-messages/telugu-corrections.json", json(data.telugu || []));
    add("settings-and-messages/question-of-the-week.json", json(data.question));
    counts.files = files.length + 1;
    add("README.txt", enc.encode(readme(data, counts, missing)));

    const stamp = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const name = `sanghamitra-backup-${stamp.getFullYear()}-${pad(stamp.getMonth() + 1)}-${pad(stamp.getDate())}.zip`;
    const parts = zipParts(files, stamp);
    return { name, parts, counts, missing, files };
  }

  root.SMBackup = { crc32, zipParts, slug, collect };
})(typeof window !== "undefined" ? window : globalThis);
