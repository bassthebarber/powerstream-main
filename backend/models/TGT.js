import mongoose from 'mongoose';

const tgtSchema = new mongoose.Schema({
  participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  videoUrl: { type: String, required: true },
  votes: { type: Number, default: 0 },
  round: { type: Number, default: 1 }
}, { timestamps: true });

export default mongoose.model('TGT', tgtSchema);
