import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error("Missing SMTP_HOST / SMTP_USER / SMTP_PASS environment variables");
  }
  const port = Number(SMTP_PORT) || 587;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: SMTP_SECURE ? SMTP_SECURE === "true" : port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatBytes(bytes) {
  if (!bytes || Number.isNaN(bytes)) return "";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function infoRow(label, value) {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:10px 0;border-top:1px solid #E4E4D8;font-family:'IBM Plex Mono',ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#5B6B60;width:150px;vertical-align:top;">${label}</td>
      <td style="padding:10px 0;border-top:1px solid #E4E4D8;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;color:#16281D;vertical-align:top;">${value}</td>
    </tr>`;
}

export function renderResumeEmail(submission) {
  const name = escapeHtml(submission.name);
  const email = escapeHtml(submission.email);
  const phone = escapeHtml(submission.phone || "—");
  const role = escapeHtml(submission.role);
  const experience = escapeHtml(submission.experience);
  const message = submission.message ? escapeHtml(submission.message) : "";
  const resume = submission.resume || {};
  const resumeUrl = resume.url;
  const resumeName = escapeHtml(resume.name || "resume file");
  const resumeMeta = [formatBytes(resume.size), resume.type ? escapeHtml(resume.type) : ""].filter(Boolean).join(" · ");
  const submittedAt = new Date(submission.createdAt || Date.now());
  const dateLabel = submittedAt.toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const rows = [
    infoRow("Full name", name),
    infoRow("Email", `<a href="mailto:${email}" style="color:#16281D;text-decoration:underline;">${email}</a>`),
    infoRow("Phone", phone),
    infoRow("Role applying for", role),
    infoRow("Experience level", experience),
  ].join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>New resume submission</title>
  </head>
  <body style="margin:0;padding:0;background-color:#F7F8F1;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      New application from ${name} for ${role} — resume attached.
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F8F1;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background-color:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid rgba(22,40,29,0.08);">
            <tr>
              <td style="background-color:#16281D;padding:28px 32px;border-bottom:3px solid #B8874C;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-family:'IBM Plex Mono',ui-monospace,Consolas,monospace;font-size:14px;letter-spacing:0.16em;text-transform:uppercase;color:#F7F8F1;font-weight:600;">
                      Merivane
                    </td>
                  </tr>
                  <tr>
                    <td style="font-family:'IBM Plex Mono',ui-monospace,Consolas,monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#DDB37F;padding-top:2px;">
                      Resources
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 8px;font-family:'IBM Plex Mono',ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#B8874C;font-weight:600;">
                  Candidate application
                </p>
                <h1 style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;color:#16281D;font-weight:700;">
                  New resume submission
                </h1>
                <p style="margin:0 0 24px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;color:#5B6B60;">
                  ${name} applied for <strong style="color:#16281D;">${role}</strong> on ${dateLabel}.
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F8F1;border:1px solid #E4E4D8;border-radius:12px;padding:8px 20px;margin-bottom:20px;">
                  ${rows}
                </table>

                ${
                  message
                    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                  <tr>
                    <td style="background-color:#F7F8F1;border-left:3px solid #B8874C;border-radius:0 12px 12px 0;padding:16px 20px;">
                      <p style="margin:0 0 6px;font-family:'IBM Plex Mono',ui-monospace,Consolas,monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#5B6B60;">Note to recruiter</p>
                      <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:15px;line-height:1.6;color:#16281D;">“${message}”</p>
                    </td>
                  </tr>
                </table>`
                    : ""
                }

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#16281D;border-radius:12px;">
                  <tr>
                    <td style="padding:20px 24px;">
                      <p style="margin:0 0 2px;font-family:'IBM Plex Mono',ui-monospace,Consolas,monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#DDB37F;">Resume / CV</p>
                      <p style="margin:0 0 14px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;color:#F7F8F1;word-break:break-all;">
                        ${resumeName}${resumeMeta ? ` <span style="color:#9FB3A5;">(${resumeMeta})</span>` : ""}
                      </p>
                      <a href="${resumeUrl}" style="display:inline-block;background-color:#B8874C;color:#16281D;text-decoration:none;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;padding:11px 22px;border-radius:999px;">
                        Download resume →
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:24px 0 0;padding-top:20px;border-top:1px solid #E4E4D8;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#5B6B60;">
                  Submitted via the Merivane Resources application form. Reply directly to this email to reach ${name} at
                  <a href="mailto:${email}" style="color:#5B6B60;">${email}</a>.
                </p>
              </td>
            </tr>
          </table>
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;">
            <tr>
              <td style="padding:20px 32px;text-align:center;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;color:#8A9690;">
                Merivane Resources — remote-first talent agency
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendResumeNotification(submission) {
  const to = process.env.RECRUITER_EMAIL;
  if (!to) {
    throw new Error("Missing RECRUITER_EMAIL environment variable");
  }
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const mailer = getTransporter();

  await mailer.sendMail({
    from: `"Merivane Resources" <${from}>`,
    to,
    replyTo: submission.email,
    subject: `New resume: ${submission.name} — ${submission.role}`,
    html: renderResumeEmail(submission),
    text: [
      `New resume submission`,
      `Name: ${submission.name}`,
      `Email: ${submission.email}`,
      `Phone: ${submission.phone || "—"}`,
      `Role: ${submission.role}`,
      `Experience: ${submission.experience}`,
      submission.message ? `Note: ${submission.message}` : "",
      `Resume: ${submission.resume?.url || ""}`,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}
