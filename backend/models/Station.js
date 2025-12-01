import mongoose from "mongoose";

const StationSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true, index: true },
    slug: { type: String, unique: true, sparse: true, index: true },
    logoUrl: { type: String },
    description: { type: String },
    category: { type: String, index: true },
    layout: { type: String, default: "powerfeed:auto" },
    streamKey: String, // optional local key
    ingest: {
      rtmpUrl: String,
      streamKey: String,     // Livepeer streamKey
      playbackId: String
    },
    playbackUrl: String,      // https://livepeercdn.com/hls/<playbackId>/index.m3u8
    liveStreamUrl: { type: String }, // HLS URL for live stream
    recordedPlaylistId: { type: String }, // reference to playlist of recorded content
    isLive: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true, index: true },
    playlist: { type: Array, default: [] },
    status: { type: String, default: "ready" },
    tags: { type: Array, default: [] },
    // Network/region fields
    network: { type: String, index: true }, // e.g., "Southern Power Syndicate"
    region: { type: String, index: true }, // e.g., "US", "Global", "International"
    country: { type: String, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Station || mongoose.model("Station", StationSchema);
