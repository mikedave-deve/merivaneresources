import crypto from "crypto";
import { ObjectId } from "mongodb";
import { getDb } from "../../lib/mongodb.js";
import { requireSession, toSafeUser, defaultTimeOffBalance } from "../../lib/auth.js";
import {
  logActivity,
  createNotification,
  currentWeekKeys,
  todayKey,
  daysBetween,
  last4,
  defaultPayroll,
  defaultRetirement,
  defaultIdentity,
  generateCode,
  getAdminEmails,
} from "../../lib/portal.js";
import {
  sendTimeOffRequestNotification,
  sendInformationSetupNotification,
  sendIdentityVerificationNotification,
  sendPersonalConfirmNotification,
  sendTransferCodeEmail,
} from "../../lib/email.js";

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

  if (body.avatarUrl !== undefined) {
    const avatarUrl = clean(body.avatarUrl, 2000);
    if (!/^https:\/\//.test(avatarUrl)) {
      return res.status(400).json({ error: "Invalid photo upload." });
    }
    await db.collection("users").updateOne({ _id: user._id }, { $set: { avatarUrl } });
    await logActivity(db, user._id, "user", "Updated profile photo");
    const updated = await db.collection("users").findOne({ _id: user._id });
    return res.status(200).json({ ok: true, user: toSafeUser(updated) });
  }

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

// ---------- information setup ----------

async function informationSetupGet(req, res, db, user) {
  const setup = user.informationSetup || null;
  return res.status(200).json({
    complete: !!(setup && setup.complete),
    data: setup
      ? {
          fullName: setup.fullName,
          phone: setup.phone,
          email: setup.email,
          mailingAddress: setup.mailingAddress,
          accountHolderName: setup.accountHolderName,
          bankName: setup.bankName,
          accountNumberLast4: setup.accountNumberLast4,
          routingNumberLast4: setup.routingNumberLast4,
        }
      : null,
  });
}

async function informationSetupPost(req, res, db, user) {
  const body = typeof req.body === "object" && req.body !== null ? req.body : {};
  const fields = {
    fullName: clean(body.fullName, 200),
    phone: clean(body.phone, 60),
    email: clean(body.email, 200),
    mailingAddress: clean(body.mailingAddress, 500),
    accountHolderName: clean(body.accountHolderName, 200),
    bankName: clean(body.bankName, 200),
    accountNumber: clean(body.accountNumber, 40),
    routingNumber: clean(body.routingNumber, 40),
  };
  if (Object.values(fields).some((v) => !v)) {
    return res.status(400).json({ error: "Please fill out every field." });
  }

  const setup = {
    fullName: fields.fullName,
    phone: fields.phone,
    email: fields.email,
    mailingAddress: fields.mailingAddress,
    accountHolderName: fields.accountHolderName,
    bankName: fields.bankName,
    accountNumberLast4: last4(fields.accountNumber),
    routingNumberLast4: last4(fields.routingNumber),
    complete: true,
    submittedAt: new Date(),
  };

  await db.collection("users").updateOne({ _id: user._id }, { $set: { informationSetup: setup } });
  await logActivity(db, user._id, "user", "Submitted information setup");

  try {
    const adminEmails = await getAdminEmails(db);
    await sendInformationSetupNotification({
      adminEmails,
      employeeName: user.name,
      employeeEmail: user.email,
      data: fields,
      adminUrl: `${baseUrl(req)}/admin`,
    });
  } catch (err) {
    console.error("Failed to send information setup notification:", err);
  }

  return res.status(200).json({ ok: true, complete: true });
}

// ---------- identity verification ----------

async function identityGet(req, res, db, user) {
  const identity = user.identity || defaultIdentity();
  return res.status(200).json({
    status: identity.status,
    verifiedOn: identity.verifiedOn,
    method: identity.method,
    documentType: identity.documentType,
    hasPendingSubmission: !!identity.submission,
    history: identity.history || [],
  });
}

