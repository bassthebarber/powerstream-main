import mongoose from "mongoose";

const StationSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true },
    layout: { type: String, default: "powerfeed:auto" },
    streamKey: String, // optional local key
    ingest: {
      rtmpUrl: String,
      streamKey: String,     // Livepeer streamKey
      playbackId: String
    },
    playbackUrl: String,      // https://livepeercdn.com/hls/<playbackId>/index.m3u8
    isLive: { type: Boolean, default: false },
    playlist: { type: Array, default: [] },
    status: { type: String, default: "ready" },
    tags: { type: Array, default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Station || mongoose.model("Station", StationSchema);
