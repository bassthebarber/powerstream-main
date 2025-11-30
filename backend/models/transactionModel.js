// backend/models/transactionModel.js

import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  method: String,
  reason: String,
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', default: null },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Transaction', transactionSchema);
