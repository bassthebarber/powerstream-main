import mongoose from "mongoose";

const writerSchema = new mongoose.Schema({
  name: String,
  role: { type: String, enum: ["composer", "lyricist", "producer", "artist"], default: "composer" },
  share: Number,
  ipiNumber: String,
});

const royaltyWorkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isrc: String,
    iswc: String,
    proAffiliations: [String],
    registrationStatus: {
      type: String,
      enum: ["unregistered", "pending", "submitted", "confirmed"],
      default: "unregistered",
    },
    writers: [writerSchema],
    bpm: Number,
    key: String,
    genre: String,
    durationSeconds: Number,
    masterUrl: String,
    previewUrl: String,
    totalStreams: { type: Number, default: 0 },
    totalWatchTimeSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const RoyaltyWork = mongoose.model("RoyaltyWork", royaltyWorkSchema);

export default RoyaltyWork;
