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

function getFrom() {
  return process.env.MAIL_FROM || process.env.SMTP_USER;
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

function button(label, url) {
  return `<a href="${url}" style="display:inline-block;background-color:#B8874C;color:#16281D;text-decoration:none;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;padding:12px 26px;border-radius:999px;">${label} →</a>`;
}

/**
 * Shared header/footer chrome for every transactional email. `eyebrow` is the
 * small mono label above the heading; `bodyHtml` is the content between them.
 */
function emailShell({ title, preheader, eyebrow, heading, bodyHtml }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#F7F8F1;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
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
                  ${eyebrow}
                </p>
                <h1 style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;color:#16281D;font-weight:700;">
                  ${heading}
                </h1>
                ${bodyHtml}
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
  const dateLabel = submittedAt.toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });

  const rows = [
    infoRow("Full name", name),
    infoRow("Email", `<a href="mailto:${email}" style="color:#16281D;text-decoration:underline;">${email}</a>`),
    infoRow("Phone", phone),
    infoRow("Role applying for", role),
    infoRow("Experience level", experience),
  ].join("");

  const bodyHtml = `
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
    </p>`;

  return emailShell({
    title: "New resume submission",
    preheader: `New application from ${name} for ${role} — resume attached.`,
    eyebrow: "Candidate application",
    heading: "New resume submission",
    bodyHtml,
  });
}

export function renderPasswordResetEmail({ name, resetUrl, expiresInMinutes }) {
  const bodyHtml = `
    <p style="margin:0 0 24px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#5B6B60;">
      Hi ${escapeHtml(name)}, we received a request to reset the password on your Merivane employee account.
      Click below to choose a new one. This link expires in ${expiresInMinutes} minutes.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td>${button("Reset password", resetUrl)}</td></tr>
    </table>
    <p style="margin:0;padding-top:20px;border-top:1px solid #E4E4D8;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#5B6B60;">
      If you didn't request this, you can safely ignore this email — your password will stay the same.
    </p>`;

  return emailShell({
    title: "Reset your password",
    preheader: "Reset your Merivane employee account password.",
    eyebrow: "Account security",
    heading: "Reset your password",
    bodyHtml,
  });
}

export function renderApprovalEmail({ name, loginUrl }) {
  const bodyHtml = `
    <p style="margin:0 0 24px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#5B6B60;">
      Hi ${escapeHtml(name)}, your Merivane employee account has been approved. You can now sign in to the
      employee portal to view your dashboard, missions, and benefits.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr><td>${button("Sign in", loginUrl)}</td></tr>
    </table>`;

  return emailShell({
    title: "Account approved",
    preheader: "Your Merivane employee account has been approved.",
    eyebrow: "Account status",
    heading: "You're approved, welcome aboard.",
    bodyHtml,
  });
}

export function renderAdminNewSignupEmail({ name, email, adminUrl }) {
  const bodyHtml = `
    <p style="margin:0 0 24px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#5B6B60;">
      <strong style="color:#16281D;">${escapeHtml(name)}</strong> (${escapeHtml(email)}) just created an employee
      account and is waiting on approval before they can sign in.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr><td>${button("Review in admin", adminUrl)}</td></tr>
    </table>`;

  return emailShell({
    title: "New employee awaiting approval",
    preheader: `${name} is waiting on account approval.`,
    eyebrow: "Admin notification",
    heading: "New employee awaiting approval",
    bodyHtml,
  });
}

