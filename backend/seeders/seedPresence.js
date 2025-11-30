// backend/seeders/seedPresence.js
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

  const users = await User.find({}).select("_id").lean();
  for (const u of users) {
    await UserPresence.updateOne(
      { user: u._id },
      { $setOnInsert: { status: "offline", lastSeenAt: new Date(0) } },
      { upsert: true }
    );
  }
  console.log(`🟢 Seeded presence for ${users.length} user(s)`);

  await mongoose.disconnect();
  console.log("🏁 Done");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