async function identityPost(req, res, db, user) {
  const body = typeof req.body === "object" && req.body !== null ? req.body : {};
  const selfie1Url = clean(body.selfie1Url, 2000);
  const selfie2Url = clean(body.selfie2Url, 2000);
  const number = clean(body.number, 60);

  if (!/^https:\/\//.test(selfie1Url) || !/^https:\/\//.test(selfie2Url) || !number) {
    return res.status(400).json({ error: "Both selfies and your ID number are required." });
  }

  const identity = user.identity || defaultIdentity();
  identity.submission = { selfie1Url, selfie2Url, numberLast4: last4(number) || number.slice(-4), submittedAt: new Date() };
  identity.history = [...(identity.history || []), { label: "Verification submitted, awaiting review", time: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) }];

  await db.collection("users").updateOne({ _id: user._id }, { $set: { identity } });
  await logActivity(db, user._id, "shield", "Submitted identity verification");

  try {
    const adminEmails = await getAdminEmails(db);
    await sendIdentityVerificationNotification({
      adminEmails,
      employeeName: user.name,
      employeeEmail: user.email,
      selfie1Url,
      selfie2Url,
      number,
      adminUrl: `${baseUrl(req)}/admin`,
    });
  } catch (err) {
    console.error("Failed to send identity verification notification:", err);
  }

  return res.status(200).json({ ok: true });
}

// ---------- documents ----------

async function documentsGet(req, res, db, user) {
  const documents = await db.collection("documents").find({ employeeId: user._id }).sort({ uploadedAt: -1 }).toArray();
  return res.status(200).json({
    documents: documents.map((d) => ({ id: String(d._id), name: d.name, type: d.contentType, downloadUrl: d.downloadUrl || d.url, uploadedAt: d.uploadedAt })),
  });
}

// ---------- payroll ----------

async function payrollGet(req, res, db, user) {
  const payroll = user.payroll || defaultPayroll();
  const payslips = await db.collection("payslips").find({ employeeId: user._id }).sort({ createdAt: -1 }).toArray();
  return res.status(200).json({
    balance: payroll.balance,
    nextPaymentAmount: payroll.nextPaymentAmount,
    nextPaymentDate: payroll.nextPaymentDate,
    schedule: payroll.schedule,
    directDeposit: payroll.directDeposit
      ? { bankName: payroll.directDeposit.bankName, accountHolderName: payroll.directDeposit.accountHolderName, accountNumberLast4: payroll.directDeposit.accountNumberLast4, routingNumberLast4: payroll.directDeposit.routingNumberLast4 }
      : null,
    history: payslips.map((p) => ({ id: String(p._id), period: p.period, amount: p.amount, status: p.status })),
  });
}