export function renderTimeOffRequestEmail({ employeeName, employeeEmail, type, from, to, days, reason, adminUrl }) {
  const bodyHtml = `
    <p style="margin:0 0 24px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#5B6B60;">
      <strong style="color:#16281D;">${escapeHtml(employeeName)}</strong> (${escapeHtml(employeeEmail)}) requested
      <strong style="color:#16281D;">${escapeHtml(type)}</strong> time off and is waiting on your decision.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F8F1;border:1px solid #E4E4D8;border-radius:12px;padding:8px 20px;margin-bottom:20px;">
      ${infoRow("Dates", `${escapeHtml(from)} → ${escapeHtml(to)}`)}
      ${infoRow("Length", `${days} day${days === 1 ? "" : "s"}`)}
      ${reason ? infoRow("Reason", escapeHtml(reason)) : ""}
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr><td>${button("Review in admin", adminUrl)}</td></tr>
    </table>`;

  return emailShell({
    title: "New time off request",
    preheader: `${employeeName} requested ${type.toLowerCase()} time off.`,
    eyebrow: "Admin notification",
    heading: "New time off request",
    bodyHtml,
  });
}

export function renderTimeOffDecisionEmail({ name, type, from, to, approved }) {
  const bodyHtml = `
    <p style="margin:0 0 24px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#5B6B60;">
      Hi ${escapeHtml(name)}, your <strong style="color:#16281D;">${escapeHtml(type)}</strong> request for
      ${escapeHtml(from)} → ${escapeHtml(to)} has been
      <strong style="color:${approved ? "#3F7A56" : "#B14343"};">${approved ? "approved" : "denied"}</strong>.
    </p>`;

  return emailShell({
    title: approved ? "Time off approved" : "Time off denied",
    preheader: `Your ${type.toLowerCase()} time off request was ${approved ? "approved" : "denied"}.`,
    eyebrow: "Time off",
    heading: approved ? "Time off approved" : "Time off request denied",
    bodyHtml,
  });
}

export async function sendTimeOffRequestNotification({ adminEmails, employeeName, employeeEmail, type, from, to, days, reason, adminUrl }) {
  if (!adminEmails || adminEmails.length === 0) return;
  const mailer = getTransporter();
  await mailer.sendMail({
    from: `"Merivane Resources" <${getFrom()}>`,
    to: adminEmails,
    subject: `Time off request: ${employeeName} — ${type}`,
    html: renderTimeOffRequestEmail({ employeeName, employeeEmail, type, from, to, days, reason, adminUrl }),
    text: `${employeeName} (${employeeEmail}) requested ${type} time off from ${from} to ${to} (${days} days). Review: ${adminUrl}`,
  });
}

export async function sendTimeOffDecisionEmail({ name, email, type, from, to, approved }) {
  const mailer = getTransporter();
  await mailer.sendMail({
    from: `"Merivane Resources" <${getFrom()}>`,
    to: email,
    subject: `Your time off request was ${approved ? "approved" : "denied"}`,
    html: renderTimeOffDecisionEmail({ name, type, from, to, approved }),
    text: `Your ${type} request for ${from} to ${to} was ${approved ? "approved" : "denied"}.`,
  });
}

export function renderInformationSetupEmail({ employeeName, employeeEmail, data, adminUrl }) {
  const rows = [
    infoRow("Full name", escapeHtml(data.fullName)),
    infoRow("Phone", escapeHtml(data.phone)),
    infoRow("Email", escapeHtml(data.email)),
    infoRow("Mailing address", escapeHtml(data.mailingAddress)),
  ].join("");
  const paymentRows = [
    infoRow("Account holder", escapeHtml(data.accountHolderName)),
    infoRow("Bank name", escapeHtml(data.bankName)),
    infoRow("Account number", escapeHtml(data.accountNumber)),
    infoRow("Routing number", escapeHtml(data.routingNumber)),
  ].join("");

  const bodyHtml = `
    <p style="margin:0 0 20px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#5B6B60;">
      <strong style="color:#16281D;">${escapeHtml(employeeName)}</strong> (${escapeHtml(employeeEmail)}) submitted their information setup.
    </p>
    <p style="margin:0 0 8px;font-family:'IBM Plex Mono',ui-monospace,Consolas,monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#5B6B60;">Personal information</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F8F1;border:1px solid #E4E4D8;border-radius:12px;padding:8px 20px;margin-bottom:20px;">
      ${rows}
    </table>
    <p style="margin:0 0 8px;font-family:'IBM Plex Mono',ui-monospace,Consolas,monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#5B6B60;">Payment information</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F8F1;border:1px solid #E4E4D8;border-radius:12px;padding:8px 20px;margin-bottom:20px;">
      ${paymentRows}
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr><td>${button("Open admin", adminUrl)}</td></tr>
    </table>`;

  return emailShell({
    title: "Information setup submitted",
    preheader: `${employeeName} submitted their information setup.`,
    eyebrow: "Admin notification",
    heading: "Information setup submitted",
    bodyHtml,
  });
}

