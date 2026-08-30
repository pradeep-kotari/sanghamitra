import { BUILDER_EMAIL, OWNER_EMAIL, ownerAskHtml, ownerAskText } from "./owner-ask.js";

// The single address Sanghamitra mail goes out as. Change it here and nowhere else.
// When sanghamitra.org moves off Network Solutions and is verified with the mail
// provider, this becomes sanghamitra@sanghamitra.org and nothing else changes.
export const SENDER_ADDRESS = "sanghamitra@learnerscohort.com";
const SENDER_RESEND = `Sanghamitra <${SENDER_ADDRESS}>`;
const SENDER_BREVO = { name: "Sanghamitra", email: SENDER_ADDRESS };

async function postJson(url, headers, body) {
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    console.log("email_fail", res.status, url, text.slice(0, 300));
  }
  return res.ok;
}

export async function sendMail(env, { to, cc, subject, text, html }) {
  const recipients = Array.isArray(to) ? to : [to];
  const copies = cc ? (Array.isArray(cc) ? cc : [cc]) : [];

  if (env.RESEND_API_KEY) {
    // One sender, and it is a Sanghamitra one. The old fallback chain reached for
    // support@agreements.co.in (a different business) and a dead placeholder, so a
    // person who wrote to Sanghamitra could get an answer branded as someone else.
    {
      const from = SENDER_RESEND;
      const payload = { from, to: recipients, subject, text, html };
      if (copies.length) payload.cc = copies;
      const ok = await postJson(
        "https://api.resend.com/emails",
        {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "content-type": "application/json",
        },
        payload,
      );
      if (ok) return { ok: true, via: "resend" };
    }
  }

  if (env.BREVO_API_KEY) {
    {
      const sender = SENDER_BREVO;
      const payload = {
        sender,
        to: recipients.map((email) => ({ email })),
        subject,
        textContent: text,
        htmlContent: html || `<pre>${text}</pre>`,
      };
      if (copies.length) payload.cc = copies.map((email) => ({ email }));
      const ok = await postJson(
        "https://api.brevo.com/v3/smtp/email",
        {
          "api-key": env.BREVO_API_KEY,
          "content-type": "application/json",
          accept: "application/json",
        },
        payload,
      );
      if (ok) return { ok: true, via: "brevo" };
    }
  }

  return { ok: false };
}

export async function sendAdminCode(env, to, code) {
  const text = [
    "Namaste,",
    "",
    `Your Sanghamitra admin sign-in code is: ${code}`,
    "",
    "It expires in 10 minutes. Sign in, type your answer, and save. The site only stores that answer.",
    "",
    "Sign in: https://sanghamitra.pages.dev/admin/login",
    "",
    "If you did not ask for this code, ignore the email.",
    "",
    "— Sanghamitra",
  ].join("\n");
  const html = `<p>Namaste,</p><p>Your Sanghamitra admin sign-in code is <strong style="font-size:1.4em;letter-spacing:0.08em">${code}</strong></p><p>It expires in 10 minutes. Sign in, type your answer, and save. The site only stores that answer.</p><p><a href="https://sanghamitra.pages.dev/admin/login">Sign in to admin</a></p><p>If you did not ask for this code, ignore the email.</p>`;
  return sendMail(env, {
    to,
    subject: "Your Sanghamitra admin code",
    text,
    html,
  });
}

export const ADMIN_INBOX = ["ainapura@yahoo.com", "pradeep.kotari@gmail.com"];

export async function emailOwnerAsk(env, questions) {
  return sendMail(env, {
    to: OWNER_EMAIL,
    cc: BUILDER_EMAIL,
    subject: "Sanghamitra website — please rank what we build next",
    text: ownerAskText(questions),
    html: ownerAskHtml(questions),
  });
}

export async function notifyAdminsOfQuery(env, item) {
  const label = item.kind || "contact";
  const text = [
    `${item.name} sent a ${label} note on sanghamitra.pages.dev`,
    item.email ? `Email: ${item.email}` : "No email given",
    item.phone ? `Phone: ${item.phone}` : "",
    "",
    item.message,
    "",
    "Reply from: https://sanghamitra.pages.dev/admin/",
  ].filter(Boolean).join("\n");
  return sendMail(env, {
    to: ADMIN_INBOX,
    subject: `${label}: ${item.name} on Sanghamitra`,
    text,
    html: `<p><strong>${item.name}</strong> · ${label}${item.email ? ` · ${item.email}` : ""}${item.phone ? ` · ${item.phone}` : ""}</p><p>${String(item.message).replace(/</g, "&lt;")}</p><p><a href="https://sanghamitra.pages.dev/admin/">Reply in admin</a></p>`,
  });
}
