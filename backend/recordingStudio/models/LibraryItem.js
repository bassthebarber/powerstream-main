// backend/recordingStudio/models/LibraryItem.js
import mongoose from "mongoose";

const libraryItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["beat", "recording", "mixdown", "stem", "sample", "master"],
      required: true 
    },
    bpm: Number,
    key: String,
    duration: Number,
    durationSeconds: Number,
    mood: String,
    genre: String,
    tags: [String],
    fileUrl: String,
    previewUrl: String,
    producerName: String,
    artistName: String,
    source: { 
      type: String, 
      enum: ["uploaded", "ai-generated", "imported", "recorded", "mixed", "mastered"],
      default: "uploaded"
    },
    sourceId: String,
    pattern: mongoose.Schema.Types.Mixed,
    status: { 
      type: String, 
      enum: ["pending", "processing", "ready", "error"],
      default: "ready"
    },
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    visibility: { 
      type: String, 
      enum: ["private", "public", "shared"],
      default: "private"
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

// Index for searching
libraryItemSchema.index({ title: "text", tags: "text", genre: "text" });
libraryItemSchema.index({ ownerUserId: 1, type: 1 });
libraryItemSchema.index({ sourceId: 1, type: 1 });

export default mongoose.model("LibraryItem", libraryItemSchema);