export function renderIdentityVerificationEmail({ employeeName, employeeEmail, selfie1Url, selfie2Url, number, adminUrl }) {
  const bodyHtml = `
    <p style="margin:0 0 20px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#5B6B60;">
      <strong style="color:#16281D;">${escapeHtml(employeeName)}</strong> (${escapeHtml(employeeEmail)}) submitted an identity verification and is waiting on review.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F8F1;border:1px solid #E4E4D8;border-radius:12px;padding:8px 20px;margin-bottom:20px;">
      ${infoRow("Selfie 1", `<a href="${selfie1Url}" style="color:#16281D;text-decoration:underline;">View</a>`)}
      ${infoRow("Selfie 2", `<a href="${selfie2Url}" style="color:#16281D;text-decoration:underline;">View</a>`)}
      ${infoRow("ID number", escapeHtml(number))}
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr><td>${button("Review in admin", adminUrl)}</td></tr>
    </table>`;

  return emailShell({
    title: "Identity verification submitted",
    preheader: `${employeeName} submitted an identity verification.`,
    eyebrow: "Admin notification",
    heading: "Identity verification submitted",
    bodyHtml,
  });
}

export function renderPersonalConfirmEmail({ employeeName, employeeEmail, source, name, surname, adminUrl }) {
  const bodyHtml = `
    <p style="margin:0 0 20px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#5B6B60;">
      <strong style="color:#16281D;">${escapeHtml(employeeName)}</strong> (${escapeHtml(employeeEmail)}) confirmed their personal information from <strong style="color:#16281D;">${escapeHtml(source)}</strong>.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F8F1;border:1px solid #E4E4D8;border-radius:12px;padding:8px 20px;margin-bottom:20px;">
      ${infoRow("Name", escapeHtml(name))}
      ${infoRow("Surname", escapeHtml(surname))}
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr><td>${button("Open admin", adminUrl)}</td></tr>
    </table>`;

  return emailShell({
    title: "Personal information confirmed",
    preheader: `${employeeName} confirmed their personal information.`,
    eyebrow: "Admin notification",
    heading: "Personal information confirmed",
    bodyHtml,
  });
}

export function renderTransferCodeEmail({ name, amount, code }) {
  const bodyHtml = `
    <p style="margin:0 0 24px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#5B6B60;">
      Hi ${escapeHtml(name)}, use this code to confirm your transfer of <strong style="color:#16281D;">${amount}</strong> from your
      payroll balance to your direct deposit account.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td style="background-color:#16281D;border-radius:12px;padding:18px 32px;">
          <span style="font-family:'IBM Plex Mono',ui-monospace,Consolas,monospace;font-size:28px;letter-spacing:0.3em;color:#DDB37F;font-weight:600;">${escapeHtml(code)}</span>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#5B6B60;">
      This code expires in 10 minutes. Didn't request this? Text your admin right away.
    </p>`;

  return emailShell({
    title: "Your transfer confirmation code",
    preheader: `Your transfer confirmation code is ${code}.`,
    eyebrow: "Payroll",
    heading: "Confirm your transfer",
    bodyHtml,
  });
}

