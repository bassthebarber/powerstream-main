// backend/seeders/seedStations.js
import "dotenv/config.js";
import mongoose from "mongoose";
import Station from "../models/StationModel.js";
import User from "../models/UserModel.js";

async function connect() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB || undefined });
  console.log("✅ Connected");
}

async function findOwner() {
  const email = process.env.OWNER_EMAIL;
  if (email) {
    const u = await User.findOne({ email }).lean();
    if (u) return u._id;
  }
  const any = await User.findOne({}).lean();
  return any?._id || null;
}

async function run() {
  await connect();
  const ownerId = await findOwner();

  const presets = [
    { name: "PowerStream Radio", description: "24/7 music + talk", logoUrl: "", owner: ownerId },
    { name: "PS News Live", description: "News & Civic coverage", logoUrl: "", owner: ownerId },
    { name: "Sports Hub", description: "Live sports chat & streams", logoUrl: "", owner: ownerId },
  ];

  for (const p of presets) {
    const existing = await Station.findOne({ name: p.name });
    if (existing) {
      await Station.updateOne({ _id: existing._id }, { $set: p });
      console.log(`🔁 Updated station: ${p.name}`);
    } else {
      await Station.create(p);
      console.log(`➕ Created station: ${p.name}`);
    }
  }

  await mongoose.disconnect();
  console.log("🏁 Done");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
