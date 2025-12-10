// backend/models/SchoolEvent.js
// School Event model for non-athletic events (graduations, pep rallies, etc.)

import mongoose from "mongoose";

const schoolEventSchema = new mongoose.Schema(
  {
    schoolStationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchoolStation",
      required: true,
    },
    title: { type: String, required: true },          // "Graduation Ceremony 2025"
    type: { 
      type: String, 
      enum: ["graduation", "pep_rally", "play", "band", "choir", "assembly", "ceremony", "dance", "other"],
      default: "other" 
    },
    eventDate: { type: Date, required: true },
    eventTime: { type: String },                      // "10:00 AM"
    venue: { type: String },                          // "Main Auditorium"
    description: { type: String },
    // Media
    videoUrl: { type: String },                       // replay URL
    thumbnailUrl: { type: String },
    programUrl: { type: String },                     // Link to event program PDF
    // Status
    isLive: { type: Boolean, default: false },
    liveStartedAt: { type: Date },
    liveEndedAt: { type: Date },
    isReplayAvailable: { type: Boolean, default: false },
    duration: { type: Number, default: 0 },           // Duration in seconds
    viewCount: { type: Number, default: 0 },
    peakViewers: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes
schoolEventSchema.index({ schoolStationId: 1, eventDate: -1 });
schoolEventSchema.index({ type: 1, eventDate: -1 });
schoolEventSchema.index({ isLive: 1 });
schoolEventSchema.index({ isReplayAvailable: 1, eventDate: -1 });

const SchoolEvent = mongoose.model("SchoolEvent", schoolEventSchema);
export default SchoolEvent;


