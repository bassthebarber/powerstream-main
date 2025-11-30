// backend/controllers/chatRoomController.js
import ChatRoom from "../models/ChatRoommodel.js.js";

exports.createRoom = async (req, res) => {
  try {
    const { members, isPrivate } = req.body;
    const newRoom = new ChatRoom({ members, isPrivate });
    const savedRoom = await newRoom.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create chat room' });
  }
};

exports.getUserRooms = async (req, res) => {
  try {
    const { userId } = req.params;
    const rooms = await ChatRoom.find({ members: userId }).populate('members');
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch user rooms' });
  }
};
