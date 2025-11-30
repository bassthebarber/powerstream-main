// backend/payments/RoyaltyPayout.js
import Payout from '../models/payoutmodel.js/index.js';
import StreamRecord from '../models/StreamRecord.js';
import User from '../models/Usermodel.js';

// Configurable rate (example: $0.25 per stream)
const PAY_PER_STREAM = 0.25;

export const processRoyaltyPayouts = async () => {
  try {
    // Get all unique creators from streams
    const creators = await StreamRecord.distinct('creatorId');

    for (const creatorId of creators) {
      // Count number of streams for this creator
      const streamCount = await StreamRecord.countDocuments({ creatorId });
      const payoutAmount = streamCount * PAY_PER_STREAM;

      if (payoutAmount > 0) {
        const payout = new Payout({
          creatorId,
          amount: payoutAmount,
          type: 'royalty',
          createdAt: new Date()
        });
        await payout.save();

        console.log(`💰 Paid $${payoutAmount.toFixed(2)} to creator ${creatorId}`);
      }
    }
    return { success: true, message: "Royalty payouts processed successfully" };
  } catch (err) {
    console.error("RoyaltyPayout Error:", err);
    return { success: false, message: err.message };
  }
};
