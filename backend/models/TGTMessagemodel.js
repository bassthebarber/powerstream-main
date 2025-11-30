import mongoose from "mongoose";
const { Schema, model } = mongoose;

const TGTMessageSchema = new Schema({
  showId: { type: String, index: true }, // "TexasGotTalent" room or episode id
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  votes: { type: Number, default: 0 }
}, { timestamps: true });

export default model("TGTMessage", TGTMessageSchema);
