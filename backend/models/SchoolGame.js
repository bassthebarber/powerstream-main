// backend/models/SchoolGame.js
// School Game model for tracking live and recorded athletic events

import mongoose from "mongoose";

const schoolGameSchema = new mongoose.Schema(
  {
    schoolStationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchoolStation",
      required: true,
    },
    sport: { type: String, required: true },          // "football", "basketball", etc.
    level: { type: String, default: "varsity" },      // "varsity", "jv", "freshman"
    opponent: { type: String, required: true },       // "Barbers Hill", "North Shore"
    opponentMascot: { type: String },                 // "Eagles", "Mustangs"
    homeOrAway: { type: String, enum: ["home", "away", "neutral"], default: "home" },
    venue: { type: String },                          // Stadium/gym name
    gameDate: { type: Date, required: true },
    gameTime: { type: String },                       // "7:00 PM"
    seasonLabel: { type: String },                    // "2025-2026"
    seasonType: { type: String, enum: ["regular", "playoff", "scrimmage", "tournament"], default: "regular" },
    // Scoring
    finalScoreHome: { type: Number },
    finalScoreAway: { type: Number },
    quarterScores: [{
      quarter: { type: Number },
      home: { type: Number },
      away: { type: Number },
    }],
    result: { type: String, enum: ["win", "loss", "tie", "pending", "cancelled"], default: "pending" },
    // Media
    videoUrl: { type: String },                       // HLS VOD / replay URL
    highlightUrl: { type: String },                   // highlight reel
    thumbnailUrl: { type: String },                   // poster / thumbnail
    boxScoreUrl: { type: String },                    // Link to stats
    // Status
    isLive: { type: Boolean, default: false },
    liveStartedAt: { type: Date },
    liveEndedAt: { type: Date },
    isReplayAvailable: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    peakViewers: { type: Number, default: 0 },
    // Game notes
    notes: { type: String },                          // Special notes about the game
    weatherConditions: { type: String },              // "Clear, 72°F"
  },
  { timestamps: true }
);

// Indexes
schoolGameSchema.index({ schoolStationId: 1, gameDate: -1 });
schoolGameSchema.index({ sport: 1, gameDate: -1 });
schoolGameSchema.index({ isLive: 1 });
schoolGameSchema.index({ isReplayAvailable: 1, gameDate: -1 });

const SchoolGame = mongoose.model("SchoolGame", schoolGameSchema);
export default SchoolGame;


