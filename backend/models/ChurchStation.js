// backend/models/ChurchStation.js
// Church Station model for PowerStream Church Network

import mongoose from "mongoose";

const churchStationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },              // e.g., "Antioch Baptist Church"
    slug: { type: String, required: true, unique: true },// e.g., "antioch-baptist"
    location: { type: String },                          // City, State
    pastorName: { type: String },                        // Lead pastor
    contactEmail: { type: String },
    contactPhone: { type: String },
    logoUrl: { type: String },                           // Optional logo
    bannerUrl: { type: String },                         // Optional banner image
    streamKey: { type: String, required: true },         // RTMP stream key
    rtmpUrl: { type: String },                           // RTMP endpoint
    hlsUrl: { type: String },                            // HLS playback URL
    description: { type: String },                       // About the church
    denomination: { type: String },                      // e.g., "Baptist", "Methodist"
    website: { type: String },                           // Church website
    address: { type: String },                           // Physical address
    isActive: { type: Boolean, default: true },
    isLive: { type: Boolean, default: false },           // Currently streaming
    viewerCount: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    subscriberCount: { type: Number, default: 0 },
    // Service schedule
    regularServices: [{
      day: { type: String },    // "Sunday", "Wednesday"
      time: { type: String },   // "10:00 AM"
      name: { type: String },   // "Morning Worship"
    }],
  },
  { timestamps: true }
);

// Indexes
churchStationSchema.index({ slug: 1 });
churchStationSchema.index({ isActive: 1, name: 1 });
churchStationSchema.index({ isLive: 1 });

const ChurchStation = mongoose.model("ChurchStation", churchStationSchema);
export default ChurchStation;


