/** Questions we email Sreenivasa. The site does not store these. */
export const OWNER_EMAIL = "ainapura@yahoo.com";
export const BUILDER_EMAIL = "pradeep.kotari@gmail.com";
export const LOGIN_URL = "https://sanghamitra.pages.dev/admin/login";

export const PRIORITY_ASK = [
  "If you have a minute, rank what we should do now. Something like: 1-A, 2-C, 3-E is enough.",
  "Skip anything you do not want this round.",
  "",
  "A. Point sanghamitra.org at the live site (you change DNS; we will send the target)",
  "B. Public email + confirm WhatsApp / group on every page",
  "C. Donate: paste Zelle / Venmo / PayPal.me if you use them (blank = the site will not invent a method)",
  "D. 2026 student photos: keep, replace, or take down",
  "E. Who we enroll this month: Vedic math / SAT-ACT / Telugu",
  "F. Satakam title + 2–4 verses, or “later”",
  "G. Burrakatha: a YouTube link, or “coming”",
  "H. Next public sitting after 5 September, or “none listed”",
  "I. Homepage name spelling + years line (2003 / 2004 / 25 years)",
  "J. Old magazine PDFs only if you still have them",
  "",
  "Not this round unless you put it first: dance directory, full Telugu pages, magazine restart, SiliconAndhra logo.",
].join("\n");

export function ownerAskText(questions) {
  const body = String(questions || PRIORITY_ASK).trim();
  return [
    "Hi Sreenivas,",
    "",
    "I am putting the Sanghamitra website together and I need a few choices from you when you have a minute. Sign in, type your answers, and save. I will work from what you saved.",
    "",
    "How to sign in:",
    `Open ${LOGIN_URL}`,
    "Use ainapura@yahoo.com",
    "Click Send the code, then check Yahoo Mail for the six-digit code — use the latest one (they last ten minutes).",
    "Sign in, write your answers (for example: 1-A, 2-C, 3-E), and click Save.",
    "",
    "Later, if something on the site should change, sign in again and leave a note. I will pick it up.",
    "",
    "———",
    "",
    body,
    "",
    "———",
    "",
    "If this landed in the wrong place, write me at pradeep.kotari@gmail.com.",
    "",
    "Pradeep",
  ].join("\n");
}

export function ownerAskHtml(questions) {
  const body = String(questions || PRIORITY_ASK).trim();
  const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `
    <p>Hi Sreenivas,</p>
    <p>I am putting the Sanghamitra website together and I need a few choices from you when you have a minute. Sign in, type your answers, and save. I will work from what you saved.</p>
    <p>How to sign in:</p>
    <ol>
      <li>Open <a href="${LOGIN_URL}">${LOGIN_URL}</a></li>
      <li>Use <strong>ainapura@yahoo.com</strong></li>
      <li>Click Send the code, then check Yahoo Mail for the six-digit code — use the latest one (they last ten minutes).</li>
      <li>Sign in, write your answers (for example: <code>1-A, 2-C, 3-E</code>), and click Save.</li>
    </ol>
    <p>Later, if something on the site should change, sign in again and leave a note. I will pick it up.</p>
    <hr>
    <pre style="white-space:pre-wrap;font-family:Georgia,serif;font-size:1rem">${esc(body)}</pre>
    <hr>
    <p>If this landed in the wrong place, write me at pradeep.kotari@gmail.com.</p>
    <p>Pradeep</p>
  `;
}
