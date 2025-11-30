import mongoose from 'mongoose';

const coinPaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coinsPurchased: {
      type: Number,
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['paypal', 'applepay', 'stripe', 'zelle'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const CoinPayment = mongoose.model('CoinPayment', coinPaymentSchema);
export default CoinPayment;
