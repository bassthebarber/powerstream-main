// backend/recordingStudio/models/LiveRoomSession.js
// Live Room Session Model - For real-time recording sessions
// POWERSTREAM AI STUDIO – LIVE ROOM & ENGINEER CONTRACT MODE

import mongoose from "mongoose";
import crypto from "crypto";

/**
 * Live room session statuses
 */
export const LIVE_ROOM_STATUS = {
  PENDING: "pending",     // Created but not started
  LIVE: "live",           // Recording in progress
  PAUSED: "paused",       // Temporarily paused
  COMPLETED: "completed", // Session finished
  CANCELLED: "cancelled", // Session cancelled
};

/**
 * Track types for recording
 */
export const TRACK_TYPES = {
  VOCAL: "vocal",
  BEAT: "beat",
  ADLIB: "adlib",
  HOOK: "hook",
  VERSE: "verse",
  BRIDGE: "bridge",
  MIX: "mix",
  MASTER: "master",
  INSTRUMENTAL: "instrumental",
  REFERENCE: "reference",
};

/**
 * Track schema for embedded documents
 */
const TrackSchema = new mongoose.Schema({
  trackId: { 
    type: String, 
    default: () => crypto.randomBytes(8).toString("hex"),
  },
  type: { 
    type: String, 
    enum: Object.values(TRACK_TYPES),
    default: TRACK_TYPES.VOCAL,
  },
  name: { type: String, default: "" },
  url: { type: String, default: "" },
  duration: { type: Number, default: 0 }, // in seconds
  fileSize: { type: Number, default: 0 }, // in bytes
  format: { type: String, default: "webm" },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  recordedAt: { type: Date, default: Date.now },
  notes: { type: String, default: "" },
  isSelected: { type: Boolean, default: false }, // Selected as "best take"
  waveformData: { type: [Number], default: [] }, // For UI visualization
}, { _id: false });

/**
 * LiveRoomSession Schema
 * Represents a real-time recording session where an artist records
 * with an optional engineer, hearing the beat through headphones.
 */
const LiveRoomSessionSchema = new mongoose.Schema(
  {
    // ============================================================
    // PARTICIPANTS
    // ============================================================
    artistId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true,
    },
    engineerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      index: true,
    },
    
    // ============================================================
    // SESSION IDENTITY
    // ============================================================
    roomCode: { 
      type: String, 
      unique: true, 
      index: true,
      default: () => crypto.randomBytes(4).toString("hex").toUpperCase(),
    },
    name: { 
      type: String, 
      default: () => `Session ${new Date().toLocaleDateString()}`,
    },
    description: { type: String, default: "" },

    // ============================================================
    // STATUS
    // ============================================================
    status: { 
      type: String, 
      enum: Object.values(LIVE_ROOM_STATUS),
      default: LIVE_ROOM_STATUS.PENDING,
      index: true,
    },

    // ============================================================
    // BACKING TRACK / BEAT
    // ============================================================
    currentBeatId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Beat",
    },
    currentBeatUrl: { type: String, default: "" },
    currentBeatName: { type: String, default: "" },

    // ============================================================
    // RECORDED TRACKS
    // ============================================================
    tracks: [TrackSchema],

    // ============================================================
    // TIMESTAMPS
    // ============================================================
    startedAt: { type: Date },
    endedAt: { type: Date },
    totalRecordingTime: { type: Number, default: 0 }, // in seconds

    // ============================================================
    // AUDIO SETTINGS
    // ============================================================
    settings: {
      bpm: { type: Number, default: 120 },
      key: { type: String, default: "C minor" },
      sampleRate: { type: Number, default: 48000 },
      bitDepth: { type: Number, default: 24 },
      channels: { type: Number, default: 2 }, // stereo
      monitorLatency: { type: Number, default: 0 }, // ms
      inputGain: { type: Number, default: 1.0 },
      monitorMix: { type: Number, default: 0.5 }, // 0=all beat, 1=all vocal
    },

    // ============================================================
    // LINKED ENTITIES
    // ============================================================
    // Link to StudioJob if this is a paid session
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "StudioJob" },
    // Link to project/session for organization
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "StudioSession" },

    // ============================================================
    // METADATA
    // ============================================================
    tags: [{ type: String }],
    genre: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { 
    timestamps: true,
    collection: "live_room_sessions",
  }
);

