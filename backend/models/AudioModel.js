import mongoose from "mongoose";
const { Schema, model } = mongoose;

const AudioSchema = new Schema({
  owner:      { type: Schema.Types.ObjectId, ref: "User", index: true },
  file:       { type: Schema.Types.ObjectId, ref: "MediaFile", required: true },
  title:      { type: String },
  durationSec:{ type: Number },
  mimeType:   { type: String },
  tags:       [String],
  visibility: { type: String, enum: ["public", "followers", "private"], default: "public" }
}, { timestamps: true });

export default model("Audio", AudioSchema);
