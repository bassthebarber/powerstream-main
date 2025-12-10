// backend/models/NoLimitForeverFilm.js
// No Limit Forever TV - Film/Documentary/Series Model

import mongoose from "mongoose";

const noLimitForeverFilmSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    // Station tag - ensures scope isolation
    stationSlug: { type: String, default: "no-limit-forever-tv", index: true },

    // Content category
    category: {
      type: String,
      enum: ["movie", "documentary", "series", "special", "music_video", "concert", "interview"],
      default: "movie",
      index: true,
    },

    // Media URLs (Cloudinary, S3, HLS, etc.)
    posterUrl: { type: String, default: "" },
    backdropUrl: { type: String, default: "" },
    trailerUrl: { type: String, default: "" },
    filmUrl: { type: String, required: true },

    // Video metadata
    runtimeMinutes: { type: Number, default: 0 },
    releaseDate: { type: Date },
    year: { type: Number },

    // For series
    season: { type: Number },
    episode: { type: Number },
    episodeTitle: { type: String },

    // Analytics
    views: { type: Number, default: 0 },
    rating: { type: Number, default: 0 }, // average rating 0–5
    ratingCount: { type: Number, default: 0 },
    
    // Engagement
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },

    // Owner/Creator
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Cast and crew
    director: { type: String },
    cast: [{ type: String }],
    producer: { type: String },

    // Categorization
    tags: [{ type: String }],
    genres: [{ type: String }],

    // Status
    status: {
      type: String,
      enum: ["draft", "published", "archived", "featured"],
      default: "published",
    },
    isFeatured: { type: Boolean, default: false },

    // Monetization
    isPremium: { type: Boolean, default: false },
    premiumPrice: { type: Number, default: 0 },

    // Quality options
    qualities: [{
      label: { type: String }, // "1080p", "720p", "480p"
      url: { type: String },
    }],

    // Subtitles/Captions
    subtitles: [{
      language: { type: String },
      url: { type: String },
    }],
  },
  { timestamps: true }
);

// Indexes
noLimitForeverFilmSchema.index({ stationSlug: 1, category: 1 });
noLimitForeverFilmSchema.index({ stationSlug: 1, createdAt: -1 });
noLimitForeverFilmSchema.index({ stationSlug: 1, views: -1 });
noLimitForeverFilmSchema.index({ stationSlug: 1, isFeatured: 1 });
noLimitForeverFilmSchema.index({ title: "text", description: "text" });

// Virtual for formatted runtime
noLimitForeverFilmSchema.virtual("formattedRuntime").get(function() {
  if (!this.runtimeMinutes) return "";
  const hours = Math.floor(this.runtimeMinutes / 60);
  const mins = this.runtimeMinutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
});

// Method to increment views
noLimitForeverFilmSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
  return this.views;
};

// Method to add rating
noLimitForeverFilmSchema.methods.addRating = async function(newRating) {
  const totalRating = this.rating * this.ratingCount + newRating;
  this.ratingCount += 1;
  this.rating = totalRating / this.ratingCount;
  await this.save();
  return { rating: this.rating, ratingCount: this.ratingCount };
};

const NoLimitForeverFilm = mongoose.model("NoLimitForeverFilm", noLimitForeverFilmSchema);

export default NoLimitForeverFilm;

