// backend/recordingStudio/models/CollabSession.js
import mongoose from 'mongoose';

const CollabSessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' },
  files: [{ type: String }],
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('CollabSession', CollabSessionSchema);
