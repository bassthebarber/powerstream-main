// backend/services/presenceService.js
import Presence from "../models/Presence.js";

export async function updateUserPresence(userId, isOnline) {
  return await Presence.findOneAndUpdate(
    { userId },
    { isOnline, lastSeen: new Date() },
    { upsert: true, new: true }
  );
}

export async function getUserPresence(userId) {
  return await Presence.findOne({ userId });
}

export default {
  updateUserPresence,
  getUserPresence,
};
