// backend/models/TgtContestant.js
import mongoose from "mongoose";

const TgtContestantSchema = new mongoose.Schema(
  {
    stationSlug: { type: String, required: true, index: true, default: "texas-got-talent" },
    name: { type: String, required: true },
    photoUrl: { type: String },
    videoId: { type: String }, // Reference to performance video
    filmId: { type: mongoose.Schema.Types.ObjectId, ref: "Film" }, // Reference to Film if using PowerStream TV
    totalVotes: { type: Number, default: 0, index: true },
    bio: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TgtContestantSchema.index({ stationSlug: 1, totalVotes: -1 });
TgtContestantSchema.index({ stationSlug: 1, isActive: 1 });

export default mongoose.models.TgtContestant || mongoose.model("TgtContestant", TgtContestantSchema);




