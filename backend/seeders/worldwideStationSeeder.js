// backend/seeders/worldwideStationSeeder.js
import Station from "../models/Station.js";
import mongoose from "mongoose";

export async function seedWorldwideStations() {
  try {
    const stations = [
      {
        owner: new mongoose.Types.ObjectId(),
        name: "Africa Live Network",
        slug: "africa-live-network",
        logoUrl: "/logos/worldwidetvlogo.png",
        description: "Live broadcasts from across the African continent - music, news, and culture.",
        category: "International",
        network: "Worldwide TV",
        region: "Africa",
        country: "Multiple",
        isPublic: true,
        isLive: false,
        status: "ready",
      },
      {
        owner: new mongoose.Types.ObjectId(),
        name: "Caribbean Vibes TV",
        slug: "caribbean-vibes-tv",
        logoUrl: "/logos/worldwidetvlogo.png",
        description: "Reggae, soca, and Caribbean culture from the islands.",
        category: "Music & Culture",
        network: "Worldwide TV",
        region: "Caribbean",
        country: "Multiple",
        isPublic: true,
        isLive: false,
        status: "ready",
      },
      {
        owner: new mongoose.Types.ObjectId(),
        name: "UK & Europe Network",
        slug: "uk-europe-network",
        logoUrl: "/logos/worldwidetvlogo.png",
        description: "European content including UK grime, French hip-hop, and continental shows.",
        category: "International",
        network: "Worldwide TV",
        region: "Europe",
        country: "Multiple",
        isPublic: true,
        isLive: false,
        status: "ready",
      },
      {
        owner: new mongoose.Types.ObjectId(),
        name: "Houston Local News",
        slug: "houston-local-news",
        logoUrl: "/logos/worldwidetvlogo.png",
        description: "Local news, events, and community programming from Houston, Texas.",
        category: "News & Local",
        network: "Worldwide TV",
        region: "US",
        country: "US",
        isPublic: true,
        isLive: false,
        status: "ready",
      },
      {
        owner: new mongoose.Types.ObjectId(),
        name: "Latin Power Network",
        slug: "latin-power-network",
        logoUrl: "/logos/worldwidetvlogo.png",
        description: "Latin music, telenovelas, and Spanish-language content.",
        category: "Music & Entertainment",
        network: "Worldwide TV",
        region: "Latin America",
        country: "Multiple",
        isPublic: true,
        isLive: false,
        status: "ready",
      },
      {
        owner: new mongoose.Types.ObjectId(),
        name: "Gospel Network Global",
        slug: "gospel-network-global",
        logoUrl: "/logos/worldwidetvlogo.png",
        description: "Gospel music, sermons, and faith-based programming from around the world.",
        category: "Gospel & Faith",
        network: "Worldwide TV",
        region: "Global",
        country: "Multiple",
        isPublic: true,
        isLive: false,
        status: "ready",
      },
    ];

    // Only create if doesn't exist (by slug)
    for (const station of stations) {
      const existing = await Station.findOne({ slug: station.slug });
      if (!existing) {
        await Station.create(station);
      }
    }

    console.log("✅ Worldwide stations seeded successfully");
    return { ok: true, message: "Worldwide stations seeded", count: stations.length };
  } catch (err) {
    console.error("❌ Error seeding worldwide stations:", err);
    throw err;
  }
}




