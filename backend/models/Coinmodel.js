import mongoose from "mongoose";
const { Schema, model } = mongoose;

const CoinSchema = new Schema({
  symbol: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  owner: { type: Schema.Types.ObjectId, ref: "User", index: true }
}, { timestamps: true });

export default model("Coin", CoinSchema);
