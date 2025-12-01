// backend/seeders/filmSeeder.js
import Film from "../models/Film.js";

export async function seedFilms() {
  try {
    const films = [
      {
        title: "No Limit Chronicles: The Master P Story",
        description: "A documentary exploring the rise of Master P and the No Limit Records empire, from the streets of New Orleans to global hip-hop dominance.",
        posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400",
        bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200",
        category: "Documentary",
        genre: ["Music", "Biography", "Hip-Hop"],
        tags: ["No Limit", "Master P", "Hip-Hop", "Documentary"],
        duration: 5400, // 90 minutes
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        hlsUrl: "",
        trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        ownerId: "system",
        type: "film",
        monetization: {
          type: "rental",
          priceCoins: 500,
          priceUSD: 4.99,
        },
        isPublished: true,
        stationSlug: "no-limit-east-houston",
        network: "Southern Power Syndicate",
        views: 0,
      },
      {
        title: "East Houston: The Sound of the Streets",
        description: "An independent film showcasing the vibrant music scene and culture of East Houston, featuring local artists and their stories.",
        posterUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
        bannerUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200",
        category: "Independent Film",
        genre: ["Music", "Documentary", "Culture"],
        tags: ["Houston", "Music", "Culture", "Independent"],
        duration: 3600, // 60 minutes
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        hlsUrl: "",
        ownerId: "system",
        type: "film",
        monetization: {
          type: "free",
          priceCoins: 0,
          priceUSD: 0,
        },
        isPublished: true,
        stationSlug: "no-limit-east-houston",
        network: "Southern Power Syndicate",
        views: 0,
      },
      {
        title: "Texas Got Talent: Season 1 Highlights",
        description: "The best moments from the first season of Texas Got Talent, featuring incredible performances and emotional stories.",
        posterUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbaf53?w=400",
        bannerUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbaf53?w=1200",
        category: "Reality TV",
        genre: ["Talent Show", "Music", "Entertainment"],
        tags: ["Talent Show", "Texas", "Music", "Competition"],
        duration: 2700, // 45 minutes
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        hlsUrl: "",
        ownerId: "system",
        type: "film",
        monetization: {
          type: "free",
          priceCoins: 0,
          priceUSD: 0,
        },
        isPublished: true,
        stationSlug: "texas-got-talent",
        network: "Southern Power Syndicate",
        views: 0,
      },
      {
        title: "Civic Connect: Community Voices",
        description: "A series exploring local community issues, civic engagement, and the voices shaping Houston's future.",
        posterUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400",
        bannerUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200",
        category: "News & Community",
        genre: ["News", "Documentary", "Community"],
        tags: ["Community", "Civic", "Houston", "News"],
        duration: 1800, // 30 minutes
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        hlsUrl: "",
        ownerId: "system",
        type: "film",
        monetization: {
          type: "free",
          priceCoins: 0,
          priceUSD: 0,
        },
        isPublished: true,
        stationSlug: "civic-connect",
        network: "Southern Power Syndicate",
        views: 0,
      },
      {
        title: "Southern Power: The Network Story",
        description: "The origin story of Southern Power Syndicate, from a local radio station to a multimedia network.",
        posterUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
        bannerUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200",
        category: "Documentary",
        genre: ["Documentary", "Business", "Media"],
        tags: ["Southern Power", "Network", "Media", "Documentary"],
        duration: 3600,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        hlsUrl: "",
        ownerId: "system",
        type: "film",
        monetization: {
          type: "free",
          priceCoins: 0,
          priceUSD: 0,
        },
        isPublished: true,
        stationSlug: "southern-power-network",
        network: "Southern Power Syndicate",
        views: 0,
      },
    ];

    // Only create if doesn't exist (by title)
    for (const film of films) {
      const existing = await Film.findOne({ title: film.title });
      if (!existing) {
        await Film.create(film);
      }
    }

    console.log("✅ Films seeded successfully");
    return { ok: true, message: "Films seeded", count: films.length };
  } catch (err) {
    console.error("❌ Error seeding films:", err);
    throw err;
  }
}


