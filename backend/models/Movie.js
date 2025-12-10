import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "General", index: true },
    genres: [{ type: String, index: true }],

    thumbnail: { type: String, required: true }, // poster image
    videoUrl: { type: String, required: true },  // full movie
    trailerUrl: { type: String },                // optional trailer

    featured: { type: Boolean, default: false, index: true },

    // PAY-PER-VIEW FLAGS (Phase 5 uses these)
    isPaid: { type: Boolean, default: false, index: true },
    price: { type: Number, default: 0 },

    runtimeMinutes: { type: Number },
    rating: { type: Number, default: 0 },

    views: { type: Number, default: 0, index: true },
    likes: { type: Number, default: 0 },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tags: [{ type: String }],

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Movie || mongoose.model("Movie", movieSchema);
