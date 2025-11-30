// backend/recordingStudio/models/Beat.js
import mongoose from 'mongoose';

const BeatSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String },
  price: { type: Number, default: 0 },
  bpm: { type: Number },
  producerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileUrl: { type: String, required: true },
  purchases: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Beat', BeatSchema);
