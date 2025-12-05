// backend/models/CoinTransaction.js
// DEPRECATED: Model moved to /src/domain/models/CoinTransaction.model.js
// This file remains for backward compatibility with existing imports.
// TODO: Update all imports to use /src/domain/models/CoinTransaction.model.js
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
