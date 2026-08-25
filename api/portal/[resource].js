import { ObjectId } from "mongodb";
import { getDb } from "../../lib/mongodb.js";
import { requireSession, toSafeUser, defaultTimeOffBalance } from "../../lib/auth.js";
import { logActivity, createNotification, currentWeekKeys, todayKey, daysBetween } from "../../lib/portal.js";
import { sendTimeOffRequestNotification } from "../../lib/email.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_OFF_TYPES = ["Vacation", "Sick", "Personal"];

function baseUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || "http";
  return `${proto}://${req.headers.host}`;
}

function clean(value, max = 300) {
  return String(value ?? "").trim().slice(0, max);
}

async function getUserOr401(req, res, db) {
  const session = requireSession(req, res);
  if (!session) return null;
  const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) });
  if (!user || user.status !== "approved") {
    res.status(401).json({ error: "Not signed in." });
    return null;
  }
  return user;
}

// ---------- dashboard ----------

async function dashboard(req, res, db, user) {
  const missions = db.collection("missions");
  const attendance = db.collection("attendance");
  const timeoff = db.collection("timeoff_requests");
  const notifications = db.collection("notifications");

  const [activeMissions, weekDocs, notificationsList, pendingTimeOff] = await Promise.all([
    missions.countDocuments({ employeeId: user._id, status: { $ne: "Completed" } }),
    attendance.find({ employeeId: user._id, date: { $in: currentWeekKeys().map((d) => d.key) } }).toArray(),
    notifications.find({ employeeId: user._id }).sort({ createdAt: -1 }).limit(3).toArray(),
    timeoff.find({ employeeId: user._id, status: "Pending" }).sort({ createdAt: -1 }).limit(1).toArray(),
  ]);

  const hoursThisWeek = Math.round(weekDocs.reduce((sum, d) => sum + (d.hours || 0), 0) * 10) / 10;
  const balance = user.timeOffBalance || defaultTimeOffBalance();
  const ptoAvailable = Object.values(balance).reduce((sum, b) => sum + Math.max(0, b.total - b.used), 0);

  const profileFields = [user.title, user.department, user.phone, user.location, user.timezone];
  const filled = profileFields.filter((f) => f && String(f).trim()).length;
  const profileStrength = Math.round((filled / profileFields.length) * 100);

  return res.status(200).json({
    stats: { activeMissions, hoursThisWeek, ptoAvailable, profileStrength },
    upNext: { pendingTimeOff: pendingTimeOff[0] ? formatTimeOff(pendingTimeOff[0]) : null },
    recentNotifications: notificationsList.map(formatNotification),
  });
}

// ---------- missions ----------

function formatMission(m) {
  return {
    id: String(m._id),
    title: m.title,
    instructions: m.instructions,
    dueDate: m.dueDate,
    priority: m.priority,
    status: m.status,
    progress: m.progress,
  };
}

async function missionsGet(req, res, db, user) {
  const missions = await db.collection("missions").find({ employeeId: user._id }).sort({ dueDate: 1 }).toArray();
  return res.status(200).json({ missions: missions.map(formatMission) });
}

// ---------- attendance ----------

function formatAttendance(a) {
  return { date: a.date, clockIn: a.clockIn, clockOut: a.clockOut, hours: a.hours || 0, status: a.status };
}

async function attendanceGet(req, res, db, user) {
  const attendance = db.collection("attendance");
  const weekKeys = currentWeekKeys();
  const today = todayKey();

  const [todayDoc, log, weekDocs] = await Promise.all([
    attendance.findOne({ employeeId: user._id, date: today }),
    attendance.find({ employeeId: user._id }).sort({ date: -1 }).limit(30).toArray(),
    attendance.find({ employeeId: user._id, date: { $in: weekKeys.map((d) => d.key) } }).toArray(),
  ]);

  const hoursByDate = new Map(weekDocs.map((d) => [d.date, d.hours || 0]));
  const weeklyHours = weekKeys.map((d) => ({ day: d.label, hours: hoursByDate.get(d.key) || 0 }));

  return res.status(200).json({
    clockedIn: !!(todayDoc && todayDoc.clockIn && !todayDoc.clockOut),
    today: todayDoc ? formatAttendance(todayDoc) : null,
    log: log.map(formatAttendance),
    weeklyHours,
  });
}

async function attendancePost(req, res, db, user) {
  const action = req.body?.action;
  if (!["clock-in", "clock-out"].includes(action)) {
    return res.status(400).json({ error: "action must be 'clock-in' or 'clock-out'." });
  }

  const attendance = db.collection("attendance");
  const today = todayKey();
  const now = new Date();
  const existing = await attendance.findOne({ employeeId: user._id, date: today });

  if (action === "clock-in") {
    if (existing && existing.clockIn) {
      return res.status(409).json({ error: "You're already clocked in for today." });
    }
    const doc = { employeeId: user._id, date: today, clockIn: now, clockOut: null, hours: 0, status: "Present" };
    if (existing) {
      await attendance.updateOne({ _id: existing._id }, { $set: doc });
    } else {
      await attendance.insertOne(doc);
    }
    await logActivity(db, user._id, "clock", `Clocked in at ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`);
  } else {
    if (!existing || !existing.clockIn || existing.clockOut) {
      return res.status(409).json({ error: "You're not currently clocked in." });
    }
    const hours = Math.round(((now - new Date(existing.clockIn)) / 3600000) * 100) / 100;
    await attendance.updateOne({ _id: existing._id }, { $set: { clockOut: now, hours } });
    await logActivity(db, user._id, "clock", `Clocked out at ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} (${hours}h)`);
  }

  return attendanceGet(req, res, db, user);
}

// ---------- time off ----------