// ============================================================
// INDEXES
// ============================================================
LiveRoomSessionSchema.index({ artistId: 1, status: 1 });
LiveRoomSessionSchema.index({ engineerId: 1, status: 1 });
LiveRoomSessionSchema.index({ createdAt: -1 });
LiveRoomSessionSchema.index({ roomCode: 1 }, { unique: true });

// ============================================================
// METHODS
// ============================================================

/**
 * Start the live room session
 */
LiveRoomSessionSchema.methods.start = function () {
  this.status = LIVE_ROOM_STATUS.LIVE;
  this.startedAt = new Date();
  return this.save();
};

/**
 * Pause the session
 */
LiveRoomSessionSchema.methods.pause = function () {
  this.status = LIVE_ROOM_STATUS.PAUSED;
  return this.save();
};

/**
 * Resume from pause
 */
LiveRoomSessionSchema.methods.resume = function () {
  this.status = LIVE_ROOM_STATUS.LIVE;
  return this.save();
};

/**
 * End the session
 */
LiveRoomSessionSchema.methods.complete = function () {
  this.status = LIVE_ROOM_STATUS.COMPLETED;
  this.endedAt = new Date();
  if (this.startedAt) {
    this.totalRecordingTime = Math.floor((this.endedAt - this.startedAt) / 1000);
  }
  return this.save();
};

/**
 * Add a track to the session
 */
LiveRoomSessionSchema.methods.addTrack = function (trackData) {
  this.tracks.push({
    trackId: crypto.randomBytes(8).toString("hex"),
    ...trackData,
    recordedAt: new Date(),
  });
  return this.save();
};

/**
 * Get track count by type
 */
LiveRoomSessionSchema.methods.getTrackCountByType = function () {
  const counts = {};
  for (const track of this.tracks) {
    counts[track.type] = (counts[track.type] || 0) + 1;
  }
  return counts;
};

/**
 * Check if user can join this session
 */
LiveRoomSessionSchema.methods.canUserJoin = function (userId, userRoles = []) {
  const uid = userId.toString();
  const isArtist = this.artistId.toString() === uid;
  const isEngineer = this.engineerId?.toString() === uid;
  const isAdmin = userRoles.includes("admin");
  
  // Session must not be completed or cancelled
  if (this.status === LIVE_ROOM_STATUS.COMPLETED || 
      this.status === LIVE_ROOM_STATUS.CANCELLED) {
    return false;
  }
  
  return isArtist || isEngineer || isAdmin;
};

// ============================================================
// STATICS
// ============================================================

/**
 * Find session by room code
 */
LiveRoomSessionSchema.statics.findByRoomCode = function (roomCode) {
  return this.findOne({ roomCode: roomCode.toUpperCase() });
};

/**
 * Get active sessions for a user
 */
LiveRoomSessionSchema.statics.getActiveSessionsForUser = function (userId) {
  return this.find({
    $or: [{ artistId: userId }, { engineerId: userId }],
    status: { $in: [LIVE_ROOM_STATUS.PENDING, LIVE_ROOM_STATUS.LIVE, LIVE_ROOM_STATUS.PAUSED] },
  }).sort({ createdAt: -1 });
};

const LiveRoomSession = mongoose.models.LiveRoomSession || 
  mongoose.model("LiveRoomSession", LiveRoomSessionSchema);

export default LiveRoomSession;
export { LiveRoomSessionSchema, TrackSchema, LIVE_ROOM_STATUS, TRACK_TYPES };

