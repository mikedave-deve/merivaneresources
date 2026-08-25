import { ObjectId } from "mongodb";
import { getDb } from "../../../lib/mongodb.js";
import { requireAdmin, defaultTimeOffBalance } from "../../../lib/auth.js";
import { logActivity, createNotification } from "../../../lib/portal.js";
import { sendTimeOffDecisionEmail } from "../../../lib/email.js";

const PRIORITIES = ["High", "Medium", "Low"];
const MISSION_STATUSES = ["Not Started", "In Progress", "In Review", "Completed"];

function clean(value, max = 300) {
  return String(value ?? "").trim().slice(0, max);
}

async function employeeMap(db, ids) {
  const unique = [...new Set(ids.map((id) => String(id)))].map((id) => new ObjectId(id));
  const employees = await db.collection("users").find({ _id: { $in: unique } }).project({ name: 1, email: 1 }).toArray();
  return new Map(employees.map((e) => [String(e._id), { name: e.name, email: e.email }]));
}

// ---------- missions ----------

function formatMission(m, employees) {
  const emp = employees.get(String(m.employeeId)) || {};
  return {
    id: String(m._id),
    employeeId: String(m.employeeId),
    employeeName: emp.name || "Unknown",
    employeeEmail: emp.email || "",
    title: m.title,
    instructions: m.instructions,
    dueDate: m.dueDate,
    priority: m.priority,
    status: m.status,
    progress: m.progress,
    createdAt: m.createdAt,
  };
}

async function missionsGet(req, res, db) {
  const filter = {};
  if (req.query.employeeId) {
    try {
      filter.employeeId = new ObjectId(req.query.employeeId);
    } catch {
      return res.status(400).json({ error: "Invalid employeeId." });
    }
  }
  const missions = await db.collection("missions").find(filter).sort({ createdAt: -1 }).toArray();
  const employees = await employeeMap(db, missions.map((m) => m.employeeId));
  return res.status(200).json({ missions: missions.map((m) => formatMission(m, employees)) });
}

async function missionsPost(req, res, db) {
  const body = typeof req.body === "object" && req.body !== null ? req.body : {};
  const title = clean(body.title, 200);
  const instructions = clean(body.instructions, 3000);
  const dueDate = clean(body.dueDate, 20);
  const priority = PRIORITIES.includes(body.priority) ? body.priority : "Medium";

  if (!title || !instructions || !body.employeeId) {
    return res.status(400).json({ error: "employeeId, title, and instructions are required." });
  }

  let employeeId;
  try {
    employeeId = new ObjectId(body.employeeId);
  } catch {
    return res.status(400).json({ error: "Invalid employeeId." });
  }

  const employee = await db.collection("users").findOne({ _id: employeeId, role: "employee" });
  if (!employee) return res.status(404).json({ error: "Employee not found." });

  const doc = {
    employeeId,
    title,
    instructions,
    dueDate: dueDate || null,
    priority,
    status: "Not Started",
    progress: 0,
    createdAt: new Date(),
  };
  const result = await db.collection("missions").insertOne(doc);
  doc._id = result.insertedId;

  await logActivity(db, employeeId, "briefcase", `New mission assigned: ${title}`);
  await createNotification(db, employeeId, {
    icon: "briefcase",
    title: "New mission assigned",
    preview: title,
    type: "Mission",
  });

  return res.status(201).json({ ok: true, mission: formatMission(doc, new Map([[String(employeeId), employee]])) });
}

async function missionsPatch(req, res, db) {
  const { id } = req.query;
  let objectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return res.status(400).json({ error: "Invalid mission id." });
  }

  const mission = await db.collection("missions").findOne({ _id: objectId });
  if (!mission) return res.status(404).json({ error: "Mission not found." });

  const body = typeof req.body === "object" && req.body !== null ? req.body : {};
  const updates = {};
  if (body.title !== undefined) updates.title = clean(body.title, 200);
  if (body.instructions !== undefined) updates.instructions = clean(body.instructions, 3000);
  if (body.dueDate !== undefined) updates.dueDate = clean(body.dueDate, 20) || null;
  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority)) return res.status(400).json({ error: "Invalid priority." });
    updates.priority = body.priority;
  }
  if (body.status !== undefined) {
    if (!MISSION_STATUSES.includes(body.status)) return res.status(400).json({ error: "Invalid status." });
    updates.status = body.status;
  }
  if (body.progress !== undefined) {
    const progress = Number(body.progress);
    if (Number.isNaN(progress) || progress < 0 || progress > 100) return res.status(400).json({ error: "Invalid progress." });
    updates.progress = progress;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No fields to update." });
  }

  await db.collection("missions").updateOne({ _id: objectId }, { $set: updates });
  await logActivity(db, mission.employeeId, "briefcase", `Mission updated: ${updates.title || mission.title}`);
  await createNotification(db, mission.employeeId, {
    icon: "briefcase",
    title: "Mission updated",
    preview: updates.title || mission.title,
    type: "Mission",
  });

  const updated = await db.collection("missions").findOne({ _id: objectId });
  const employees = await employeeMap(db, [updated.employeeId]);
  return res.status(200).json({ ok: true, mission: formatMission(updated, employees) });
}

