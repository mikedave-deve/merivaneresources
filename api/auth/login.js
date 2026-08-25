import { getDb } from "../../lib/mongodb.js";
import { verifyPassword, signSession, setSessionCookie, toSafeUser } from "../../lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "object" && req.body !== null ? req.body : {};
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return res.status(400).json({ error: "Enter your email and password." });
  }

  const db = await getDb();
  const user = await db.collection("users").findOne({ email });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  if (user.status === "pending") {
    return res.status(403).json({ error: "Your account is still awaiting admin approval.", status: "pending" });
  }
  if (user.status === "rejected") {
    return res.status(403).json({ error: "Your account request wasn't approved. Contact the recruiting team for details.", status: "rejected" });
  }

  const token = signSession({ userId: String(user._id), role: user.role });
  setSessionCookie(res, token, req);

  return res.status(200).json({ ok: true, user: toSafeUser(user) });
}
