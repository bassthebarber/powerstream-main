// backend/seed/seedAll.js
import mongoose from "mongoose";
import dotenv from "dotenv";

// --- Your models (make sure these files exist) ---
import FeedPost from "../models/FeedPostModel.js";
import GramPhoto from "../models/GramPhotoModel.js";
import ReelVideo from "../models/ReelVideoModel.js";

dotenv.config();

async function seedFeed() {
  await FeedPost.deleteMany();
  const rows = [
    {
      authorName: "Marcus Bass",
      content: "Welcome to PowerStream Feed! 🔥",
      image: "/images/sample1.jpg",
    },
    {
      authorName: "Jane Doe",
      content: "We’re live — testing comments & likes.",
      image: "/images/sample2.jpg",
    },
    {
      authorName: "John Smith",
      content: "AI Copilot build mode is awesome.",
      image: "/images/sample3.jpg",
    },
  ];
  await FeedPost.insertMany(rows);
  return rows.length;
}

async function seedGram() {
  await GramPhoto.deleteMany();
  const rows = [
    { imageUrl: "/images/gram1.jpg", caption: "Sunset vibes" },
    { imageUrl: "/images/gram2.jpg", caption: "PowerStream style" },
    { imageUrl: "/images/gram3.jpg", caption: "Dream big" },
    { imageUrl: "/images/gram4.jpg", caption: "Gold & black aesthetic" },
    { imageUrl: "/images/gram5.jpg", caption: "Studio day" },
    { imageUrl: "/images/gram6.jpg", caption: "SPS network!" },
  ];
  await GramPhoto.insertMany(rows);
  return rows.length;
}

async function seedReels() {
  await ReelVideo.deleteMany();
  const rows = [
    { videoUrl: "/videos/reel1.mp4", caption: "Power moves" },
    { videoUrl: "/videos/reel2.mp4", caption: "Behind the scenes" },
    { videoUrl: "/videos/reel3.mp4", caption: "AI in action" },
  ];
  await ReelVideo.insertMany(rows);
  return rows.length;
}

(async function run() {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/powerstream";
    console.log("🟡 MongoDB: connecting…", uri);
    await mongoose.connect(uri);
    console.log("🟢 MongoDB: connected");

    const feedN = await seedFeed();
    const gramN = await seedGram();
    const reelN = await seedReels();

    console.log(`✅ Seed complete → Feed:${feedN}  Gram:${gramN}  Reels:${reelN}`);
    process.exit(0);
  } catch (err) {
    console.error("💥 Seed failed:", err);
    process.exit(1);
  }
})();
