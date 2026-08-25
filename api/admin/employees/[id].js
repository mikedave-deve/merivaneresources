import { ObjectId } from "mongodb";
import { getDb } from "../../../lib/mongodb.js";
import { requireAdmin, toSafeUser } from "../../../lib/auth.js";
import { sendApprovalEmail } from "../../../lib/email.js";

function baseUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || "http";
  return `${proto}://${req.headers.host}`;
}

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!requireAdmin(req, res)) return;

  const { id } = req.query;
  const action = req.body?.action;
  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({ error: "action must be 'approve' or 'reject'." });
  }

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

  const updated = await users.findOne({ _id: objectId });
  return res.status(200).json({ ok: true, employee: toSafeUser(updated) });
}
