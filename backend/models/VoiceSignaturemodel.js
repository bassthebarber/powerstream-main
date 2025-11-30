import mongoose from "mongoose";
const { Schema, model } = mongoose;

/**
 * Biometric-ish voiceprint for verification or personalization.
 */
const VoiceSignatureSchema = new Schema({
  user:        { type: Schema.Types.ObjectId, ref: "User", unique: true, index: true },
  vector:      [{ type: Number }], // embedding vector
  model:       { type: String, default: "v1" },
  hash:        { type: String },    // optional checksum / perceptual hash
  lastUpdated: { type: Date, default: Date.now },
  meta:        Schema.Types.Mixed
}, { timestamps: true });

export default model("VoiceSignature", VoiceSignatureSchema);
