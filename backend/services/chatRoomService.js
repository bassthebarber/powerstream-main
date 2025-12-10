// backend/services/chatRoomService.js
import ChatRoom from "../models/ChatRoommodel.js";

export async function createRoom(users) {
  const room = new ChatRoom({ users });
  return await room.save();
}

export async function getRoomsByUser(userId) {
  return await ChatRoom.find({ users: userId });
}

export default {
  createRoom,
  getRoomsByUser,
};
