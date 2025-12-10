// backend/controllers/presenceController.js

import ChatPresence from "../models/ChatPresencemodel.js";

export const updatePresence = async (req, res) => {
  try {
    const { userId, isOnline } = req.body;

    const presence = await ChatPresence.findOneAndUpdate(
      { user: userId },
      { isOnline, lastSeen: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json(presence);
  } catch (error) {
    console.error('Error updating presence:', error);
    res.status(500).json({ error: 'Failed to update presence' });
  }
};

export const getPresence = async (req, res) => {
  try {
    const { userId } = req.params;
    const presence = await ChatPresence.findOne({ user: userId });
    res.status(200).json(presence);
  } catch (error) {
    console.error('Error fetching presence:', error);
    res.status(500).json({ error: 'Failed to fetch presence' });
  }
};
