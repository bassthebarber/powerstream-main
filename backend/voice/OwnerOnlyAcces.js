// backend/voice/ownerOnlyAccess.js
import User from '../models/Usermodel.js';

// Owner's registered ID (replace with your real MongoDB ObjectId)
const OWNER_ID = "64a8c9d3f8b2c1e4e0f5b6a7"; // Marcus' ID

// Check if user is owner before running voice command
export const verifyOwnerAccess = async (userId) => {
  if (userId.toString() === OWNER_ID.toString()) {
    return true;
  }
  return false;
};

// Wrapper to protect commands
export const runIfOwner = async (userId, callback) => {
  const isOwner = await verifyOwnerAccess(userId);
  if (!isOwner) {
    return { success: false, message: "❌ Unauthorized — owner access only" };
  }
  return callback();
};
