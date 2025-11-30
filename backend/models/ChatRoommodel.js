import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ChatRoomSchema = new Schema({
  name: String,
  isPrivate: { type: Boolean, default: false },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  admins: [{ type: Schema.Types.ObjectId, ref: "User" }],
  topic: String,
  avatarUrl: String
}, { timestamps: true });

export default model("ChatRoom", ChatRoomSchema);
