// backend/controllers/voiceChatController.js

import VoiceChat from "../models/voiceChat.js";

exports.startCall = async (req, res) => {
  try {
    const { callerId, receiverId, channelId } = req.body;
    const session = new VoiceChat({
      callerId,
      receiverId,
      channelId,
      startedAt: new Date(),
    });

    await session.save();
    res.status(200).json({ message: 'Voice call started', session });
  } catch (error) {
    res.status(500).json({ error: 'Voice call failed to start' });
  }
};

exports.endCall = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await VoiceChat.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Call not found' });

    session.endedAt = new Date();
    await session.save();
    res.status(200).json({ message: 'Call ended', session });
  } catch (error) {
    res.status(500).json({ error: 'Failed to end call' });
  }
};
