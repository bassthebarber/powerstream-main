import Message from '../models/messageModel.js';

export const createMessage = async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;

    const newMessage = new Message({ sender, receiver, content });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create message', error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { sender, receiver } = req.query;

    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
};
