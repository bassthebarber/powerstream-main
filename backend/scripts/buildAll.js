// backend/scripts/buildAll.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 PowerStream Build-All Script Starting…");

async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI is missing from .env");
    }
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

async function runBuildTasks() {
  console.log("🛠 Running backend pre-build tasks...");
  // Add more backend setup scripts here (seeding, migrations, cache clearing, etc.)
}

async function boot() {
  await connectDB();
  await runBuildTasks();
  console.log("🎯 Build-All Tasks Completed — Launching Frontend & Backend...");
}

boot().catch((e) => {
  console.error("❌ Build script failed:", e.message);
  process.exit(1);
});
