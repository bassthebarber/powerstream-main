import NoLimitMessage from './NoLimitMessageModel.js';

// @desc    Handle fan message submission
export const submitMessage = async (req, res) => {
  try {
    const newMessage = new NoLimitMessage(req.body);
    await newMessage.save();
    res.status(201).json({ message: 'Message received', data: newMessage });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save message' });
  }
};

// @desc    Get all fan messages
export const getAllMessages = async (req, res) => {
  try {
    const messages = await NoLimitMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch messages' });
  }
};
