import mongoose from "mongoose";
const { Schema, model } = mongoose;

const CivicVoteSchema = new Schema({
  itemType: { type: String, enum: ["CivicMessage", "Post", "TGTMessage"], required: true },
  itemId: { type: Schema.Types.ObjectId, required: true, index: true },
  voter: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  value: { type: Number, enum: [1, -1], default: 1 }
}, { timestamps: true });

CivicVoteSchema.index({ itemType: 1, itemId: 1, voter: 1 }, { unique: true });
export default model("CivicVote", CivicVoteSchema);
