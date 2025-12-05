// backend/recordingStudio/routes/aiBeatRoutes.js
// AI Beat Generation Routes - Full AI-powered beat creation
// Endpoints: /api/studio/ai/generate-beat, /api/studio/ai/beat/:id, etc.

import express from 'express';
import {
  generateBeat,
  getGenerationOptions,
  downloadBeat,
  getBeatById,
} from '../controllers/aiBeatController.js';

const router = express.Router();

// ==========================================
// HEALTH & OPTIONS
// ==========================================

/**
 * Health check for AI Beat Engine
 * GET /api/studio/ai/health
 */
router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'AI Beat Engine',
    version: '2.0.0',
    capabilities: ['openai', 'musicgen', 'pattern-fallback'],
    timestamp: new Date().toISOString(),
  });
});

/**
 * Get available generation options and presets
 * GET /api/studio/ai/options
 */
router.get('/options', getGenerationOptions);

// ==========================================
// BEAT GENERATION
// ==========================================

/**
 * Generate a new AI beat
 * POST /api/studio/ai/generate-beat
 * 
 * Body parameters:
 * - vibe: string - Custom vibe description
 * - prompt: string - Full custom prompt
 * - tempo/bpm: number - Target BPM (60-180)
 * - genre/style: string - Beat style (trap, drill, rnb, etc.)
 * - mood: string - Mood modifier (dark, uplifting, aggressive, etc.)
 * - referenceArtist: string - Reference artist for style inspiration
 * - bars: number - Length in bars (8, 16, or 32)
 * - key: string - Musical key (e.g., "C minor", "G major")
 * - aiMelody: boolean - Include AI-generated melody
 * - emphasis808: boolean - Heavy 808 bass emphasis
 * 
 * Response:
 * - beatId: string - Database ID
 * - name: string - Generated beat title
 * - audioUrl: string - URL to download/play the beat
 * - bpm: number - Detected/assigned BPM
 * - key: string - Detected/assigned key
 * - mood: string - Applied mood
 * - style: string - Applied style
 * - bars: number - Beat length in bars
 * - pattern: object - Drum pattern grid data
 * - suggestionText: string - Producer tips
 * - source: string - Generation source (openai/musicgen/pattern)
 * - processingTime: number - Generation time in ms
 */
router.post('/generate-beat', generateBeat);

// ==========================================
// BEAT RETRIEVAL & DOWNLOAD
// ==========================================

/**
 * Get a specific beat by ID
 * GET /api/studio/ai/beat/:id
 */
router.get('/beat/:id', getBeatById);

/**
 * Download a beat file by filename
 * GET /api/beats/download/:filename
 * (Also accessible via /api/studio/ai/download/:filename)
 */
router.get('/download/:filename', downloadBeat);

// ==========================================
// QUICK GENERATION PRESETS
// ==========================================

/**
 * Generate a quick test beat with default settings
 * POST /api/studio/ai/quick-beat
 */
router.post('/quick-beat', async (req, res) => {
  // Inject default values and forward to main generator
  req.body = {
    bpm: 140,
    style: 'trap',
    mood: 'dark',
    bars: 8,
    ...req.body,
  };
  return generateBeat(req, res);
});

/**
 * Generate beat with specific preset
 * POST /api/studio/ai/preset/:presetName
 */
router.post('/preset/:presetName', async (req, res) => {
  const presets = {
    'houston-trap': { style: 'southern', mood: 'dark', bpm: 72, referenceArtist: 'scarface' },
    'uk-drill': { style: 'drill', mood: 'aggressive', bpm: 145 },
    'smooth-rnb': { style: 'rnb', mood: 'chill', bpm: 85 },
    'boom-bap': { style: 'hiphop', mood: 'soulful', bpm: 92 },
    'hard-trap': { style: 'trap', mood: 'aggressive', bpm: 150, emphasis808: true },
    'lofi-chill': { style: 'lofi', mood: 'chill', bpm: 78 },
    'gospel-uplift': { style: 'gospel', mood: 'uplifting', bpm: 100 },
    'afro-dance': { style: 'afrobeat', mood: 'uplifting', bpm: 105 },
  };

  const preset = presets[req.params.presetName];
  if (!preset) {
    return res.status(400).json({
      ok: false,
      message: `Unknown preset: ${req.params.presetName}`,
      availablePresets: Object.keys(presets),
    });
  }

  req.body = { ...preset, bars: 16, ...req.body };
  return generateBeat(req, res);
});

export default router;





