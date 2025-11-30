// models/Royalty.js
import mongoose from 'mongoose';

const royaltySchema = new mongoose.Schema({
  contentId: { type: mongoose.Schema.Types.ObjectId, refPath: 'contentType' },
  contentType: { type: String, enum: ['Song', 'Video'] },
  totalRevenue: Number,
  splits: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      percent: Number,
      amount: Number
    }
  ],
  payoutStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Royalty', royaltySchema);
