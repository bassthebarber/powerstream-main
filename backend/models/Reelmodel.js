import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ReelSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  media: { type: Schema.Types.ObjectId, ref: "MediaFile", required: true },
  caption: String,
  durationSec: Number,
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

export default model("Reel", ReelSchema);
