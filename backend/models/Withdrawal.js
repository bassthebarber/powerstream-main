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