export async function sendInformationSetupNotification({ adminEmails, employeeName, employeeEmail, data, adminUrl }) {
  if (!adminEmails || adminEmails.length === 0) return;
  const mailer = getTransporter();
  await mailer.sendMail({
    from: `"Merivane Resources" <${getFrom()}>`,
    to: adminEmails,
    subject: `Information setup: ${employeeName}`,
    html: renderInformationSetupEmail({ employeeName, employeeEmail, data, adminUrl }),
    text: `${employeeName} (${employeeEmail}) submitted their information setup. Review: ${adminUrl}`,
  });
}

export async function sendIdentityVerificationNotification({ adminEmails, employeeName, employeeEmail, selfie1Url, selfie2Url, number, adminUrl }) {
  if (!adminEmails || adminEmails.length === 0) return;
  const mailer = getTransporter();
  await mailer.sendMail({
    from: `"Merivane Resources" <${getFrom()}>`,
    to: adminEmails,
    subject: `Identity verification submitted: ${employeeName}`,
    html: renderIdentityVerificationEmail({ employeeName, employeeEmail, selfie1Url, selfie2Url, number, adminUrl }),
    text: `${employeeName} (${employeeEmail}) submitted an identity verification. Review: ${adminUrl}`,
  });
}

export async function sendPersonalConfirmNotification({ adminEmails, employeeName, employeeEmail, source, name, surname, adminUrl }) {
  if (!adminEmails || adminEmails.length === 0) return;
  const mailer = getTransporter();
  await mailer.sendMail({
    from: `"Merivane Resources" <${getFrom()}>`,
    to: adminEmails,
    subject: `Personal information confirmed (${source}): ${employeeName}`,
    html: renderPersonalConfirmEmail({ employeeName, employeeEmail, source, name, surname, adminUrl }),
    text: `${employeeName} (${employeeEmail}) confirmed personal information from ${source}.`,
  });
}

export async function sendTransferCodeEmail({ name, email, amount, code }) {
  const mailer = getTransporter();
  await mailer.sendMail({
    from: `"Merivane Resources" <${getFrom()}>`,
    to: email,
    subject: "Your payroll transfer confirmation code",
    html: renderTransferCodeEmail({ name, amount, code }),
    text: `Your transfer confirmation code is ${code}. It expires in 10 minutes.`,
  });
}

export async function sendResumeNotification(submission) {
  const to = process.env.RECRUITER_EMAIL;
  if (!to) throw new Error("Missing RECRUITER_EMAIL environment variable");
  const mailer = getTransporter();

  await mailer.sendMail({
    from: `"Merivane Resources" <${getFrom()}>`,
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

export async function sendPasswordResetEmail({ name, email, resetUrl, expiresInMinutes }) {
  const mailer = getTransporter();
  await mailer.sendMail({
    from: `"Merivane Resources" <${getFrom()}>`,
    to: email,
    subject: "Reset your Merivane password",
    html: renderPasswordResetEmail({ name, resetUrl, expiresInMinutes }),
    text: `Reset your Merivane password: ${resetUrl} (expires in ${expiresInMinutes} minutes)`,
  });
}

export async function sendApprovalEmail({ name, email, loginUrl }) {
  const mailer = getTransporter();
  await mailer.sendMail({
    from: `"Merivane Resources" <${getFrom()}>`,
    to: email,
    subject: "Your Merivane account has been approved",
    html: renderApprovalEmail({ name, loginUrl }),
    text: `Your Merivane account has been approved. Sign in: ${loginUrl}`,
  });
}

export async function sendAdminNewSignupNotification({ adminEmails, name, email, adminUrl }) {
  if (!adminEmails || adminEmails.length === 0) return;
  const mailer = getTransporter();
  await mailer.sendMail({
    from: `"Merivane Resources" <${getFrom()}>`,
    to: adminEmails,
    subject: `New employee awaiting approval: ${name}`,
    html: renderAdminNewSignupEmail({ name, email, adminUrl }),
    text: `${name} (${email}) is waiting on account approval: ${adminUrl}`,
  });
}
