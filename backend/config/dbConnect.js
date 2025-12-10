// dbConnect.js
import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToMongo() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB!");
    return client;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}

export default connectToMongo;
