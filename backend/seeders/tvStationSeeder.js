// backend/seeders/tvStationSeeder.js
import Station from "../models/Station.js";

const DEFAULT_STATIONS = [
  {
    name: "Southern Power Network",
    slug: "southern-power-network",
    description:
      "Houston's premier network for Southern culture, film, and live broadcasts.",
    logoUrl: "/logos/southernpowernetworklogo.png",
  },
  {
    name: "No Limit East Houston TV",
    slug: "nolimit-east-houston",
    description:
      "Exclusive No Limit East Houston content, games, events, and shows.",
    logoUrl: "/logos/nolimiteasthoustonlogo.png",
  },
  {
    name: "Texas Got Talent TV",
    slug: "texas-got-talent",
    description:
      "Talent shows, live competitions, and fan voting across Texas.",
    logoUrl: "/logos/texasgottalentlogo.png",
  },
  {
    name: "Civic Connect TV",
    slug: "civic-connect",
    description:
      "Community issues, city council coverage, and civic education.",
    logoUrl: "/logos/civicconnectlogo.png",
  },
  {
    name: "Worldwide TV",
    slug: "worldwide-tv",
    description:
      "Global films, documentaries, and international events.",
    logoUrl: "/logos/worldwidetvlogo.png",
  },
];

export async function seedTVStations() {
  console.log("🌍 [TV SEED] Seeding TV Stations with lock…");

  for (const station of DEFAULT_STATIONS) {
    const existing = await Station.findOne({ slug: station.slug });

    if (existing && existing.seedLock) {
      console.log(`   🔒 Locked – keeping existing station: ${station.slug}`);
      continue;
    }

    if (existing && !existing.seedLock) {
      console.log(`   ✏️ Updating existing station: ${station.slug}`);
      existing.name = station.name;
      existing.description = station.description;
      existing.logoUrl = station.logoUrl;
      existing.seedLock = true;
      await existing.save();
      continue;
    }

    console.log(`   🆕 Creating station: ${station.slug}`);
    await Station.create({
      ...station,
      seedLock: true,
    });
  }

  console.log("✅ [TV SEED] Done – nothing was deleted.");
}

export default seedTVStations;
