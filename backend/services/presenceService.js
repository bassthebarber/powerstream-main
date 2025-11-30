// backend/services/presenceService.js
const Presence = require('../models/Presence');

async function updateUserPresence(userId, isOnline) {
  return await Presence.findOneAndUpdate(
    { userId },
    { isOnline, lastSeen: new Date() },
    { upsert: true, new: true }
  );
}

async function getUserPresence(userId) {
  return await Presence.findOne({ userId });
}

module.exports = {
  updateUserPresence,
  getUserPresence,
};
