// backend/core/revenueTracker.js
import Revenue from '../models/Revenue.js';
import Station from '../models/Stationmodel.js';
import User from '../models/Usermodel.js';

// Add a revenue transaction
export const addRevenue = async ({ userId, stationId, amount, type, source }) => {
  try {
    const revenue = new Revenue({
      userId,
      stationId,
      amount,
      type, // "subscription", "tip", "ad", "coin", "stream"
      source, // Extra info e.g. "PayPal", "ApplePay"
    });
    await revenue.save();

    return { success: true, revenue };
  } catch (err) {
    console.error("RevenueTracker Error:", err);
    return { success: false, message: err.message };
  }
};

// Get total revenue for a user
export const getUserRevenue = async (userId) => {
  const total = await Revenue.aggregate([
    { $match: { userId } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  return total[0]?.total || 0;
};

// Get total revenue for a station
export const getStationRevenue = async (stationId) => {
  const total = await Revenue.aggregate([
    { $match: { stationId } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  return total[0]?.total || 0;
};

// Get platform-wide total revenue
export const getPlatformRevenue = async () => {
  const total = await Revenue.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  return total[0]?.total || 0;
};
