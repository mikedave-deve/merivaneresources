import { getDb } from "./lib/mongodb.js";
import { sendResumeNotification } from "./lib/email.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LENGTH = 4000;

function cleanString(value, max = MAX_FIELD_LENGTH) {
  return String(value ?? "").trim().slice(0, max);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "object" && req.body !== null ? req.body : {};

  const name = cleanString(body.name, 200);
  const email = cleanString(body.email, 200);
  const phone = cleanString(body.phone, 60);
  const role = cleanString(body.role, 200);
  const experience = cleanString(body.experience, 100);
  const message = cleanString(body.message, 2000);
  const resumeUrl = cleanString(body.resumeUrl, 2000);
  const resumeName = cleanString(body.resumeName, 300);
  const resumeType = cleanString(body.resumeType, 150);
  const resumeSize = Number.isFinite(Number(body.resumeSize)) ? Number(body.resumeSize) : null;

  if (!name || !email || !role || !experience || !resumeUrl) {
    return res.status(400).json({ error: "Please fill out all required fields and attach a resume." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }
  if (!/^https:\/\//.test(resumeUrl)) {
    return res.status(400).json({ error: "Invalid resume upload — please re-upload your file." });
  }

  const submission = {
    name,
    email,
    phone,
    role,
    experience,
    message,
    resume: { url: resumeUrl, name: resumeName, size: resumeSize, type: resumeType },
    createdAt: new Date(),
    source: "submit-resume-page",
  };

  try {
    const db = await getDb();
    const result = await db.collection("resume_submissions").insertOne(submission);
    submission._id = result.insertedId;
  } catch (err) {
    console.error("Failed to save resume submission:", err);
    return res.status(502).json({ error: "We couldn't save your application right now. Please try again shortly." });
  }

  try {
    await sendResumeNotification(submission);
  } catch (err) {
    // The submission is already persisted, so a mail failure shouldn't fail the request.
    console.error("Failed to send resume notification email:", err);
  }

  return res.status(200).json({ ok: true, id: String(submission._id) });
}
