// backend/models/Show.js
import mongoose from "mongoose";

const ShowSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    description: { type: String, default: "" },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
      index: true,
    },
    thumbnailUrl: { type: String },
    category: { type: String },
    isLive: { type: Boolean, default: false },
    isRecurring: { type: Boolean, default: false },
    recurrencePattern: { type: String }, // e.g., "daily", "weekly"
  },
  { timestamps: true }
);

// Index for efficient querying by station and time range
ShowSchema.index({ stationId: 1, startTime: 1 });
ShowSchema.index({ startTime: 1, endTime: 1 });

export default mongoose.models.Show || mongoose.model("Show", ShowSchema);




