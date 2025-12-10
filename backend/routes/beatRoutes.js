// backend/routes/beatRoutes.js
// AI Beat Generation API Routes

import { Router } from "express";
import BeatGeneratorService from "../studio/BeatGeneratorService.js";

const router = Router();

/**
 * POST /api/beat/generate
 * Generate a new beat with stems
 */
router.post("/generate", async (req, res) => {
  try {
    const { tempo, key, mood, genre, structure } = req.body;

    console.log("[BeatRoutes] Generate request:", { tempo, key, mood, genre, structure });

    const stems = await BeatGeneratorService.generateBeat({
      tempo: parseInt(tempo) || 120,
      key: key || "C",
      mood: mood || "dark",
      genre: genre || "trap",
      structure: structure || "verse-hook-verse",
    });

    res.json({
      success: true,
      stems,
      metadata: {
        tempo,
        key,
        mood,
        genre,
        structure,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[BeatRoutes] Beat generation error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to generate beat",
    });
  }
});

/**
 * GET /api/beat/stems/:filename
 * Serve generated stem files (placeholder - returns silence or test tone)
 */
router.get("/stems/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const { tempo = 120 } = req.query;

    // For now, generate a simple test tone WAV file
    const stemType = filename.replace(".wav", "");
    const wavBuffer = generateTestToneWav(stemType, parseInt(tempo));

    // Set headers for audio streaming (not download)
    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Length", wavBuffer.length);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "public, max-age=300"); // 5 minute cache
    // CORS headers for cross-origin audio playback
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Range, Content-Type");
    res.setHeader("Access-Control-Expose-Headers", "Content-Length, Content-Range");
    res.send(wavBuffer);
  } catch (err) {
    console.error("[BeatRoutes] Stem serve error:", err);
    res.status(500).json({ error: "Failed to serve stem" });
  }
});

/**
 * GET /api/beat/presets
 * Get available presets for beat generation
 */
router.get("/presets", (req, res) => {
  res.json({
    success: true,
    presets: {
      tempos: [80, 90, 100, 110, 120, 130, 140, 150, 160],
      keys: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
      moods: ["dark", "happy", "chill", "aggressive", "ethereal", "melancholic"],
      genres: ["trap", "hiphop", "rnb", "pop", "lofi", "drill", "boom-bap", "edm"],
      structures: [
        "verse-hook-verse",
        "intro-verse-hook-verse-hook-outro",
        "loop-4-bars",
        "loop-8-bars",
      ],
    },
  });
});

/**
 * Generate a simple WAV file with a test tone
 * This is a placeholder until real audio generation is implemented
 */
function generateTestToneWav(stemType, tempo) {
  const sampleRate = 44100;
  const duration = 4; // 4 seconds
  const numSamples = sampleRate * duration;

  // Frequency based on stem type
  const frequencies = {
    drums: 100,
    bass: 80,
    chords: 220,
    melody: 440,
    fx: 880,
    full: 0, // Mixed beat
  };

  const freq = frequencies[stemType] || 440;
  
  // For "full" stem, generate a complete beat mix
  if (stemType === "full") {
    return generateFullBeatWav(tempo);
  }

  // Create WAV header
  const header = Buffer.alloc(44);
  const dataSize = numSamples * 2; // 16-bit mono
  const fileSize = 36 + dataSize;

  // RIFF header
  header.write("RIFF", 0);
  header.writeUInt32LE(fileSize, 4);
  header.write("WAVE", 8);

  // fmt chunk
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // chunk size
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); // byte rate
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample

  // data chunk
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  // Generate audio samples
  const samples = Buffer.alloc(dataSize);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Generate different patterns based on stem type
    let sample = 0;

    switch (stemType) {
      case "drums":
        // Simple kick pattern
        const beatPos = (t * tempo / 60) % 1;
        if (beatPos < 0.1) {
          sample = Math.sin(2 * Math.PI * freq * t * (1 - beatPos * 5)) * 0.8;
        }
        break;

      case "bass":
        // Sub bass
        sample = Math.sin(2 * Math.PI * freq * t) * 0.6 * (1 - (t % 0.5));
        break;

      case "chords":
        // Pad-like chord
        sample = (
          Math.sin(2 * Math.PI * freq * t) * 0.3 +
          Math.sin(2 * Math.PI * freq * 1.25 * t) * 0.2 +
          Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.2
        );
        break;

      case "melody":
        // Simple melody
        const melodyPhase = Math.floor(t * 2) % 4;
        const melodyFreqs = [freq, freq * 1.25, freq * 1.5, freq * 1.25];
        sample = Math.sin(2 * Math.PI * melodyFreqs[melodyPhase] * t) * 0.4;
        break;

      case "fx":
        // Ambient pad/riser
        sample = Math.sin(2 * Math.PI * freq * t * (1 + t * 0.1)) * 0.2 * (t / duration);
        break;

      default:
        sample = Math.sin(2 * Math.PI * freq * t) * 0.5;
    }

    // Apply envelope
    const envelope = Math.min(1, t * 10) * Math.min(1, (duration - t) * 10);
    sample *= envelope;

    // Convert to 16-bit
    const int16 = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    samples.writeInt16LE(int16, i * 2);
  }

  return Buffer.concat([header, samples]);
}

