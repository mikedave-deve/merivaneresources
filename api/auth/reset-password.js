import crypto from "crypto";
import { getDb } from "../../lib/mongodb.js";
import { hashPassword } from "../../lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "object" && req.body !== null ? req.body : {};
  const token = String(body.token ?? "").trim();
  const password = String(body.password ?? "");

  if (!token || !password) {
    return res.status(400).json({ error: "Missing reset token or password." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const db = await getDb();
  const users = db.collection("users");
  const user = await users.findOne({ resetTokenHash: tokenHash, resetTokenExpires: { $gt: new Date() } });

  if (!user) {
    return res.status(400).json({ error: "This reset link is invalid or has expired. Request a new one." });
  }

  const passwordHash = await hashPassword(password);
  await users.updateOne(
    { _id: user._id },
    { $set: { passwordHash }, $unset: { resetTokenHash: "", resetTokenExpires: "" } }
  );

  return res.status(200).json({ ok: true });
}