// ---------- time off ----------

const TIMEOFF_STATUSES = ["pending", "approved", "denied", "all"];

function formatTimeOff(t, employees) {
  const emp = employees.get(String(t.employeeId)) || {};
  return {
    id: String(t._id),
    employeeId: String(t.employeeId),
    employeeName: emp.name || "Unknown",
    employeeEmail: emp.email || "",
    type: t.type,
    from: t.from,
    to: t.to,
    days: t.days,
    status: t.status,
    reason: t.reason || "",
    createdAt: t.createdAt,
  };
}

async function timeoffGet(req, res, db) {
  const statusParam = TIMEOFF_STATUSES.includes(req.query.status) ? req.query.status : "pending";
  const filter = {};
  if (statusParam !== "all") filter.status = statusParam[0].toUpperCase() + statusParam.slice(1);

  const requests = await db.collection("timeoff_requests").find(filter).sort({ createdAt: -1 }).toArray();
  const employees = await employeeMap(db, requests.map((t) => t.employeeId));
  return res.status(200).json({ requests: requests.map((t) => formatTimeOff(t, employees)) });
}

async function timeoffPatch(req, res, db) {
  const { id } = req.query;
  let objectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return res.status(400).json({ error: "Invalid request id." });
  }

  const body = typeof req.body === "object" && req.body !== null ? req.body : {};
  const action = body.action;
  if (!["approve", "deny"].includes(action)) {
    return res.status(400).json({ error: "action must be 'approve' or 'deny'." });
  }

  const request = await db.collection("timeoff_requests").findOne({ _id: objectId });
  if (!request) return res.status(404).json({ error: "Request not found." });
  if (request.status !== "Pending") return res.status(409).json({ error: "This request has already been decided." });

  const status = action === "approve" ? "Approved" : "Denied";
  await db.collection("timeoff_requests").updateOne({ _id: objectId }, { $set: { status, decidedAt: new Date() } });

  const users = db.collection("users");
  const employee = await users.findOne({ _id: request.employeeId });

  if (action === "approve" && employee) {
    const balance = employee.timeOffBalance || defaultTimeOffBalance();
    const key = request.type.toLowerCase();
    if (balance[key]) balance[key] = { ...balance[key], used: balance[key].used + request.days };
    await users.updateOne({ _id: request.employeeId }, { $set: { timeOffBalance: balance } });
  }

  await logActivity(db, request.employeeId, "calendar", `Time off request ${status.toLowerCase()}: ${request.type} (${request.from} → ${request.to})`);
  await createNotification(db, request.employeeId, {
    icon: "calendar",
    title: `Time off ${status.toLowerCase()}`,
    preview: `${request.type}, ${request.from} → ${request.to}`,
    type: "Time Off",
  });

  if (employee) {
    try {
      await sendTimeOffDecisionEmail({
        name: employee.name,
        email: employee.email,
        type: request.type,
        from: request.from,
        to: request.to,
        approved: action === "approve",
      });
    } catch (err) {
      console.error("Failed to send time off decision email:", err);
    }
  }

  const updated = await db.collection("timeoff_requests").findOne({ _id: objectId });
  const employees = await employeeMap(db, [updated.employeeId]);
  return res.status(200).json({ ok: true, request: formatTimeOff(updated, employees) });
}

// ---------- dispatch ----------

const ROUTES = {
  missions: { GET: missionsGet, POST: missionsPost, PATCH: missionsPatch },
  timeoff: { GET: timeoffGet, PATCH: timeoffPatch },
};

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  const resource = req.query.resource;
  const route = ROUTES[resource];
  if (!route) return res.status(404).json({ error: "Not found" });

  const fn = route[req.method];
  if (!fn) {
    res.setHeader("Allow", Object.keys(route).join(", "));
    return res.status(405).json({ error: "Method not allowed" });
  }

  const db = await getDb();
  return fn(req, res, db);
}
