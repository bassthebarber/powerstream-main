// backend/models/Station.js
import mongoose from "mongoose";

// Video schema - embedded in Station
const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  url: { type: String, required: true },
  thumbnail: { type: String, default: "" },
  duration: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station" },
});

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, default: "" },
  logo: { type: String, default: "" },
  logoUrl: { type: String, default: "" },
  bannerUrl: { type: String, default: "" },
  
  // Persistence lock - prevents seeder from overwriting station data
  seedLock: {
    type: Boolean,
    default: true,
  },

  // Videos array - NEVER reset by seeders
  videos: [videoSchema],

  // Additional fields
  network: { type: String, default: "" },
  region: { type: String, default: "" },
  country: { type: String, default: "" },
  isPublic: { type: Boolean, default: true },
  isLive: { type: Boolean, default: false },
  streamUrl: { type: String, default: "" },
  theme: {
    primaryColor: { type: String, default: "#000000" },
    accentColor: { type: String, default: "#FFD700" },
    backgroundColor: { type: String, default: "#0a0a0a" }
  },

  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Station = mongoose.model("Station", stationSchema);

export default Station;
