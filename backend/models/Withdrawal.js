// backend/models/Withdrawal.js
// DEPRECATED: Model moved to /src/domain/models/WithdrawalRequest.model.js
// This file remains for backward compatibility with existing imports.
// TODO: Update all imports to use /src/domain/models/WithdrawalRequest.model.js
import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  method: { type: String, default: 'paypal' },
  status: { type: String, default: 'pending' },
  requestedAt: { type: Date, default: Date.now }
});

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
export default Withdrawal;
