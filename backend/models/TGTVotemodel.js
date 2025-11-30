import mongoose from "mongoose";
const { Schema, model } = mongoose;

const TGTVoteSchema = new Schema({
  message: { type: Schema.Types.ObjectId, ref: "TGTMessage", required: true, index: true },
  voter: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  value: { type: Number, enum: [1, -1], default: 1 }
}, { timestamps: true });

TGTVoteSchema.index({ message: 1, voter: 1 }, { unique: true });
export default model("TGTVote", TGTVoteSchema);
