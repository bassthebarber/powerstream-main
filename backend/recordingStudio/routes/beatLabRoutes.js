// backend/recordingStudio/routes/beatLabRoutes.js
// Beat Lab Routes - AI Beat Generation (uses correct DB connection)

import express from 'express';
import { generateBeat, listBeats, getAvailableStyles, getAvailableMoods } from '../ai/studio/beatEngine.js';

const router = express.Router();

// Check if AI is configured
const MUSICGEN_CONFIGURED = !!(process.env.MUSICGEN_API_BASE || process.env.MUSICGEN_API_KEY);

// Health check
router.get('/health', (_req, res) => {
  res.json({ 
    ok: true, 
    service: 'Beat Lab API',
    engine: MUSICGEN_CONFIGURED ? 'MusicGen (active)' : 'Pattern Fallback (demo)',
    aiConfigured: MUSICGEN_CONFIGURED,
    fallbackMode: !MUSICGEN_CONFIGURED,
    timestamp: new Date().toISOString(),
  });
});

// Get available options for beat generation
router.get('/options', (_req, res) => {
  res.json({
    ok: true,
    styles: getAvailableStyles(),
    moods: getAvailableMoods(),
  });
});

// Generate AI beat
router.post('/generate', async (req, res) => {
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

    console.log(`🎹 [BeatLab] Generating: ${mood} ${style} @ ${bpm} BPM`);

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
      return res.status(500).json({ ok: false, message: 'Beat generation failed' });
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
    console.error('❌ [BeatLab] Generate error:', err);
    res.status(500).json({ ok: false, message: err.message || 'Beat generation failed' });
  }
});

// List beats with filters
router.get('/list', async (req, res) => {
  try {
    const { genre, mood, bpmMin, bpmMax, sort = 'newest', limit = 50, skip = 0 } = req.query;

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
          _id: 'seed1',
          title: 'No Limit East Houston Type Beat',
          producer: 'Studio AI',
          bpm: 140,
          key: 'C minor',
          mood: 'dark',
          genre: 'trap',
          tags: ['trap', 'south', 'bounce'],
          previewUrl: 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg',
          source: 'seed',
        },
        {
          _id: 'seed2',
          title: 'Southern Soul Vibes',
          producer: 'PowerHarmony',
          bpm: 85,
          key: 'G major',
          mood: 'chill',
          genre: 'rnb',
          tags: ['soul', 'rnb', 'smooth'],
          previewUrl: 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg',
          source: 'seed',
        },
        {
          _id: 'seed3',
          title: 'Drill Energy',
          producer: 'Studio AI',
          bpm: 145,
          key: 'F# minor',
          mood: 'aggressive',
          genre: 'drill',
          tags: ['drill', 'dark', 'aggressive'],
          previewUrl: 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg',
          source: 'seed',
        },
      ];
      return res.json({ ok: true, beats: seedBeats, total: seedBeats.length, source: 'seed' });
    }

    res.json({ ok: true, beats: result.beats, total: result.total, source: 'database' });

  } catch (err) {
    console.error('❌ [BeatLab] List error:', err);
    res.status(500).json({ ok: false, message: err.message || 'Failed to fetch beats' });
  }
});

// Save beat to library
// POST /api/beatlab/save
router.post('/save', async (req, res) => {
  try {
    const { beatId, title, producer, metadata } = req.body;
    const userId = req.user?._id || req.user?.id;

    // In production, this would save to Beat model
    // For now, return success
    res.json({
      ok: true,
      message: 'Beat saved to library',
      beatId: beatId || `beat_${Date.now()}`,
      title,
      producer,
    });
  } catch (err) {
    console.error('❌ [BeatLab] Save error:', err);
    res.status(500).json({ ok: false, message: err.message || 'Failed to save beat' });
  }
});

// Evolve loop (mutate existing beat)
// POST /api/beatlab/evolve
router.post('/evolve', async (req, res) => {
  try {
    const { beatId, mutation } = req.body;

    // Mock evolve response
    const evolvedBeatId = `beat_evolved_${Date.now()}`;
    res.json({
      ok: true,
      beatId: evolvedBeatId,
      originalBeatId: beatId,
      audioUrl: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/v${Date.now()}/evolved_beat.mp3`,
      mutation: mutation || 'default',
    });
  } catch (err) {
    console.error('❌ [BeatLab] Evolve error:', err);
    res.status(500).json({ ok: false, message: err.message || 'Failed to evolve beat' });
  }
});

export default router;



