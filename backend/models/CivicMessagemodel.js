import mongoose from "mongoose";
const { Schema, model } = mongoose;

const CivicMessageSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  tags: [{ type: String }],
  location: { type: String }, // city/region or geo hash
  pinned: { type: Boolean, default: false }
}, { timestamps: true });

export default model("CivicMessage", CivicMessageSchema);
