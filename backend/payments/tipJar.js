// backend/payments/TipJar.js
import Tip from '../models/Tipmodel.js';
import User from '../models/Usermodel.js';

export const sendTip = async ({ senderId, creatorId, amount, message }) => {
  try {
    const tip = new Tip({
      senderId,
      creatorId,
      amount,
      message,
      createdAt: new Date()
    });
    await tip.save();

    console.log(`💸 Tip of $${amount.toFixed(2)} sent from ${senderId} to ${creatorId}`);
    return { success: true, tip };
  } catch (err) {
    console.error("SendTip Error:", err);
    return { success: false, message: err.message };
  }
};

export const getTipsForCreator = async (creatorId) => {
  try {
    return await Tip.find({ creatorId }).sort({ createdAt: -1 });
  } catch (err) {
    console.error("GetTipsForCreator Error:", err);
    return [];
  }
};
