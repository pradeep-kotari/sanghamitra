/** Questions we email Sreenivasa. The site does not store these. */
export const OWNER_EMAIL = "ainapura@yahoo.com";
export const BUILDER_EMAIL = "pradeep.kotari@gmail.com";
export const LOGIN_URL = "https://sanghamitra.pages.dev/admin/login";

export const PRIORITY_ASK = [
  "Please rank what we should do now. Reply like: 1-A, 2-C, 3-E",
  "Skip anything you do not want this round.",
  "",
  "A. Point sanghamitra.org at the live site (you change DNS; we will send the target)",
  "B. Public email + confirm WhatsApp / group on every page",
  "C. Donate: real how-to-give, or take the Donate button down",
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
    "Namaste Sreenivasa,",
    "",
    "Pradeep is building the Sanghamitra website. Please answer the questions below. The website only saves your answer — not these questions.",
    "",
    "How to sign in and answer:",
    `1. Open ${LOGIN_URL}`,
    "2. Enter ainapura@yahoo.com",
    "3. Click “Send the code”",
    "4. Open the next email in this inbox — it has a 6-digit code (valid 10 minutes)",
    "5. Enter the code and sign in",
    "6. Type your answer in the box (example: 1-A, 2-C, 3-E) and click Save answer",
    "",
    "Then we build from what you saved. When you want a change, sign in again, write the change, and save. We will build that next.",
    "",
    "———",
    "",
    body,
    "",
    "———",
    "",
    "If you did not expect this note, write Pradeep at pradeep.kotari@gmail.com.",
    "",
    "— Pradeep",
  ].join("\n");
}

export function ownerAskHtml(questions) {
  const body = String(questions || PRIORITY_ASK).trim();
  const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `
    <p>Namaste Sreenivasa,</p>
    <p>Pradeep is building the Sanghamitra website. Please answer the questions below. The website only saves your answer — not these questions.</p>
    <p><strong>How to sign in and answer</strong></p>
    <ol>
      <li>Open <a href="${LOGIN_URL}">${LOGIN_URL}</a></li>
      <li>Enter <strong>ainapura@yahoo.com</strong></li>
      <li>Click “Send the code”</li>
      <li>Open the next email in this inbox — it has a 6-digit code (valid 10 minutes)</li>
      <li>Enter the code and sign in</li>
      <li>Type your answer in the box (example: <code>1-A, 2-C, 3-E</code>) and click <strong>Save answer</strong></li>
    </ol>
    <p>Then we build from what you saved. When you want a change, sign in again, write the change, and save. We will build that next.</p>
    <hr>
    <pre style="white-space:pre-wrap;font-family:Georgia,serif;font-size:1rem">${esc(body)}</pre>
    <hr>
    <p>If you did not expect this note, write Pradeep at pradeep.kotari@gmail.com.</p>
    <p>— Pradeep</p>
  `;
}
