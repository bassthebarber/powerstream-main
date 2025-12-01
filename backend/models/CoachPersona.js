// backend/models/CoachPersona.js

import mongoose from "mongoose";

const coachPersonaSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      required: true,
      enum: ["standard", "dre", "master_p", "kanye", "timbaland", "motivational", "scarface20"],
    },
    displayName: { type: String, required: true },
    description: { type: String },
    stylePrompt: { type: String, required: true }, // how this coach talks
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("CoachPersona", coachPersonaSchema);

