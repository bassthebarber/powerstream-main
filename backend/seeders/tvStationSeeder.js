// /backend/utils/tvStationSeeder.js

import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../configs/db.js";
import Station from "../models/Stationmodel.js"; // Make sure this model exists

dotenv.config();

const seedStations = async () => {
  try {
    await connectDB();

    // Optional: Clear existing data
    await Station.deleteMany();

    // Add demo TV station data
    const stations = [
      {
        name: "Southern Power Network",
        slug: "southern-power",
        description: "Main hub for PowerStream TV broadcasts.",
        logo: "https://res.cloudinary.com/yourcloud/image/upload/v123456/southern-logo.png",
        isLive: true,
      },
      {
        name: "Texas Got Talent",
        slug: "texas-got-talent",
        description: "Discover local talent in Texas through live performances.",
        logo: "https://res.cloudinary.com/yourcloud/image/upload/v123456/texasgottalentlogo.PNG",
        isLive: false,
      },
      {
        name: "Civic Connect",
        slug: "civic-connect",
        description: "Civic education and community discussions.",
        logo: "https://res.cloudinary.com/yourcloud/image/upload/v123456/civicconnectlogo.PNG",
        isLive: false,
      },
      {
        name: "No Limit East Houston",
        slug: "no-limit-east-houston",
        description: "Independent label streaming and artist features.",
        logo: "https://res.cloudinary.com/yourcloud/image/upload/v123456/nolimiteasthoustonlogo.PNG",
        isLive: false,
      },
    ];

    await Station.insertMany(stations);
    console.log("✅ TV stations seeded successfully.");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedStations();