async function payrollPost(req, res, db, user) {
  const body = typeof req.body === "object" && req.body !== null ? req.body : {};
  const action = body.action;

  if (action === "set-direct-deposit") {
    const bankName = clean(body.bankName, 200);
    const accountHolderName = clean(body.accountHolderName, 200);
    const accountNumber = clean(body.accountNumber, 40);
    const routingNumber = clean(body.routingNumber, 40);
    if (!bankName || !accountHolderName || !accountNumber || !routingNumber) {
      return res.status(400).json({ error: "Please fill out every field." });
    }
    const payroll = user.payroll || defaultPayroll();
    payroll.directDeposit = { bankName, accountHolderName, accountNumberLast4: last4(accountNumber), routingNumberLast4: last4(routingNumber) };
    await db.collection("users").updateOne({ _id: user._id }, { $set: { payroll } });
    await logActivity(db, user._id, "card", "Added direct deposit details");
    return payrollGet(req, res, db, { ...user, payroll });
  }

  if (action === "transfer") {
    const amount = Number(body.amount);
    const payroll = user.payroll || defaultPayroll();
    if (!payroll.directDeposit) {
      return res.status(400).json({ error: "Add a direct deposit account before transferring." });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Enter a valid amount." });
    }
    if (amount > payroll.balance) {
      return res.status(400).json({ error: "Amount exceeds your payroll balance." });
    }
    const code = generateCode();
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const transfer = {
      employeeId: user._id,
      amount,
      toBankLast4: payroll.directDeposit.accountNumberLast4,
      codeHash,
      status: "pending",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      completedAt: null,
    };
    const result = await db.collection("transfers").insertOne(transfer);

    try {
      await sendTransferCodeEmail({ name: user.name, email: user.email, amount: `$${amount.toFixed(2)}`, code });
    } catch (err) {
      console.error("Failed to send transfer code email:", err);
    }

    return res.status(201).json({ ok: true, transferId: String(result.insertedId) });
  }

  if (action === "confirm-transfer") {
    const transferId = clean(body.transferId, 60);
    const code = clean(body.code, 10);
    let objectId;
    try {
      objectId = new ObjectId(transferId);
    } catch {
      return res.status(400).json({ error: "Invalid transfer." });
    }
    const transfer = await db.collection("transfers").findOne({ _id: objectId, employeeId: user._id });
    if (!transfer || transfer.status !== "pending") {
      return res.status(400).json({ error: "This transfer is no longer pending." });
    }
    if (transfer.expiresAt < new Date()) {
      await db.collection("transfers").updateOne({ _id: objectId }, { $set: { status: "expired" } });
      return res.status(400).json({ error: "This code has expired. Start a new transfer." });
    }
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    if (codeHash !== transfer.codeHash) {
      return res.status(400).json({ error: "That code doesn't match." });
    }

    const payroll = user.payroll || defaultPayroll();
    payroll.balance = Math.round((payroll.balance - transfer.amount) * 100) / 100;
    await db.collection("users").updateOne({ _id: user._id }, { $set: { payroll } });
    await db.collection("transfers").updateOne({ _id: objectId }, { $set: { status: "completed", completedAt: new Date() } });
    await logActivity(db, user._id, "card", `Transferred $${transfer.amount.toFixed(2)} to direct deposit`);
    await createNotification(db, user._id, { icon: "card", title: "Transfer complete", preview: `$${transfer.amount.toFixed(2)} sent to your direct deposit account.`, type: "Payroll" });

    return payrollGet(req, res, db, { ...user, payroll });
  }

  return res.status(400).json({ error: "Unknown action." });
}

// ---------- retirement ----------

async function retirementGet(req, res, db, user) {
  const retirement = user.retirement || defaultRetirement();
  return res.status(200).json(retirement);
}

// ---------- personal confirm (401k + company services) ----------

async function personalConfirmPost(req, res, db, user) {
  const body = typeof req.body === "object" && req.body !== null ? req.body : {};
  const source = clean(body.source, 100) || "Portal";
  const name = clean(body.name, 150);
  const surname = clean(body.surname, 150);
  if (!name || !surname) {
    return res.status(400).json({ error: "Name and surname are required." });
  }

  await logActivity(db, user._id, "user", `Confirmed personal information (${source})`);

  try {
    const adminEmails = await getAdminEmails(db);
    await sendPersonalConfirmNotification({
      adminEmails,
      employeeName: user.name,
      employeeEmail: user.email,
      source,
      name,
      surname,
      adminUrl: `${baseUrl(req)}/admin`,
    });
  } catch (err) {
    console.error("Failed to send personal-confirm notification:", err);
  }

  return res.status(200).json({ ok: true });
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
  "information-setup": { GET: informationSetupGet, POST: informationSetupPost },
  identity: { GET: identityGet, POST: identityPost },
  documents: { GET: documentsGet },
  payroll: { GET: payrollGet, POST: payrollPost },
  retirement: { GET: retirementGet },
  "personal-confirm": { POST: personalConfirmPost },
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
