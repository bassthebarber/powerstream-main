// /backend/recordingStudio/models/StudioAccessTracker.js
import mongoose from 'mongoose';

const StudioAccessTrackerSchema = new mongoose.Schema({
  userId: String,
  accessedFeatures: [String],
  lastAccessed: Date,
}, { timestamps: true });

export default mongoose.model('StudioAccessTracker', StudioAccessTrackerSchema);
