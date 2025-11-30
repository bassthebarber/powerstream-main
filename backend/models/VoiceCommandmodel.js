import mongoose from "mongoose";
const { Schema, model } = mongoose;

const VoiceCommandSchema = new Schema({
  user:       { type: Schema.Types.ObjectId, ref: "User", index: true },
  command:    { type: String, required: true }, // parsed text intent
  rawText:    { type: String },
  audio:      { type: Schema.Types.ObjectId, ref: "MediaFile" }, // original audio
  context:    Schema.Types.Mixed, // e.g., room, station, device
  status:     { type: String, enum: ["queued", "processing", "completed", "failed"], default: "queued" },
  result:     Schema.Types.Mixed // action taken / response
}, { timestamps: true });

export default model("VoiceCommand", VoiceCommandSchema);
