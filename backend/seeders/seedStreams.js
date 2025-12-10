// backend/seeders/seedStreams.js
import "dotenv/config.js";
import mongoose from "mongoose";
import Station from "../models/StationModel.js";
import Stream from "../models/StreamModel.js";

async function connect() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB || undefined });
  console.log("✅ Connected");
}

async function run() {
  await connect();

  const station = await Station.findOne({}).lean();
  if (!station) {
    console.log("⚠️ No stations found. Seed stations first (seedStations.js).");
    await mongoose.disconnect();
    process.exit(0);
  }

  const presets = [
    { station: station._id, title: "Morning Show", ingestUrl: "", playbackUrl: "", streamKey: "demo-morning" },
    { station: station._id, title: "Evening Live", ingestUrl: "", playbackUrl: "", streamKey: "demo-evening" },
  ];

  for (const p of presets) {
    const existing = await Stream.findOne({ station: p.station, title: p.title });
    if (existing) {
      await Stream.updateOne({ _id: existing._id }, { $set: p });
      console.log(`🔁 Updated stream: ${p.title}`);
    } else {
      await Stream.create(p);
      console.log(`➕ Created stream: ${p.title}`);
    }
  }

  await mongoose.disconnect();
  console.log("🏁 Done");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
