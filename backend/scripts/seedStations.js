// backend/scripts/seedStations.js
// Standalone script to seed all 5 TV stations

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Import Station model
import Station from "../models/Station.js";

const stations = [
  {
    name: "Southern Power Network",
    slug: "southern-power-network",
    logoUrl: "/logos/southernpowernetworklogo.png",
    description: "The flagship PowerStream TV station. Southern entertainment, music, and culture.",
    network: "Southern Power Syndicate",
    theme: { primaryColor: "#000000", accentColor: "#FFD700", backgroundColor: "#0a0a0a" },
    isActive: true,
    isPublic: true
  },
  {
    name: "No Limit East Houston TV",
    slug: "NoLimitEastHouston",
    logoUrl: "/logos/nolimiteasthoustonlogo.png",
    description: "Houston's premier music and entertainment channel.",
    network: "Southern Power Syndicate",
    theme: { primaryColor: "#000000", accentColor: "#FF4444", backgroundColor: "#0d0d0d" },
    isActive: true,
    isPublic: true
  },
  {
    name: "Texas Got Talent TV",
    slug: "texas-got-talent",
    logoUrl: "/logos/texasgottalentlogo.png",
    description: "Discover the next big star! Talent competitions and live performances.",
    network: "Southern Power Syndicate",
    theme: { primaryColor: "#000000", accentColor: "#FFD700", backgroundColor: "#0a0808" },
    isActive: true,
    isPublic: true
  },
  {
    name: "Civic Connect TV",
    slug: "civic-connect",
    logoUrl: "/logos/civicconnectlogo.png",
    description: "Community news, city events, and local government updates.",
    network: "Southern Power Syndicate",
    theme: { primaryColor: "#1a1a1a", accentColor: "#4A90D9", backgroundColor: "#0a0a0f" },
    isActive: true,
    isPublic: true
  },
  {
    name: "Worldwide TV",
    slug: "worldwide-tv",
    logoUrl: "/logos/worldwidetvlogo.png",
    description: "Global content from around the world. International music, film, and culture.",
    network: "Southern Power Syndicate",
    theme: { primaryColor: "#000000", accentColor: "#00BFFF", backgroundColor: "#050510" },
    isActive: true,
    isPublic: true
  }
];

(async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    console.log("🎬 Seeding 5 TV stations...\n");

    for (const s of stations) {
      const result = await Station.findOneAndUpdate(
        { slug: s.slug },
        { $set: s },
        { upsert: true, new: true }
      );
      console.log(`  ✅ ${s.name} (${s.slug})`);
    }

    console.log("\n🎬 All stations seeded successfully!");
    
    // List all stations
    const allStations = await Station.find().select('name slug logoUrl').lean();
    console.log("\n📺 Current stations in database:");
    allStations.forEach(st => {
      console.log(`   - ${st.name} [${st.slug}]`);
    });

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
})();
