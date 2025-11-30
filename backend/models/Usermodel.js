import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true },
  handle: { type: String, unique: true, index: true },
  email: { type: String, unique: true, sparse: true },
  passwordHash: String,
  avatarUrl: String,
  roles: [{ type: String, enum: ["user", "creator", "admin"] }],
  verified: { type: Boolean, default: false }
}, { timestamps: true });

export default model("User", UserSchema);
