// backend/payments/SubscriptionManager.js
import Subscription from '../models/Subscriptionmodel.js';
import User from '../models/Usermodel.js';

export const subscribeToCreator = async ({ subscriberId, creatorId, plan, price }) => {
  try {
    const sub = new Subscription({
      subscriberId,
      creatorId,
      plan, // "monthly", "yearly", etc.
      price,
      startDate: new Date(),
      active: true
    });
    await sub.save();
    return { success: true, subscription: sub };
  } catch (err) {
    console.error("SubscribeToCreator Error:", err);
    return { success: false, message: err.message };
  }
};

export const cancelSubscription = async (subscriptionId) => {
  try {
    const sub = await Subscription.findById(subscriptionId);
    if (!sub) return { success: false, message: "Subscription not found" };
    sub.active = false;
    await sub.save();
    return { success: true, message: "Subscription cancelled" };
  } catch (err) {
    console.error("CancelSubscription Error:", err);
    return { success: false, message: err.message };
  }
};

export const getCreatorSubscribers = async (creatorId) => {
  try {
    return await Subscription.find({ creatorId, active: true });
  } catch (err) {
    console.error("GetCreatorSubscribers Error:", err);
    return [];
  }
};
