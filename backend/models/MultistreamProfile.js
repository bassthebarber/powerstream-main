// backend/models/MultistreamProfile.js
// Model for multistream presets/profiles
import mongoose from "mongoose";

const MultistreamProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    endpointIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RTMPEndpoint",
      },
    ],
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes
MultistreamProfileSchema.index({ userId: 1, stationId: 1 });
MultistreamProfileSchema.index({ userId: 1, isDefault: 1 });

export default mongoose.model("MultistreamProfile", MultistreamProfileSchema);



