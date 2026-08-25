import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

const COOKIE_NAME = "merivane_session";
const SESSION_DAYS = 7;

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Missing AUTH_SECRET environment variable");
  return secret;
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signSession(payload) {
  return jwt.sign(payload, getAuthSecret(), { expiresIn: `${SESSION_DAYS}d` });
}

export function verifySession(token) {
  try {
    return jwt.verify(token, getAuthSecret());
  } catch {
    return null;
  }
}

export function setSessionCookie(res, token, req) {
  const isHttps = req.headers["x-forwarded-proto"] === "https";
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DAYS * 24 * 60 * 60,
    })
  );
}

export function clearSessionCookie(res, req) {
  const isHttps = req.headers["x-forwarded-proto"] === "https";
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(COOKIE_NAME, "", {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })
  );
}

export function getSessionFromRequest(req) {
  const header = req.headers.cookie;
  if (!header) return null;
  const parsed = cookie.parse(header);
  const token = parsed[COOKIE_NAME];
  if (!token) return null;
  return verifySession(token);
}

export function requireAdmin(req, res) {
  const session = getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    res.status(403).json({ error: "Admin access required." });
    return null;
  }
  return session;
}

export function requireSession(req, res) {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: "Not signed in." });
    return null;
  }
  return session;
}

const DEFAULT_TIME_OFF_BALANCE = {
  vacation: { used: 0, total: 15 },
  sick: { used: 0, total: 10 },
  personal: { used: 0, total: 5 },
};

export function defaultTimeOffBalance() {
  return JSON.parse(JSON.stringify(DEFAULT_TIME_OFF_BALANCE));
}

export function toSafeUser(user) {
  if (!user) return null;
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    status: user.status,
    title: user.title || "",
    department: user.department || "",
    location: user.location || "",
    timezone: user.timezone || "",
    avatarUrl: user.avatarUrl || "",
    timeOffBalance: user.timeOffBalance || defaultTimeOffBalance(),
    createdAt: user.createdAt,
  };
}
