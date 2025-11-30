// /backend/models/Transaction.js
import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['royalty', 'studio_payout', 'bonus', 'tip', 'withdrawal', 'deposit'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  details: {
    type: String,
  },
  linkedJobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClockIn',
  }
}, {
  timestamps: true
});

export default mongoose.model('Transaction', TransactionSchema);
