import crypto from "crypto";
import { getDb } from "../../lib/mongodb.js";
import { sendPasswordResetEmail } from "../../lib/email.js";

const EXPIRES_MINUTES = 30;

function baseUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || "http";
  return `${proto}://${req.headers.host}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "object" && req.body !== null ? req.body : {};
  const email = String(body.email ?? "").trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ error: "Enter your email address." });
  }

  // Always respond with the same generic message, whether or not the
  // account exists, so this endpoint can't be used to enumerate emails.
  const genericResponse = { ok: true, message: "If an account exists for that email, we've sent a reset link." };

  try {
    const db = await getDb();
    const users = db.collection("users");
    const user = await users.findOne({ email });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const expires = new Date(Date.now() + EXPIRES_MINUTES * 60 * 1000);

      await users.updateOne(
        { _id: user._id },
        { $set: { resetTokenHash: tokenHash, resetTokenExpires: expires } }
      );

      const resetUrl = `${baseUrl(req)}/reset-password?token=${token}`;
      await sendPasswordResetEmail({ name: user.name, email: user.email, resetUrl, expiresInMinutes: EXPIRES_MINUTES });
    }
  } catch (err) {
    console.error("Failed to process forgot-password request:", err);
  }

  return res.status(200).json(genericResponse);
}
