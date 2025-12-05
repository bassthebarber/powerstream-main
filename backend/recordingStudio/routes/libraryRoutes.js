// backend/recordingStudio/routes/libraryRoutes.js
// Library Routes - Unified access to recordings, beats, and mixes

import express from 'express';
import Recording from '../models/Recording.js';
import Beat from '../models/Beat.js';
import Mixdown from '../models/Mixdown.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// ==========================================
// RECORDINGS
// ==========================================

// GET /api/library/recordings - List all recordings
router.get('/recordings', async (req, res) => {
  try {
    const { limit = 50, skip = 0, source } = req.query;
    
    const query = {};
    if (source) query.source = source;

    const recordings = await Recording.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await Recording.countDocuments(query);

    res.json({
      ok: true,
      items: recordings.map(r => ({
        _id: r._id,
        name: r.title,
        title: r.title,
        artistName: r.artistName,
        type: 'recording',
        source: r.source,
        url: r.audioUrl,
        duration: r.durationSeconds,
        aiScore: r.aiAnalysis?.overallScore,
        createdAt: r.createdAt,
      })),
      total,
    });
  } catch (err) {
    console.error('Library recordings error:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

// GET /api/library/recordings/:id - Get single recording
router.get('/recordings/:id', async (req, res) => {
  try {
    const recording = await Recording.findById(req.params.id);
    if (!recording) {
      return res.status(404).json({ ok: false, message: 'Recording not found' });
    }
    res.json({ ok: true, recording });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// POST /api/library/recordings - Create a recording entry
router.post('/recordings', async (req, res) => {
  try {
    const recording = new Recording(req.body);
    await recording.save();
    res.status(201).json({ ok: true, recording });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// ==========================================
// BEATS
// ==========================================

// GET /api/library/beats - List all beats
router.get('/beats', async (req, res) => {
  try {
    const { limit = 50, skip = 0, genre, mood } = req.query;
    
    const query = {};
    if (genre) query.genre = genre;
    if (mood) query.mood = mood;

    const beats = await Beat.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await Beat.countDocuments(query);

    // If no beats, return seed data
    if (beats.length === 0) {
      return res.json({
        ok: true,
        items: [
          {
            _id: 'seed1',
            name: 'Demo Beat',
            title: 'Demo Beat',
            type: 'beat',
            bpm: 90,
            key: 'C minor',
            url: null,
            source: 'seed',
            createdAt: new Date(),
          }
        ],
        total: 1,
        source: 'seed',
      });
    }

    res.json({
      ok: true,
      items: beats.map(b => ({
        _id: b._id,
        name: b.title,
        title: b.title,
        type: 'beat',
        bpm: b.bpm,
        key: b.key,
        mood: b.mood,
        genre: b.genre,
        url: b.fileUrl,
        source: b.source,
        createdAt: b.createdAt,
      })),
      total,
    });
  } catch (err) {
    console.error('Library beats error:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

// GET /api/library/beats/:id - Get single beat
router.get('/beats/:id', async (req, res) => {
  try {
    const beat = await Beat.findById(req.params.id);
    if (!beat) {
      return res.status(404).json({ ok: false, message: 'Beat not found' });
    }
    res.json({ ok: true, beat });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// ==========================================
// MIXES / MIXDOWNS
// ==========================================

// GET /api/library/mixes - List all mixdowns
router.get('/mixes', async (req, res) => {
  try {
    const { limit = 50, skip = 0, status } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const mixes = await Mixdown.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await Mixdown.countDocuments(query);

    res.json({
      ok: true,
      items: mixes.map(m => ({
        _id: m._id,
        name: m.trackTitle,
        title: m.trackTitle,
        artistName: m.artistName,
        type: 'mixdown',
        genre: m.genre,
        url: m.outputUrl,
        duration: m.duration,
        loudness: m.loudnessIntegrated,
        truePeak: m.truePeak,
        status: m.status,
        createdAt: m.createdAt,
      })),
      total,
    });
  } catch (err) {
    console.error('Library mixes error:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

// GET /api/library/mixes/:id - Get single mixdown
router.get('/mixes/:id', async (req, res) => {
  try {
    const mixdown = await Mixdown.findById(req.params.id);
    if (!mixdown) {
      return res.status(404).json({ ok: false, message: 'Mixdown not found' });
    }
    res.json({ ok: true, mixdown });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// ==========================================
// COMBINED LIBRARY
// ==========================================

// GET /api/library/all - Get all items combined
router.get('/all', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const perType = Math.ceil(Number(limit) / 3);

    const [recordings, beats, mixes] = await Promise.all([
      Recording.find({}).sort({ createdAt: -1 }).limit(perType),
      Beat.find({}).sort({ createdAt: -1 }).limit(perType),
      Mixdown.find({}).sort({ createdAt: -1 }).limit(perType),
    ]);

    const items = [
      ...recordings.map(r => ({
        _id: r._id,
        name: r.title,
        type: 'recording',
        url: r.audioUrl,
        createdAt: r.createdAt,
      })),
      ...beats.map(b => ({
        _id: b._id,
        name: b.title,
        type: 'beat',
        url: b.fileUrl,
        bpm: b.bpm,
        createdAt: b.createdAt,
      })),
      ...mixes.map(m => ({
        _id: m._id,
        name: m.trackTitle,
        type: 'mixdown',
        url: m.outputUrl,
        createdAt: m.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      ok: true,
      items: items.slice(0, Number(limit)),
      counts: {
        recordings: await Recording.countDocuments({}),
        beats: await Beat.countDocuments({}),
        mixes: await Mixdown.countDocuments({}),
      },
    });
  } catch (err) {
    console.error('Library all error:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

// GET /api/library/stats - Get library statistics
router.get('/stats', async (req, res) => {
  try {
    const [recordings, beats, mixes] = await Promise.all([
      Recording.countDocuments({}),
      Beat.countDocuments({}),
      Mixdown.countDocuments({}),
    ]);

    res.json({
      ok: true,
      stats: {
        recordings,
        beats,
        mixes,
        total: recordings + beats + mixes,
      },
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

export default router;



