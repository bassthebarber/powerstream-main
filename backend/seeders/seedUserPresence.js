// backend/seeders/seedUserPresence.js
import "dotenv/config.js";
import mongoose from "mongoose";
import User from "../models/UserModel.js";
import UserPresence from "../models/UserPresenceModel.js";

async function connect() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB || undefined });
  console.log("✅ Connected");
}

async function run() {
  await connect();

  const users = await User.find({}).limit(5).lean();
  if (!users.length) {
    console.log("⚠️ No users found. Create users first.");
    await mongoose.disconnect();
    process.exit(0);
  }

  for (const u of users) {
    const doc = await UserPresence.findOneAndUpdate(
      { user: u._id },
      { $set: { status: "online", lastSeenAt: new Date(), device: "seed", ip: "127.0.0.1" } },
      { upsert: true, new: true }
    );
    console.log(`👤 Presence set: ${u._id} → ${doc.status}`);
  }

  await mongoose.disconnect();
  console.log("🏁 Done");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
