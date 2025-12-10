// backend/recordingStudio/models/LiveRoomSession.js
import mongoose from "mongoose";
import crypto from "crypto";

// Constants
export const LIVE_ROOM_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const TRACK_TYPES = {
  VOCAL: "vocal",
  INSTRUMENT: "instrument",
  BACKING: "backing",
  SCRATCH: "scratch",
  REFERENCE: "reference",
};

const trackSchema = new mongoose.Schema({
  trackId: String,
  type: { type: String, enum: Object.values(TRACK_TYPES), default: TRACK_TYPES.VOCAL },
  name: String,
  url: String,
  duration: Number,
  fileSize: Number,
  format: String,
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  recordedAt: Date,
  notes: String,
  isSelected: { type: Boolean, default: false },
});

const liveRoomSessionSchema = new mongoose.Schema(
  {
    roomCode: { 
      type: String, 
      unique: true, 
      default: () => crypto.randomBytes(4).toString("hex").toUpperCase()
    },
    name: String,
    description: String,
    artistId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    engineerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { 
      type: String, 
      enum: Object.values(LIVE_ROOM_STATUS), 
      default: LIVE_ROOM_STATUS.PENDING 
    },
    currentBeatId: { type: mongoose.Schema.Types.ObjectId, ref: "Beat" },
    currentBeatUrl: String,
    currentBeatName: String,
    settings: {
      bpm: { type: Number, default: 120 },
      key: { type: String, default: "C minor" },
      sampleRate: { type: Number, default: 48000 },
      bitDepth: { type: Number, default: 24 },
      channels: { type: Number, default: 2 },
      monitorLatency: { type: Number, default: 0 },
      inputGain: { type: Number, default: 1.0 },
      monitorMix: { type: Number, default: 0.5 },
    },
    tracks: [trackSchema],
    startedAt: Date,
    endedAt: Date,
    totalRecordingTime: { type: Number, default: 0 },
    tags: [String],
    genre: String,
    notes: String,
  },
  { timestamps: true }
);

// Static method to find by room code
liveRoomSessionSchema.statics.findByRoomCode = function(roomCode) {
  return this.findOne({ roomCode: roomCode.toUpperCase() });
};

// Instance methods
liveRoomSessionSchema.methods.start = async function() {
  if (this.status === LIVE_ROOM_STATUS.PENDING || this.status === LIVE_ROOM_STATUS.PAUSED) {
    this.status = LIVE_ROOM_STATUS.ACTIVE;
    if (!this.startedAt) {
      this.startedAt = new Date();
    }
    await this.save();
  }
  return this;
};

liveRoomSessionSchema.methods.pause = async function() {
  if (this.status === LIVE_ROOM_STATUS.ACTIVE) {
    this.status = LIVE_ROOM_STATUS.PAUSED;
    await this.save();
  }
  return this;
};

liveRoomSessionSchema.methods.resume = async function() {
  if (this.status === LIVE_ROOM_STATUS.PAUSED) {
    this.status = LIVE_ROOM_STATUS.ACTIVE;
    await this.save();
  }
  return this;
};

liveRoomSessionSchema.methods.complete = async function() {
  if (this.status !== LIVE_ROOM_STATUS.COMPLETED && this.status !== LIVE_ROOM_STATUS.CANCELLED) {
    this.status = LIVE_ROOM_STATUS.COMPLETED;
    this.endedAt = new Date();
    if (this.startedAt) {
      this.totalRecordingTime = Math.floor((this.endedAt - this.startedAt) / 1000);
    }
    await this.save();
  }
  return this;
};

liveRoomSessionSchema.index({ roomCode: 1 });
liveRoomSessionSchema.index({ artistId: 1, status: 1 });
liveRoomSessionSchema.index({ engineerId: 1, status: 1 });

export default mongoose.model("LiveRoomSession", liveRoomSessionSchema);

