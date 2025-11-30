// backend/models/Wallet.js
import mongoose from 'mongoose';

const WalletSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true, unique: true },
    balance: { type: Number, default: 0 }, // in coins
  },
  { timestamps: true }
);

export default mongoose.model('Wallet', WalletSchema);
