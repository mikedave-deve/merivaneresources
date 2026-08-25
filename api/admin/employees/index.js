import { getDb } from "../../../lib/mongodb.js";
import { requireAdmin, toSafeUser } from "../../../lib/auth.js";

const VALID_STATUSES = ["pending", "approved", "rejected", "all"];

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!requireAdmin(req, res)) return;

  const status = VALID_STATUSES.includes(req.query.status) ? req.query.status : "pending";
  const filter = { role: "employee" };
  if (status !== "all") filter.status = status;

  const db = await getDb();
  const employees = await db
    .collection("users")
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  return res.status(200).json({ employees: employees.map(toSafeUser) });
}