/**
 * GET /api/beat/library
 * List beats in the library
 */
router.get("/library", async (req, res) => {
  try {
    const { limit = 20, skip = 0, genre, mood } = req.query;
    
    // Return sample beat library data
    const sampleBeats = [
      { id: "beat-1", title: "Trap Soul", genre: "trap", mood: "dark", bpm: 140, key: "Cm", duration: 180 },
      { id: "beat-2", title: "Summer Vibes", genre: "afrobeat", mood: "uplifting", bpm: 105, key: "Gm", duration: 210 },
      { id: "beat-3", title: "Drill Type", genre: "drill", mood: "aggressive", bpm: 140, key: "Fm", duration: 195 },
      { id: "beat-4", title: "R&B Smooth", genre: "rnb", mood: "romantic", bpm: 85, key: "Bb", duration: 225 },
      { id: "beat-5", title: "Lo-Fi Chill", genre: "lofi", mood: "chill", bpm: 75, key: "Am", duration: 240 },
    ];
    
    let filtered = sampleBeats;
    if (genre) filtered = filtered.filter(b => b.genre === genre);
    if (mood) filtered = filtered.filter(b => b.mood === mood);
    
    res.json({
      success: true,
      ok: true,
      beats: filtered.slice(parseInt(skip), parseInt(skip) + parseInt(limit)),
      total: filtered.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/beat/health
 * Health check
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    ok: true,
    service: "beat-api",
    status: "online",
    version: "1.0",
    timestamp: new Date().toISOString()
  });
});

/**
 * Generate a full beat mix WAV file
 * Combines kick, snare, hihat, bass, and melody
 */
function generateFullBeatWav(tempo) {
  const sampleRate = 44100;
  const duration = 8; // 8 seconds (2 bars at most tempos)
  const numSamples = sampleRate * duration;
  
  // Create WAV header
  const header = Buffer.alloc(44);
  const dataSize = numSamples * 2; // 16-bit mono
  const fileSize = 36 + dataSize;
  
  // RIFF header
  header.write("RIFF", 0);
  header.writeUInt32LE(fileSize, 4);
  header.write("WAVE", 8);
  
  // fmt chunk
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  
  // data chunk
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  
  // Generate mixed audio
  const samples = Buffer.alloc(dataSize);
  const beatsPerSecond = tempo / 60;
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const beatPos = (t * beatsPerSecond) % 1;
    const barPos = (t * beatsPerSecond / 4) % 1;
    
    let sample = 0;
    
    // Kick drum (on 1 and 3)
    const kickPattern = Math.floor(t * beatsPerSecond) % 4;
    if (kickPattern === 0 || kickPattern === 2) {
      const kickPhase = beatPos * 4;
      if (kickPhase < 1) {
        const kickFreq = 60 * (1 + (1 - kickPhase) * 2);
        sample += Math.sin(2 * Math.PI * kickFreq * t) * 0.5 * (1 - kickPhase);
      }
    }
    
    // Snare (on 2 and 4)
    if (kickPattern === 1 || kickPattern === 3) {
      const snarePhase = beatPos * 4;
      if (snarePhase < 0.8) {
        sample += (Math.random() * 2 - 1) * 0.3 * (1 - snarePhase);
      }
    }
    
    // Hi-hat (every 8th note)
    const hihatPhase = (t * beatsPerSecond * 2) % 1;
    if (hihatPhase < 0.1) {
      sample += (Math.random() * 2 - 1) * 0.15 * (1 - hihatPhase * 10);
    }
    
    // Bass (root note)
    const bassFreq = 55; // A1
    sample += Math.sin(2 * Math.PI * bassFreq * t) * 0.25;
    
    // Chord pad (minor chord)
    const chord1 = 220; // A3
    const chord2 = 261.63; // C4
    const chord3 = 329.63; // E4
    const padEnv = 0.15;
    sample += Math.sin(2 * Math.PI * chord1 * t) * padEnv;
    sample += Math.sin(2 * Math.PI * chord2 * t) * padEnv;
    sample += Math.sin(2 * Math.PI * chord3 * t) * padEnv;
    
    // Apply master limiter
    sample = Math.tanh(sample * 1.5) * 0.8;
    
    // Apply fade in/out
    const envelope = Math.min(1, t * 4) * Math.min(1, (duration - t) * 4);
    sample *= envelope;
    
    // Convert to 16-bit
    const int16 = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    samples.writeInt16LE(int16, i * 2);
  }
  
  return Buffer.concat([header, samples]);
}

export default router;
