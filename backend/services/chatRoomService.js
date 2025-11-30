// backend/services/chatRoomService.js
const ChatRoom = require('../models/ChatRoommodel.js');

async function createRoom(users) {
  const room = new ChatRoom({ users });
  return await room.save();
}

async function getRoomsByUser(userId) {
  return await ChatRoom.find({ users: userId });
}

module.exports = {
  createRoom,
  getRoomsByUser,
};
