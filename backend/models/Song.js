// models/Song.js
import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  title: String,
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  beatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Beat' },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  fileUrl: String,
  mastered: { type: Boolean, default: false },
  published: { type: Boolean, default: false },
  plays: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Song', songSchema);
