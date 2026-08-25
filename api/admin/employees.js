import { ObjectId } from "mongodb";
import { getDb } from "../../lib/mongodb.js";
import { requireAdmin, toSafeUser } from "../../lib/auth.js";
import { sendApprovalEmail } from "../../lib/email.js";

const VALID_STATUSES = ["pending", "approved", "rejected", "all"];

function baseUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || "http";
  return `${proto}://${req.headers.host}`;
}

async function list(req, res) {
  const status = VALID_STATUSES.includes(req.query.status) ? req.query.status : "pending";
  const filter = { role: "employee" };
  if (status !== "all") filter.status = status;

  const db = await getDb();
  const employees = await db.collection("users").find(filter).sort({ createdAt: -1 }).toArray();

  return res.status(200).json({ employees: employees.map(toSafeUser) });
}

async function update(req, res) {
  const { id } = req.query;
  const body = typeof req.body === "object" && req.body !== null ? req.body : {};
  const { action } = body;

  let objectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return res.status(400).json({ error: "Invalid employee id." });
  }

  const db = await getDb();
  const users = db.collection("users");
  const user = await users.findOne({ _id: objectId, role: "employee" });
  if (!user) {
    return res.status(404).json({ error: "Employee not found." });
  }

  if (action === "approve" || action === "reject") {
    const status = action === "approve" ? "approved" : "rejected";
    await users.updateOne(
      { _id: objectId },
      { $set: { status, approvedAt: action === "approve" ? new Date() : null } }
    );
    if (action === "approve") {
      try {
        await sendApprovalEmail({ name: user.name, email: user.email, loginUrl: `${baseUrl(req)}/login` });
      } catch (err) {
        console.error("Failed to send approval email:", err);
      }
    }
  } else if (action === "update-profile") {
    const title = String(body.title ?? "").trim().slice(0, 150);
    const department = String(body.department ?? "").trim().slice(0, 150);
    await users.updateOne({ _id: objectId }, { $set: { title, department } });
  } else {
    return res.status(400).json({ error: "action must be 'approve', 'reject', or 'update-profile'." });
  }

  const updated = await users.findOne({ _id: objectId });
  return res.status(200).json({ ok: true, employee: toSafeUser(updated) });
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method === "GET") return list(req, res);
  if (req.method === "PATCH") return update(req, res);

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json({ error: "Method not allowed" });
}
