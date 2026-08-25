import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "merivane";

// Reuse the connection across warm serverless invocations instead of opening
// a new one on every request — Vercel functions can stay warm between calls.
let clientPromise = globalThis._merivaneMongoClientPromise;

export async function getDb() {
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }
  if (!clientPromise) {
    const client = new MongoClient(uri, { maxPoolSize: 5 });
    clientPromise = client.connect();
    globalThis._merivaneMongoClientPromise = clientPromise;
  }
  const client = await clientPromise;
  return client.db(dbName);
}
