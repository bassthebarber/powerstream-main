// backend/models/CoinTransaction.js
import mongoose from 'mongoose';

const CoinTxSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['tip', 'deposit', 'withdraw'], required: true },
    amount: { type: Number, required: true, min: 0 },
    fromUserId: { type: String }, // present for tip/withdraw
    toUserId: { type: String },   // present for tip/deposit
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model('CoinTransaction', CoinTxSchema);
