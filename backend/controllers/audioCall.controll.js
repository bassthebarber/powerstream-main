// backend/controllers/audioCall.controll.js

import AudioCall from "../models/audioCallmodel.js";
import User from "../models/Usermodel.js";

export const startAudioCall = async (req, res) => {
  try {
    const { callerId, receiverId, roomId, isGroupCall = false } = req.body;

    const newCall = new AudioCall({
      caller: callerId,
      receiver: receiverId,
      roomId,
      isGroupCall
    });

    await newCall.save();
    res.status(201).json({ message: 'Audio call started', call: newCall });
  } catch (error) {
    console.error('Start audio call error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const endAudioCall = async (req, res) => {
  try {
    const { callId } = req.params;

    const call = await AudioCall.findById(callId);
    if (!call) return res.status(404).json({ error: 'Call not found' });

    call.status = 'ended';
    call.endedAt = new Date();
    await call.save();

    res.status(200).json({ message: 'Audio call ended', call });
  } catch (error) {
    console.error('End audio call error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserAudioCalls = async (req, res) => {
  try {
    const { userId } = req.params;

    const calls = await AudioCall.find({
      $or: [{ caller: userId }, { receiver: userId }]
    }).sort({ startedAt: -1 });

    res.status(200).json(calls);
  } catch (error) {
    console.error('Get audio calls error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
