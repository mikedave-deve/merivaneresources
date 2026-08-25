const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export async function logActivity(db, employeeId, icon, label) {
  await db.collection("activity_log").insertOne({
    employeeId,
    icon,
    label,
    time: new Date(),
  });
}

export async function createNotification(db, employeeId, { icon, title, preview, type }) {
  await db.collection("notifications").insertOne({
    employeeId,
    icon,
    title,
    preview,
    type,
    unread: true,
    createdAt: new Date(),
  });
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

/** Monday..Sunday date-string keys for the week containing `now`. */
export function currentWeekKeys(now = new Date()) {
  const day = now.getUTCDay(); // 0=Sun..6=Sat
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + mondayOffset));
  return DAY_LABELS.map((label, i) => {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);
    return { label, key: toDateKey(d) };
  });
}

export function todayKey(now = new Date()) {
  return toDateKey(now);
}

/** Inclusive day count between two YYYY-MM-DD strings. */
export function daysBetween(fromStr, toStr) {
  const from = new Date(`${fromStr}T00:00:00Z`);
  const to = new Date(`${toStr}T00:00:00Z`);
  const diff = Math.round((to.getTime() - from.getTime()) / 86400000);
  return diff >= 0 ? diff + 1 : null;
}

export function last4(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.slice(-4);
}

export function defaultPayroll() {
  return { balance: 0, nextPaymentAmount: 0, nextPaymentDate: null, schedule: "Monthly", directDeposit: null };
}

export function defaultRetirement() {
  return { balance: 0, contributionRate: 0, employerMatch: "" };
}

export function defaultIdentity() {
  return { status: "Unverified", verifiedOn: null, method: "Selfie + ID number match", documentType: "Selfie verification", submission: null, history: [] };
}

export function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function getAdminEmails(db) {
  const admins = await db.collection("users").find({ role: "admin" }).project({ email: 1 }).toArray();
  return admins.map((a) => a.email).filter(Boolean);
}
