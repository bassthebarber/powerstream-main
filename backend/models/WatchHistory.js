// backend/models/WatchHistory.js
// Watch History model for tracking user viewing progress

import mongoose from "mongoose";

const watchHistorySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  filmId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Film",
    required: true 
  },
  progress: { type: Number, default: 0 }, // seconds watched
  duration: { type: Number, default: 0 }, // total duration
  completed: { type: Boolean, default: false },
  lastWatched: { type: Date, default: Date.now },
}, { timestamps: true });

// Compound index for efficient lookups
watchHistorySchema.index({ userId: 1, filmId: 1 }, { unique: true });
watchHistorySchema.index({ userId: 1, lastWatched: -1 });

export default mongoose.model("WatchHistory", watchHistorySchema);


