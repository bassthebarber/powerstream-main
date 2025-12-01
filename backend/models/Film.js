// backend/models/Film.js
import mongoose from "mongoose";

const EpisodeSchema = new mongoose.Schema(
  {
    episodeNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String, required: true },
    hlsUrl: { type: String },
    duration: { type: Number }, // seconds
  },
  { _id: false, timestamps: true }
);

const SeasonSchema = new mongoose.Schema(
  {
    seasonNumber: { type: Number, required: true },
    title: { type: String },
    episodes: { type: [EpisodeSchema], default: [] },
  },
  { _id: false, timestamps: true }
);

const FilmSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    description: { type: String },
    posterUrl: { type: String },
    bannerUrl: { type: String },
    category: { type: String, index: true },
    genre: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    duration: { type: Number }, // seconds
    videoUrl: { type: String },
    hlsUrl: { type: String },
    trailerUrl: { type: String },
    ownerId: { type: String, required: true, index: true },
    type: { type: String, enum: ["film", "series"], default: "film" },
    seasons: { type: [SeasonSchema], default: [] }, // for series
    monetization: {
      type: {
        type: String,
        enum: ["free", "rental", "purchase", "subscription"],
        default: "free",
      },
      priceCoins: { type: Number, default: 0 },
      priceUSD: { type: Number, default: 0 },
    },
    isPublished: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    stationSlug: { type: String, index: true }, // Link to station (e.g., "texas-got-talent")
    network: { type: String, index: true }, // e.g., "Southern Power Syndicate"
  },
  { timestamps: true }
);

FilmSchema.index({ createdAt: -1 });
FilmSchema.index({ category: 1, createdAt: -1 });
FilmSchema.index({ ownerId: 1, createdAt: -1 });

export default mongoose.models.Film || mongoose.model("Film", FilmSchema);

