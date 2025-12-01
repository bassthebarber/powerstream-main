// testMongo.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGO_URI;

async function main() {
  try {
    console.log("Connecting to Mongo with:", uri?.replace(/:([^:@]+)@/, ":****@") || "NO URI SET");
    await mongoose.connect(uri);
    console.log("✅ Connected!");
    await mongoose.disconnect();
    console.log("Disconnected cleanly.");
  } catch (err) {
    console.error("❌ Failed:", err.message);
    if (err.code) console.error("   Code:", err.code);
  }
}

main();
