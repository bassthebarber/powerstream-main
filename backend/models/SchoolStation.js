// backend/models/SchoolStation.js
// School Station model for PowerStream School Network

import mongoose from "mongoose";

const schoolStationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },              // "Crosby High School"
    slug: { type: String, required: true, unique: true },// "crosby-hs"
    district: { type: String },                          // "Crosby ISD"
    mascot: { type: String },                            // "Cougars"
    colors: { type: String },                            // "Red / White"
    location: { type: String },                          // "Crosby, TX"
    contactEmail: { type: String },
    contactPhone: { type: String },
    logoUrl: { type: String },
    bannerUrl: { type: String },                         // Stadium/school banner
    streamKey: { type: String, required: true },         // RTMP stream key
    rtmpUrl: { type: String },                           // RTMP endpoint
    hlsUrl: { type: String },                            // HLS playback URL
    description: { type: String },
    website: { type: String },
    athleticsUrl: { type: String },                      // Athletics page URL
    isActive: { type: Boolean, default: true },
    isLive: { type: Boolean, default: false },           // Currently streaming
    viewerCount: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    subscriberCount: { type: Number, default: 0 },
    // Sports offered
    sports: [{
      type: { type: String },  // "football", "basketball", "baseball", etc.
      season: { type: String }, // "fall", "winter", "spring"
      level: { type: String },  // "varsity", "jv", "freshman"
    }],
    // Conference/classification
    classification: { type: String },  // "6A", "5A", "4A", etc.
    conference: { type: String },      // District name
  },
  { timestamps: true }
);

// Indexes
schoolStationSchema.index({ slug: 1 });
schoolStationSchema.index({ isActive: 1, name: 1 });
schoolStationSchema.index({ district: 1 });
schoolStationSchema.index({ isLive: 1 });

const SchoolStation = mongoose.model("SchoolStation", schoolStationSchema);
export default SchoolStation;


