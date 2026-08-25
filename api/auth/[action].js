import crypto from "crypto";
import { ObjectId } from "mongodb";
import { getDb } from "../../lib/mongodb.js";
import {
  hashPassword,
  verifyPassword,
  signSession,
  setSessionCookie,
  clearSessionCookie,
  getSessionFromRequest,
  toSafeUser,
} from "../../lib/auth.js";
import { sendAdminNewSignupNotification, sendPasswordResetEmail } from "../../lib/email.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESET_EXPIRES_MINUTES = 30;

function cleanString(value, max = 300) {
  return String(value ?? "").trim().slice(0, max);
}

function baseUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || "http";
  return `${proto}://${req.headers.host}`;
}

async function register(req, res) {
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
    title: "",
    department: "",
    location: "",
    timezone: "",
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

async function login(req, res) {
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

async function logout(req, res) {
  clearSessionCookie(res, req);
  return res.status(200).json({ ok: true });
}

async function me(req, res) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ error: "Not signed in." });
  }

  let user;
  try {
    const db = await getDb();
    user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) });
  } catch (err) {
    console.error("Failed to load session user:", err);
    return res.status(500).json({ error: "Something went wrong." });
  }

  if (!user || user.status !== "approved") {
    clearSessionCookie(res, req);
    return res.status(401).json({ error: "Not signed in." });
  }

  return res.status(200).json({ user: toSafeUser(user) });
}

async function forgotPassword(req, res) {
  const body = typeof req.body === "object" && req.body !== null ? req.body : {};
  const email = String(body.email ?? "").trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ error: "Enter your email address." });
  }

  const genericResponse = { ok: true, message: "If an account exists for that email, we've sent a reset link." };

  try {
    const db = await getDb();
    const users = db.collection("users");
    const user = await users.findOne({ email });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const expires = new Date(Date.now() + RESET_EXPIRES_MINUTES * 60 * 1000);

      await users.updateOne(
        { _id: user._id },
        { $set: { resetTokenHash: tokenHash, resetTokenExpires: expires } }
      );

      const resetUrl = `${baseUrl(req)}/reset-password?token=${token}`;
      await sendPasswordResetEmail({ name: user.name, email: user.email, resetUrl, expiresInMinutes: RESET_EXPIRES_MINUTES });
    }
  } catch (err) {
    console.error("Failed to process forgot-password request:", err);
  }

  return res.status(200).json(genericResponse);
}

async function resetPassword(req, res) {
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

const ROUTES = {
  register: { POST: register },
  login: { POST: login },
  logout: { POST: logout },
  me: { GET: me },
  "forgot-password": { POST: forgotPassword },
  "reset-password": { POST: resetPassword },
};

export default async function handler(req, res) {
  const action = req.query.action;
  const route = ROUTES[action];

  if (!route) {
    return res.status(404).json({ error: "Not found" });
  }
  const fn = route[req.method];
  if (!fn) {
    res.setHeader("Allow", Object.keys(route).join(", "));
    return res.status(405).json({ error: "Method not allowed" });
  }

  return fn(req, res);
}
