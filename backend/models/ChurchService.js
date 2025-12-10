// backend/models/ChurchService.js
// Church Service model for tracking live and recorded services

import mongoose from "mongoose";

const churchServiceSchema = new mongoose.Schema(
  {
    churchStationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChurchStation",
      required: true,
    },
    title: { type: String, required: true },    // "Sunday Morning Service"
    description: { type: String },
    serviceDate: { type: Date, required: true },// date + time of service
    serviceType: { 
      type: String, 
      enum: ["sunday", "wednesday", "special", "revival", "funeral", "wedding", "other"],
      default: "sunday"
    },
    isLive: { type: Boolean, default: false },  // stream is currently live
    liveStartedAt: { type: Date },              // when stream started
    liveEndedAt: { type: Date },                // when stream ended
    isReplayAvailable: { type: Boolean, default: false },
    videoUrl: { type: String },                 // VOD / replay URL
    thumbnailUrl: { type: String },             // Optional poster
    duration: { type: Number, default: 0 },     // Duration in seconds
    viewCount: { type: Number, default: 0 },
    peakViewers: { type: Number, default: 0 },
    // Scripture/sermon info
    scripture: { type: String },                // "John 3:16"
    sermonTitle: { type: String },
    speaker: { type: String },                  // If different from pastor
  },
  { timestamps: true }
);

// Indexes
churchServiceSchema.index({ churchStationId: 1, serviceDate: -1 });
churchServiceSchema.index({ isLive: 1 });
churchServiceSchema.index({ isReplayAvailable: 1, serviceDate: -1 });

const ChurchService = mongoose.model("ChurchService", churchServiceSchema);
export default ChurchService;


