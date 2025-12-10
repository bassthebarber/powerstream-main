// backend/recordingStudio/controllers/aiBeatController.js
// AI Beat Generation Controller

import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import Beat from "../models/Beat.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output directory for generated beats
const OUTPUT_DIR = path.join(__dirname, "../output/beats");
fs.ensureDirSync(OUTPUT_DIR);

// Genre/mood presets for pattern generation
const GENRE_PATTERNS = {
  trap: { kick: [0, 0, 8, 0, 0, 0, 8, 0, 0, 0, 8, 0, 0, 0, 8, 0], hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
  drill: { kick: [0, 0, 0, 8, 0, 0, 0, 8, 0, 0, 0, 8, 0, 0, 0, 8], hihat: [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1] },
  rnb: { kick: [8, 0, 0, 0, 8, 0, 0, 0, 8, 0, 0, 0, 8, 0, 0, 0], hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0] },
  hiphop: { kick: [8, 0, 0, 4, 0, 0, 8, 0, 0, 4, 0, 0, 8, 0, 0, 4], hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0] },
  lofi: { kick: [8, 0, 0, 0, 4, 0, 0, 0, 8, 0, 0, 0, 4, 0, 0, 0], hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0] },
  gospel: { kick: [8, 0, 4, 0, 0, 0, 8, 0, 4, 0, 0, 0, 8, 0, 4, 0], hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
  afrobeat: { kick: [8, 0, 0, 4, 0, 8, 0, 0, 4, 0, 8, 0, 0, 4, 0, 0], hihat: [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0] },
};

const MOOD_MODIFIERS = {
  dark: { keyOffset: -3, velocityMod: 0.9 },
  aggressive: { keyOffset: 0, velocityMod: 1.1 },
  chill: { keyOffset: 5, velocityMod: 0.7 },
  uplifting: { keyOffset: 7, velocityMod: 0.85 },
  soulful: { keyOffset: 2, velocityMod: 0.8 },
};

/**
 * Generate a beat pattern based on style/genre
 */
function generatePattern(style, mood, bars = 8) {
  const basePattern = GENRE_PATTERNS[style] || GENRE_PATTERNS.trap;
  const moodMod = MOOD_MODIFIERS[mood] || { keyOffset: 0, velocityMod: 1 };
  
  // Extend pattern to requested bars
  const stepsPerBar = 16;
  const totalSteps = bars * stepsPerBar;
  
  const pattern = {
    kick: [],
    snare: [],
    hihat: [],
    openHat: [],
    clap: [],
  };
  
  for (let i = 0; i < totalSteps; i++) {
    const idx = i % 16;
    pattern.kick.push(basePattern.kick[idx] * moodMod.velocityMod);
    pattern.hihat.push(basePattern.hihat[idx] * moodMod.velocityMod);
    // Snare on 2 and 4
    pattern.snare.push((idx === 4 || idx === 12) ? 8 * moodMod.velocityMod : 0);
    // Occasional open hat
    pattern.openHat.push((idx === 6 || idx === 14) && Math.random() > 0.5 ? 6 : 0);
    // Clap layered with snare
    pattern.clap.push((idx === 4 || idx === 12) ? 5 * moodMod.velocityMod : 0);
  }
  
  return pattern;
}

/**
 * Generate beat
 */
export const generateBeat = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const {
      vibe,
      prompt,
      tempo,
      bpm = tempo || 140,
      genre,
      style = genre || "trap",
      mood = "dark",
      referenceArtist,
      bars = 16,
      key = "C minor",
      aiMelody = false,
      emphasis808 = false,
    } = req.body;

    const userId = req.user?.id || req.user?._id;

    // Generate pattern
    const pattern = generatePattern(style, mood, bars);
    
    // Calculate duration
    const beatsPerBar = 4;
    const totalBeats = bars * beatsPerBar;
    const durationSeconds = (totalBeats / bpm) * 60;

    // Generate beat name
    const adjectives = ["Dark", "Smooth", "Hard", "Wavy", "Dirty", "Clean", "Heavy", "Light"];
    const nouns = ["Bounce", "Vibes", "Energy", "Flow", "Heat", "Wave", "Mode", "Zone"];
    const beatName = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]} ${bpm}`;

    // Create beat record
    const beat = new Beat({
      title: beatName,
      producerName: "Studio AI",
      bpm: parseInt(bpm),
      key,
      genre: style,
      mood,
      tags: [style, mood, `${bpm}bpm`, key],
      durationSeconds,
      pattern,
      source: "ai-pattern",
      status: "ready",
      fileUrl: "pattern", // Pattern-based, no file
      ownerUserId: userId,
    });

    await beat.save();

    const processingTime = Date.now() - startTime;

    res.json({
      ok: true,
      beatId: beat._id.toString(),
      name: beat.title,
      bpm: beat.bpm,
      key: beat.key,
      mood: beat.mood,
      style: beat.genre,
      bars,
      duration: durationSeconds,
      pattern,
      audioUrl: null, // Pattern-only beats don't have audio
      source: "pattern",
      processingTime,
      suggestionText: `${bars}-bar ${style} pattern at ${bpm} BPM in ${key}. ${emphasis808 ? "Heavy 808s enabled." : ""}`,
    });
  } catch (error) {
    console.error("Beat generation error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
};

/**
 * Get generation options
 */
export const getGenerationOptions = (req, res) => {
  res.json({
    ok: true,
    options: {
      styles: Object.keys(GENRE_PATTERNS),
      moods: Object.keys(MOOD_MODIFIERS),
      bpmRange: { min: 60, max: 180, default: 140 },
      barsOptions: [8, 16, 32],
      keys: [
        "C major", "C minor", "C# major", "C# minor",
        "D major", "D minor", "D# major", "D# minor",
        "E major", "E minor", "F major", "F minor",
        "F# major", "F# minor", "G major", "G minor",
        "G# major", "G# minor", "A major", "A minor",
        "A# major", "A# minor", "B major", "B minor",
      ],
    },
  });
};

/**
 * Download beat file
 */
export const downloadBeat = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(OUTPUT_DIR, filename);

    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ ok: false, error: "Beat file not found" });
    }

    res.download(filePath);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

/**
 * Get beat by ID
 */
export const getBeatById = async (req, res) => {
  try {
    const { id } = req.params;
    const beat = await Beat.findById(id);

    if (!beat) {
      return res.status(404).json({ ok: false, error: "Beat not found" });
    }

    res.json({
      ok: true,
      beat: {
        id: beat._id,
        title: beat.title,
        producer: beat.producerName,
        bpm: beat.bpm,
        key: beat.key,
        mood: beat.mood,
        genre: beat.genre,
        duration: beat.durationSeconds,
        pattern: beat.pattern,
        fileUrl: beat.fileUrl,
        source: beat.source,
        createdAt: beat.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

