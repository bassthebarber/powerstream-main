// /backend/recordingStudio/database.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const uri = process.env.STUDIO_MONGO_URI;
if (!uri) {
  console.error("❌ STUDIO_MONGO_URI missing");
  process.exit(1);
}

mongoose.set("strictQuery", true);

const opts = {
  // robust socket settings for Atlas
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 60000,
  heartbeatFrequencyMS: 10000,
  // keepalive to avoid idle disconnects
  connectTimeoutMS: 15000,
  family: 4,
};

export default async function connectStudioDB() {
  try {
    await mongoose.connect(uri, opts);
    const host = mongoose.connection.host;
    const db = mongoose.connection.name;
    console.log(`🎙️  Connected to Recording Studio MongoDB at: ${host}/${db}`);
  } catch (err) {
    console.error("❌ MongoDB connect error:", err.message);
    // Try once more after a short delay
    setTimeout(() => mongoose.connect(uri, opts).catch(() => {}), 5000);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected — will attempt to reconnect...");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("🔁 MongoDB reconnected successfully (Studio)");
  });
}
