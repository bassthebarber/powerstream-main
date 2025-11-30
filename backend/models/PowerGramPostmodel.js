import mongoose from "mongoose";
const { Schema, model } = mongoose;

const PowerGramPostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  caption: String,
  reel: { type: Schema.Types.ObjectId, ref: "MediaFile" }, // short-form video
  likesCount: { type: Number, default: 0 },
  viewsCount: { type: Number, default: 0 }
}, { timestamps: true });

export default model("PowerGramPost", PowerGramPostSchema);
