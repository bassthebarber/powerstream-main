// backend/recordingStudio/models/Sample.js
import mongoose from 'mongoose';

const SampleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  originalArtist: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true },
  bpm: { type: Number },
  key: { type: String },
  genre: { type: String },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Sample', SampleSchema);
