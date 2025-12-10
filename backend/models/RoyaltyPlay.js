import mongoose from "mongoose";

const royaltyPlaySchema = new mongoose.Schema(
  {
    workId: { type: mongoose.Schema.Types.ObjectId, ref: "RoyaltyWork", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    source: {
      type: String,
      enum: ["studio", "feed", "tv_station", "film", "external"],
      default: "studio",
    },
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station" },
    filmId: { type: mongoose.Schema.Types.ObjectId, ref: "Film" },
    startedAt: { type: Date, default: Date.now },
    durationSeconds: Number,
    fullPlay: Boolean,
    territory: String,
  },
  { timestamps: true }
);

const RoyaltyPlay = mongoose.model("RoyaltyPlay", royaltyPlaySchema);

export default RoyaltyPlay;
