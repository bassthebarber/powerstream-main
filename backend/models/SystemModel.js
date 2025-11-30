import mongoose from "mongoose";
const { Schema, model } = mongoose;

const SystemSchema = new Schema({
  key: { type: String, unique: true, required: true },
  value: Schema.Types.Mixed,
  description: String
}, { timestamps: true });

export default model("System", SystemSchema);
