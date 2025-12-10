// backend/scripts/mongoPing.mjs
import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("MONGO_URI missing. Put it in backend/.env");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged your deployment. Connected to MongoDB!");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}
run();
