import mongoose from "mongoose";
const { Schema, model } = mongoose;

const SubscriptionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", index: true },
  provider: { type: String, enum: ["stripe", "paypal", "native"], required: true },
  planId: { type: String, required: true },
  status: { type: String, enum: ["active", "past_due", "canceled", "incomplete"], default: "active" },
  currentPeriodEnd: Date
}, { timestamps: true });

export default model("Subscription", SubscriptionSchema);
