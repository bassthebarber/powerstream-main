import mongoose from 'mongoose';

const civicSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, required: true },
  voteType: { type: String, enum: ['up', 'down'], required: true }
}, { timestamps: true });

export default mongoose.model('Civic', civicSchema);
