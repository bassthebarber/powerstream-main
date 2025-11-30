// models/CollabSession.js
import mongoose from 'mongoose';

const collabSessionSchema = new mongoose.Schema({
  sessionName: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  active: { type: Boolean, default: true },
  beatInUse: { type: mongoose.Schema.Types.ObjectId, ref: 'Beat' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('CollabSession', collabSessionSchema);
