import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("No MONGO_URI set.");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

try {
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");
} catch (e) {
  console.error("❌ Ping failed:", e.message);
} finally {
  await client.close();
}
