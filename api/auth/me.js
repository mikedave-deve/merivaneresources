import { ObjectId } from "mongodb";
import { getDb } from "../../lib/mongodb.js";
import { getSessionFromRequest, clearSessionCookie, toSafeUser } from "../../lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

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
