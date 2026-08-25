import { getDb } from "../../lib/mongodb.js";
import { hashPassword, signSession, setSessionCookie, toSafeUser } from "../../lib/auth.js";
import { sendAdminNewSignupNotification } from "../../lib/email.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanString(value, max = 300) {
  return String(value ?? "").trim().slice(0, max);
}

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
  const name = cleanString(body.name, 200);
  const email = cleanString(body.email, 200).toLowerCase();
  const phone = cleanString(body.phone, 60);
  const password = String(body.password ?? "");

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: "Please fill out all fields." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  const db = await getDb();
  const users = db.collection("users");

  const existing = await users.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }

  const isFirstUser = (await users.countDocuments({})) === 0;
  const role = isFirstUser ? "admin" : "employee";
  const status = isFirstUser ? "approved" : "pending";

  const passwordHash = await hashPassword(password);
  const now = new Date();
  const user = {
    name,
    email,
    phone,
    passwordHash,
    role,
    status,
    createdAt: now,
    approvedAt: isFirstUser ? now : null,
  };

  const result = await users.insertOne(user);
  user._id = result.insertedId;

  if (status === "approved") {
    const token = signSession({ userId: String(user._id), role: user.role });
    setSessionCookie(res, token, req);
  } else {
    try {
      const admins = await users.find({ role: "admin" }).project({ email: 1 }).toArray();
      const adminEmails = admins.map((a) => a.email).filter(Boolean);
      await sendAdminNewSignupNotification({
        adminEmails,
        name,
        email,
        adminUrl: `${baseUrl(req)}/admin`,
      });
    } catch (err) {
      console.error("Failed to send admin new-signup notification:", err);
    }
  }

  return res.status(201).json({ ok: true, user: toSafeUser(user) });
}