function formatTimeOff(t) {
  return {
    id: String(t._id),
    type: t.type,
    from: t.from,
    to: t.to,
    days: t.days,
    status: t.status,
    reason: t.reason || "",
    createdAt: t.createdAt,
  };
}

async function timeoffGet(req, res, db, user) {
  const requests = await db.collection("timeoff_requests").find({ employeeId: user._id }).sort({ createdAt: -1 }).toArray();
  return res.status(200).json({
    balance: user.timeOffBalance || defaultTimeOffBalance(),
    requests: requests.map(formatTimeOff),
  });
}

async function timeoffPost(req, res, db, user) {
  const body = typeof req.body === "object" && req.body !== null ? req.body : {};
  const type = clean(body.type, 30);
  const from = clean(body.from, 20);
  const to = clean(body.to, 20);
  const reason = clean(body.reason, 500);

  if (!TIME_OFF_TYPES.includes(type)) {
    return res.status(400).json({ error: "type must be Vacation, Sick, or Personal." });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return res.status(400).json({ error: "Please provide valid start and end dates." });
  }
  const days = daysBetween(from, to);
  if (days === null) {
    return res.status(400).json({ error: "End date must be on or after the start date." });
  }

  const doc = {
    employeeId: user._id,
    type,
    from,
    to,
    days,
    reason,
    status: "Pending",
    createdAt: new Date(),
    decidedAt: null,
  };
  const result = await db.collection("timeoff_requests").insertOne(doc);
  doc._id = result.insertedId;

  await logActivity(db, user._id, "calendar", `Requested ${type.toLowerCase()} time off, ${days} day${days === 1 ? "" : "s"} (${from} → ${to})`);

  try {
    const admins = await db.collection("users").find({ role: "admin" }).project({ email: 1 }).toArray();
    const adminEmails = admins.map((a) => a.email).filter(Boolean);
    await sendTimeOffRequestNotification({
      adminEmails,
      employeeName: user.name,
      employeeEmail: user.email,
      type,
      from,
      to,
      days,
      reason,
      adminUrl: `${baseUrl(req)}/admin`,
    });
  } catch (err) {
    console.error("Failed to send time off request notification:", err);
  }

  return res.status(201).json({ ok: true, request: formatTimeOff(doc) });
}

// ---------- activity ----------

async function activityGet(req, res, db, user) {
  const activity = await db.collection("activity_log").find({ employeeId: user._id }).sort({ time: -1 }).limit(50).toArray();
  return res.status(200).json({
    activity: activity.map((a) => ({ icon: a.icon, label: a.label, time: a.time })),
  });
}

// ---------- notifications ----------

function formatNotification(n) {
  return {
    id: String(n._id),
    icon: n.icon,
    title: n.title,
    preview: n.preview,
    type: n.type,
    unread: n.unread,
    time: n.createdAt,
  };
}

async function notificationsGet(req, res, db, user) {
  const notifications = await db.collection("notifications").find({ employeeId: user._id }).sort({ createdAt: -1 }).limit(30).toArray();
  return res.status(200).json({ notifications: notifications.map(formatNotification) });
}

async function notificationsPatch(req, res, db, user) {
  const body = typeof req.body === "object" && req.body !== null ? req.body : {};
  const notifications = db.collection("notifications");

  if (body.action === "mark-all-read") {
    await notifications.updateMany({ employeeId: user._id, unread: true }, { $set: { unread: false } });
  } else if (body.action === "mark-read" && body.id) {
    try {
      await notifications.updateOne({ _id: new ObjectId(body.id), employeeId: user._id }, { $set: { unread: false } });
    } catch {
      return res.status(400).json({ error: "Invalid notification id." });
    }
  } else {
    return res.status(400).json({ error: "action must be 'mark-all-read' or 'mark-read'." });
  }

  return notificationsGet(req, res, db, user);
}

// ---------- profile ----------

async function profilePatch(req, res, db, user) {
  const body = typeof req.body === "object" && req.body !== null ? req.body : {};
  const name = clean(body.name, 200);
  const email = clean(body.email, 200).toLowerCase();
  const phone = clean(body.phone, 60);
  const location = clean(body.location, 150);
  const timezone = clean(body.timezone, 100);

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }

  const users = db.collection("users");
  if (email !== user.email) {
    const existing = await users.findOne({ email, _id: { $ne: user._id } });
    if (existing) {
      return res.status(409).json({ error: "That email is already in use." });
    }
  }

  await users.updateOne({ _id: user._id }, { $set: { name, email, phone, location, timezone } });
  await logActivity(db, user._id, "user", "Updated profile details");
  await createNotification(db, user._id, {
    icon: "user",
    title: "Profile updated",
    preview: "Your contact details were changed.",
    type: "Profile",
  });

  const updated = await users.findOne({ _id: user._id });
  return res.status(200).json({ ok: true, user: toSafeUser(updated) });
}

// ---------- dispatch ----------

const ROUTES = {
  dashboard: { GET: dashboard },
  missions: { GET: missionsGet },
  attendance: { GET: attendanceGet, POST: attendancePost },
  timeoff: { GET: timeoffGet, POST: timeoffPost },
  activity: { GET: activityGet },
  notifications: { GET: notificationsGet, PATCH: notificationsPatch },
  profile: { PATCH: profilePatch },
};

export default async function handler(req, res) {
  const resource = req.query.resource;
  const route = ROUTES[resource];
  if (!route) {
    return res.status(404).json({ error: "Not found" });
  }
  const fn = route[req.method];
  if (!fn) {
    res.setHeader("Allow", Object.keys(route).join(", "));
    return res.status(405).json({ error: "Method not allowed" });
  }

  const db = await getDb();
  const user = await getUserOr401(req, res, db);
  if (!user) return;

  return fn(req, res, db, user);
}
