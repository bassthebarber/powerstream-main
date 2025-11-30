import VideoCall from "../models/VideoCallmodel.js";
import User from "../models/Usermodel.js";

exports.startVideoCall = async (req, res) => {
  try {
    const { callerId, receiverId, roomId, isGroupCall = false } = req.body;

    const newCall = new VideoCall({
      caller: callerId,
      receiver: receiverId,
      roomId,
      isGroupCall
    });

    await newCall.save();
    res.status(201).json({ message: 'Video call started', call: newCall });
  } catch (error) {
    console.error('Start video call error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.endVideoCall = async (req, res) => {
  try {
    const { callId } = req.params;

    const call = await VideoCall.findById(callId);
    if (!call) return res.status(404).json({ error: 'Call not found' });

    call.status = 'ended';
    call.endedAt = new Date();
    await call.save();

    res.status(200).json({ message: 'Video call ended', call });
  } catch (error) {
    console.error('End video call error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUserVideoCalls = async (req, res) => {
  try {
    const { userId } = req.params;

    const calls = await VideoCall.find({
      $or: [{ caller: userId }, { receiver: userId }]
    }).sort({ startedAt: -1 });

    res.status(200).json(calls);
  } catch (error) {
    console.error('Get user calls error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
