// backend/recordingStudio/routes/aiMasterRoutes.js
// AI Mastering Engine Routes - Professional Audio Mastering
// Endpoints: /api/studio/ai/master, /api/studio/ai/master/presets, etc.

import express from 'express';
import multer from 'multer';
import {
  masterTrack,
  getMasteringPresets,
  compareMaster,
} from '../controllers/masterController.js';

const router = express.Router();

// Multer config for file uploads (memory storage for processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 300 * 1024 * 1024 }, // 300MB max
  fileFilter: (_req, file, cb) => {
    const isAudio = /^audio\//.test(file.mimetype) || 
                    /\.(wav|mp3|flac|aiff|ogg|m4a)$/i.test(file.originalname);
    if (!isAudio) {
      return cb(new Error('Only audio files are allowed'));
    }
    cb(null, true);
  },
});

// ==========================================
// HEALTH & INFO
// ==========================================

/**
 * Health check for AI Master Engine
 * GET /api/studio/ai/master/health
 */
router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'AI Master Engine',
    version: '1.0.0',
    features: [
      'EQ (highpass, shelf)',
      'Multiband Compression',
      'Stereo Width Enhancement',
      'Loudness Normalization (EBU R128)',
      'True Peak Limiting',
      'Waveform Generation',
    ],
    presets: ['streaming', 'loud', 'dynamic', 'hiphop', 'trap'],
    timestamp: new Date().toISOString(),
  });
});

/**
 * Get available mastering presets
 * GET /api/studio/ai/master/presets
 */
router.get('/presets', getMasteringPresets);

// ==========================================
// MASTERING ENDPOINTS
// ==========================================

/**
 * Master an audio track
 * POST /api/studio/ai/master
 * 
 * Form Data:
 * - file: Audio file (WAV/MP3/FLAC)
 * 
 * Body parameters:
 * - trackName: string - Track title
 * - artistName: string - Artist name
 * - genre: string - Genre for preset selection
 * - preset: string - Mastering preset (streaming, loud, dynamic, hiphop, trap)
 * - loudnessTarget: number - Target LUFS (-9 for loud, -14 for streaming)
 * - truePeakLimit: number - True peak ceiling (default -1.0)
 * - lowCut: number - High-pass filter frequency (default 80Hz)
 * - highBoost: number - High shelf boost at 12kHz in dB (default +3)
 * - compressionRatio: number - Compression ratio (default 4:1)
 * - compressionKnee: string - 'soft' or 'hard' (default 'soft')
 * - stereoWidth: number - Stereo width % (120 = +20% width)
 * - outputFormat: string - Output format (mp3, wav, flac)
 * - outputBitrate: number - MP3 bitrate (default 320)
 * - generateWaveform: boolean - Generate waveform data
 * - compareBeforeAfter: boolean - Include before/after comparison
 * 
 * Response:
 * - ok: boolean
 * - masterId: string
 * - downloadUrl: string
 * - input/output: { loudness, truePeak, waveform }
 * - settings: Applied mastering settings
 * - notes: Processing notes
 */
router.post('/', upload.single('file'), masterTrack);

/**
 * Compare before/after master by ID
 * GET /api/studio/ai/master/compare/:id
 */
router.get('/compare/:id', compareMaster);

// ==========================================
// QUICK MASTERING PRESETS
// ==========================================

/**
 * Quick master with streaming preset (-14 LUFS)
 * POST /api/studio/ai/master/quick/streaming
 */
router.post('/quick/streaming', upload.single('file'), (req, res) => {
  req.body.preset = 'streaming';
  req.body.loudnessTarget = -14;
  return masterTrack(req, res);
});

/**
 * Quick master with loud preset (-9 LUFS)
 * POST /api/studio/ai/master/quick/loud
 */
router.post('/quick/loud', upload.single('file'), (req, res) => {
  req.body.preset = 'loud';
  req.body.loudnessTarget = -9;
  return masterTrack(req, res);
});

/**
 * Quick master for hip-hop (-11 LUFS)
 * POST /api/studio/ai/master/quick/hiphop
 */
router.post('/quick/hiphop', upload.single('file'), (req, res) => {
  req.body.preset = 'hiphop';
  req.body.loudnessTarget = -11;
  return masterTrack(req, res);
});

/**
 * Quick master for trap (-10 LUFS)
 * POST /api/studio/ai/master/quick/trap
 */
router.post('/quick/trap', upload.single('file'), (req, res) => {
  req.body.preset = 'trap';
  req.body.loudnessTarget = -10;
  return masterTrack(req, res);
});

export default router;








