// backend/routes/aiStudioProRoutes.js
// AI Studio Pro Routes - Real beat generation with MusicGen

import express from "express";
import {
  analyzeVocals,
  autoMixBeat,
  generateBeatPlan,
  autoVocalTuner,
  createChallenge,
  evaluateChallengeTake,
  quickFeedback,
  genres,
  coachModeKeys,
  genreProfilesData,
  coachModesData,
} from "../services/aiStudioProService.js";
import requireNoLimitArtist from "../middleware/requireNoLimitArtist.js";

// Import real beat engine
import { generateBeat, listBeats, getAvailableStyles, getAvailableMoods } from "../recordingStudio/ai/studio/beatEngine.js";

const router = express.Router();

// ==========================================
// OPTIONS (public - for frontend dropdowns)
// ==========================================
router.get("/options", (req, res) => {
  res.json({
    genres,
    coachModes: coachModeKeys,
    genreProfiles: genreProfilesData,
    coachModeDetails: coachModesData,
    beatStyles: getAvailableStyles(),
    beatMoods: getAvailableMoods(),
  });
});

// ==========================================
// VOCAL ANALYSIS (open to all authenticated users)
// ==========================================

// Full vocal analysis
router.post("/analyze/vocals", async (req, res) => {
  try {
    const result = await analyzeVocals(req.body);
    if (result?.error) {
      return res.status(500).json({ message: result.error });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Quick feedback (lightweight)
router.post("/vocals/quick", async (req, res) => {
  try {
    const result = await quickFeedback(req.body);
    if (result?.error) {
      return res.status(500).json({ message: result.error });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// PREMIUM FEATURES (No Limit East Houston only)
// ==========================================

// Auto mix recommendations
router.post("/mix/auto", requireNoLimitArtist, async (req, res) => {
  try {
    const result = await autoMixBeat(req.body);
    if (result?.error) {
      return res.status(500).json({ message: result.error });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Generate beat plan
router.post("/beat/plan", requireNoLimitArtist, async (req, res) => {
  try {
    const result = await generateBeatPlan(req.body);
    if (result?.error) {
      return res.status(500).json({ message: result.error });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// BEAT GENERATION - Real MusicGen Integration
// ==========================================

// Generate AI beat (uses MusicGen API if configured, else fallback)
router.post("/beat/generate", async (req, res) => {
  try {
    const { 
      prompt,
      bpm = 90, 
      key = 'C minor', 
      mood = 'dark',
      style = 'trap',
      aiMelody, 
      emphasis808,
      lengthSeconds = 30,
    } = req.body;

    console.log(`🎹 [AIStudio] Beat generation request: ${mood} ${style} @ ${bpm} BPM`);

    // Use real beat engine
    const result = await generateBeat({
      prompt,
      bpm,
      key,
      mood,
      style,
      lengthSeconds,
      ownerUserId: req.user?._id || null,
    });

    if (!result.success) {
      return res.status(500).json({ ok: false, message: "Beat generation failed" });
    }

    // Return format compatible with frontend
    res.json({
      ok: true,
      beatId: result.beat?._id,
      pattern: result.pattern || result.beat?.pattern,
      bpm,
      key,
      mood,
      style,
      audioUrl: result.audioUrl,
      suggestionText: result.suggestionText || `Generated ${mood} ${style} beat at ${bpm} BPM`,
      source: result.source,
      processingTime: result.processingTime,
    });

  } catch (err) {
    console.error("❌ Beat generate error:", err);
    res.status(500).json({ ok: false, message: err.message || "Beat generation failed" });
  }
});

// Get beats for Beat Store - Real database query
router.get("/beats", async (req, res) => {
  try {
    const { genre, mood, bpmMin, bpmMax, sort = 'newest', limit = 50, skip = 0 } = req.query;

    // Use real beat engine to query database
    const result = await listBeats({
      genre,
      mood,
      minBpm: bpmMin,
      maxBpm: bpmMax,
      sort,
      limit: Number(limit),
      skip: Number(skip),
    });

    // If no beats in database, return seed data
    if (result.beats.length === 0) {
      const seedBeats = [
        {
          _id: "seed1",
          title: "No Limit East Houston Type Beat",
          producer: "Studio AI",
          bpm: 140,
          key: "C minor",
          mood: "dark",
          genre: "trap",
          tags: ["trap", "south", "bounce"],
          previewUrl: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
          source: "seed",
        },
        {
          _id: "seed2",
          title: "Southern Soul Vibes",
          producer: "PowerHarmony",
          bpm: 85,
          key: "G major",
          mood: "chill",
          genre: "rnb",
          tags: ["soul", "rnb", "smooth"],
          previewUrl: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
          source: "seed",
        },
        {
          _id: "seed3",
          title: "Drill Energy",
          producer: "Studio AI",
          bpm: 145,
          key: "F# minor",
          mood: "aggressive",
          genre: "drill",
          tags: ["drill", "dark", "aggressive"],
          previewUrl: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
          source: "seed",
        },
        {
          _id: "seed4",
          title: "Gospel Keys",
          producer: "PowerHarmony",
          bpm: 75,
          key: "Bb major",
          mood: "uplifting",
          genre: "gospel",
          tags: ["gospel", "uplifting", "piano"],
          previewUrl: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
          source: "seed",
        },
        {
          _id: "seed5",
          title: "Bounce Back",
          producer: "Studio AI",
          bpm: 130,
          key: "A minor",
          mood: "dark",
          genre: "southern",
          tags: ["bounce", "houston", "trunk"],
          previewUrl: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
          source: "seed",
        },
      ];

      return res.json({ ok: true, beats: seedBeats, total: seedBeats.length, source: 'seed' });
    }

    res.json({ ok: true, beats: result.beats, total: result.total, source: 'database' });

  } catch (err) {
    console.error("❌ Beats fetch error:", err);
    res.status(500).json({ ok: false, message: err.message || "Failed to fetch beats" });
  }
});

// ==========================================
// VOCAL TUNER
// ==========================================

// Auto vocal tuner settings
router.post("/vocal/tuner", requireNoLimitArtist, async (req, res) => {
  try {
    const result = await autoVocalTuner(req.body);
    if (result?.error) {
      return res.status(500).json({ message: result.error });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// CHALLENGE MODE (No Limit East Houston only)
// ==========================================

// Create a new challenge
router.post("/challenge/start", requireNoLimitArtist, async (req, res) => {
  try {
    const result = await createChallenge(req.body);
    if (result?.error) {
      return res.status(500).json({ message: result.error });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Evaluate a challenge take
router.post("/challenge/evaluate", requireNoLimitArtist, async (req, res) => {
  try {
    const result = await evaluateChallengeTake(req.body);
    if (result?.error) {
      return res.status(500).json({ message: result.error });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
