// models/Beat.js
import mongoose from 'mongoose';

const beatSchema = new mongoose.Schema({
  title: String,
  genre: String,
  bpm: Number,
  price: Number,
  fileUrl: String,
  producerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [String],
  sold: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Beat', beatSchema);
