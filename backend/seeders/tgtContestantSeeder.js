// backend/seeders/tgtContestantSeeder.js
import TgtContestant from "../models/TgtContestant.js";

export async function seedTGTContestants() {
  try {
    const contestants = [
      {
        stationSlug: "texas-got-talent",
        name: "Sarah Martinez",
        photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
        bio: "Soulful R&B singer from Houston. Known for powerful vocals and emotional performances.",
        totalVotes: 0,
        isActive: true,
      },
      {
        stationSlug: "texas-got-talent",
        name: "Marcus Johnson",
        photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        bio: "Hip-hop artist and producer. Bringing East Houston vibes to the stage.",
        totalVotes: 0,
        isActive: true,
      },
      {
        stationSlug: "texas-got-talent",
        name: "Jasmine Williams",
        photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
        bio: "Gospel singer with a voice that moves the soul. Performing since age 12.",
        totalVotes: 0,
        isActive: true,
      },
      {
        stationSlug: "texas-got-talent",
        name: "Carlos Rodriguez",
        photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
        bio: "Latin fusion artist blending traditional sounds with modern beats.",
        totalVotes: 0,
        isActive: true,
      },
      {
        stationSlug: "texas-got-talent",
        name: "Aaliyah Brown",
        photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
        bio: "Rapper and spoken word artist. Powerful lyrics about community and resilience.",
        totalVotes: 0,
        isActive: true,
      },
      {
        stationSlug: "texas-got-talent",
        name: "David Thompson",
        photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        bio: "Jazz pianist and composer. Smooth sounds with Texas flair.",
        totalVotes: 0,
        isActive: true,
      },
    ];

    // Only create if doesn't exist (by name + stationSlug)
    for (const contestant of contestants) {
      const existing = await TgtContestant.findOne({
        stationSlug: contestant.stationSlug,
        name: contestant.name,
      });
      if (!existing) {
        await TgtContestant.create(contestant);
      }
    }

    console.log("✅ TGT Contestants seeded successfully");
    return { ok: true, message: "Contestants seeded", count: contestants.length };
  } catch (err) {
    console.error("❌ Error seeding TGT contestants:", err);
    throw err;
  }
}







