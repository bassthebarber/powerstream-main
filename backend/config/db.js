// backend/config/db.js
// TODO: Config normalized to env.js for consistency.
// DEPRECATED: This file is being replaced by /src/config/db.mongo.js
// It remains for backward compatibility with existing imports.
import mongoose from "mongoose";
import env, { buildMongoUri } from "../src/config/env.js";

const MONGO_URI = buildMongoUri();

// Retry configuration
const MAX_RETRIES = 10;
const RETRY_INTERVAL = 5000; // 5 seconds

let retryCount = 0;

const connectDB = async () => {
  if (!MONGO_URI) {
    console.error("❌ No MongoDB URI available! Set MONGO_URI or MONGO_USER/MONGO_PASS in .env");
    if (env.isProd()) {
      process.exit(1);
    }
    console.warn("⚠️ Continuing without MongoDB in development mode...");
    return;
  }

  mongoose.set("strictQuery", true);

  try {
    console.log("🟡 MongoDB: Connecting...");
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB connected");
    retryCount = 0; // Reset retry count on successful connection
  } catch (err) {
    retryCount++;
    console.error(`❌ MongoDB connection failed (attempt ${retryCount}/${MAX_RETRIES}):`, err.message);

    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      return connectDB(); // Recursive retry
    } else {
      console.error("❌ Max retries reached. Exiting...");
      process.exit(1);
    }
  }
};

// Handle disconnection - auto reconnect
mongoose.connection.on("disconnected", () => {
  console.log("🔄 MongoDB disconnected. Attempting reconnection...");
  retryCount = 0; // Reset for reconnection attempts
  connectDB();
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err.message);
});

mongoose.connection.on("connected", () => {
  console.log("🟢 MongoDB connection established");
});

mongoose.connection.on("reconnected", () => {
  console.log("🟢 MongoDB reconnected");
});

export default connectDB;
