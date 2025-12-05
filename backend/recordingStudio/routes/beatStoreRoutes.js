// backend/recordingStudio/routes/beatStoreRoutes.js
// Beat Store Routes - Browse, preview, and use beats
// Integrates with Library, Beat Player, and Record Booth

import express from 'express';
import Beat from '../models/Beat.js';
import LibraryItem from '../models/LibraryItem.js';
import { createRoyaltyEntryForBeat } from '../services/royaltyService.js';

const router = express.Router();

// ==========================================
// BEAT STORE - LIST & SEARCH
// ==========================================

/**
 * Get all beats for Beat Store
 * GET /api/studio/beats
 * 
 * Query params:
 * - genre: string
 * - mood: string
 * - bpmMin: number
 * - bpmMax: number
 * - sort: newest | popular | price_low | price_high
 * - limit: number (default 50)
 * - skip: number (default 0)
 * - search: string
 */
router.get('/', async (req, res) => {
  try {
    const { 
      genre, 
      mood, 
      bpmMin, 
      bpmMax, 
      sort = 'newest', 
      limit = 50, 
      skip = 0,
      search,
    } = req.query;

    // Build query
    const query = { status: { $in: ['ready', 'published'] } };
    
    if (genre) query.genre = genre;
    if (mood) query.mood = mood;
    if (bpmMin || bpmMax) {
      query.bpm = {};
      if (bpmMin) query.bpm.$gte = Number(bpmMin);
      if (bpmMax) query.bpm.$lte = Number(bpmMax);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { producerName: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort options
    const sortOptions = {
      newest: { createdAt: -1 },
      popular: { plays: -1, createdAt: -1 },
      price_low: { price: 1 },
      price_high: { price: -1 },
    };

    const beats = await Beat.find(query)
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await Beat.countDocuments(query);

    // If no beats found, return seed data for demo
    if (beats.length === 0) {
      return res.json({
        ok: true,
        beats: SEED_BEATS,
        total: SEED_BEATS.length,
        source: 'seed',
      });
    }

    res.json({
      ok: true,
      beats: beats.map(b => b.toStoreFormat ? b.toStoreFormat() : {
        _id: b._id,
        title: b.title,
        producer: b.producerName || 'Studio AI',
        bpm: b.bpm,
        key: b.key,
        duration: b.durationSeconds || b.duration,
        mood: b.mood,
        genre: b.genre,
        tags: b.tags || [],
        previewUrl: b.previewUrl || b.fileUrl,
        fileUrl: b.fileUrl,
        price: b.price,
        plays: b.plays,
        source: b.source,
        pattern: b.pattern,
        createdAt: b.createdAt,
      }),
      total,
      source: 'database',
    });

  } catch (err) {
    console.error('❌ [BeatStore] List error:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * Get a single beat by ID
 * GET /api/studio/beats/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const beat = await Beat.findById(req.params.id);
    
    if (!beat) {
      return res.status(404).json({ ok: false, message: 'Beat not found' });
    }

    // Increment play count
    beat.plays = (beat.plays || 0) + 1;
    await beat.save();

    res.json({
      ok: true,
      beat: beat.toStoreFormat ? beat.toStoreFormat() : beat,
    });

  } catch (err) {
    console.error('❌ [BeatStore] Get error:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * Log a beat play (for royalty tracking)
 * POST /api/studio/beats/:id/play
 */
router.post('/:id/play', async (req, res) => {
  try {
    const beat = await Beat.findById(req.params.id);
    
    if (!beat) {
      return res.status(404).json({ ok: false, message: 'Beat not found' });
    }

    beat.plays = (beat.plays || 0) + 1;
    await beat.save();

    console.log(`🎵 [BeatStore] Play logged: ${beat.title} (${beat.plays} total)`);

    res.json({ ok: true, plays: beat.plays });

  } catch (err) {
    console.error('❌ [BeatStore] Play log error:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

// ==========================================
// BEAT STORE - ADD TO LIBRARY
// ==========================================

/**
 * Add a beat to user's library (copy/license)
 * POST /api/studio/beats/:id/add-to-library
 */
router.post('/:id/add-to-library', async (req, res) => {
  try {
    const beat = await Beat.findById(req.params.id);
    
    if (!beat) {
      return res.status(404).json({ ok: false, message: 'Beat not found' });
    }

    // Create a library item entry
    const libraryItem = new LibraryItem({
      title: beat.title,
      type: 'beat',
      bpm: beat.bpm,
      key: beat.key,
      duration: beat.durationSeconds || beat.duration,
      mood: beat.mood,
      genre: beat.genre,
      tags: beat.tags,
      fileUrl: beat.fileUrl,
      previewUrl: beat.previewUrl,
      producerName: beat.producerName,
      source: 'imported',
      sourceId: beat._id.toString(),
      pattern: beat.pattern,
      status: 'ready',
      ownerUserId: req.user?._id,
    });

    await libraryItem.save();

    console.log(`📚 [BeatStore] Beat added to library: ${beat.title}`);

    res.json({
      ok: true,
      message: 'Beat added to library',
      libraryItemId: libraryItem._id,
    });

  } catch (err) {
    console.error('❌ [BeatStore] Add to library error:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

// ==========================================
// BEAT STORE - USE BEAT (for Record Booth)
// ==========================================

/**
 * Get beat data for use in Record Booth
 * GET /api/studio/beats/:id/use
 * 
 * Returns formatted data suitable for Record Booth backing track
 */
router.get('/:id/use', async (req, res) => {
  try {
    const beat = await Beat.findById(req.params.id);
    
    if (!beat) {
      return res.status(404).json({ ok: false, message: 'Beat not found' });
    }

    // Log usage
    beat.plays = (beat.plays || 0) + 1;
    await beat.save();

    console.log(`🎙️ [BeatStore] Beat prepared for recording: ${beat.title}`);

    // Return data formatted for Record Booth
    res.json({
      ok: true,
      backingTrack: {
        id: beat._id,
        name: beat.title,
        title: beat.title,
        bpm: beat.bpm,
        key: beat.key,
        duration: beat.durationSeconds || beat.duration,
        audioUrl: beat.fileUrl,
        previewUrl: beat.previewUrl,
        producer: beat.producerName,
        genre: beat.genre,
        mood: beat.mood,
      },
    });

  } catch (err) {
    console.error('❌ [BeatStore] Use beat error:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

// ==========================================
// BEAT STORE - SAVE/PUBLISH
// ==========================================

/**
 * Save/publish a beat to the store
 * POST /api/studio/beats
 * 
 * Body:
 * - title: string
 * - bpm: number
 * - key: string
 * - mood: string
 * - genre: string
 * - tags: string[]
 * - fileUrl: string
 * - pattern: object
 * - createRoyaltySplit: boolean
 */
router.post('/', async (req, res) => {
  try {
    const {
      title,
      name,
      bpm,
      key,
      mood,
      genre,
      style,
      tags,
      fileUrl,
      audioUrl,
      previewUrl,
      pattern,
      duration,
      durationSeconds,
      source = 'uploaded',
      producerName = 'Studio AI',
      createRoyaltySplit = true,
    } = req.body;

    // Create beat
    const beat = new Beat({
      title: title || name || 'Untitled Beat',
      bpm,
      key,
      mood,
      genre: genre || style,
      tags: tags || [mood, genre || style, `${bpm}bpm`].filter(Boolean),
      fileUrl: fileUrl || audioUrl || 'pattern',
      previewUrl,
      pattern,
      duration: duration || durationSeconds,
      durationSeconds: durationSeconds || duration,
      source,
      producerName,
      status: 'ready',
      visibility: 'public',
      ownerUserId: req.user?._id,
    });

    await beat.save();

    // Also save to unified library
    try {
      const libraryItem = new LibraryItem({
        title: beat.title,
        type: 'beat',
        bpm: beat.bpm,
        key: beat.key,
        duration: beat.durationSeconds,
        mood: beat.mood,
        genre: beat.genre,
        tags: beat.tags,
        fileUrl: beat.fileUrl,
        previewUrl: beat.previewUrl,
        producerName: beat.producerName,
        source: beat.source === 'pattern' ? 'ai-generated' : beat.source,
        sourceId: beat._id.toString(),
        pattern: beat.pattern,
        status: 'ready',
        ownerUserId: req.user?._id,
      });
      await libraryItem.save();
      beat.libraryItemId = libraryItem._id;
      await beat.save();
    } catch (libErr) {
      console.warn('⚠️ [BeatStore] Library item save failed:', libErr.message);
    }

    // Create royalty entry if requested
    let royaltySplit = null;
    if (createRoyaltySplit) {
      try {
        royaltySplit = await createRoyaltyEntryForBeat(beat);
        if (royaltySplit) {
          beat.royaltySplitId = royaltySplit._id;
          await beat.save();
        }
      } catch (royaltyErr) {
        console.warn('⚠️ [BeatStore] Royalty entry creation failed:', royaltyErr.message);
      }
    }

    console.log(`💾 [BeatStore] Beat saved: ${beat.title} (${beat._id})`);

    res.status(201).json({
      ok: true,
      beat: beat.toStoreFormat ? beat.toStoreFormat() : beat,
      beatId: beat._id,
      libraryItemId: beat.libraryItemId,
      royaltySplitId: royaltySplit?._id,
      message: 'Beat saved to Beat Store',
    });

  } catch (err) {
    console.error('❌ [BeatStore] Save error:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * Update a beat
 * PUT /api/studio/beats/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const beat = await Beat.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!beat) {
      return res.status(404).json({ ok: false, message: 'Beat not found' });
    }

    res.json({ ok: true, beat });

  } catch (err) {
    console.error('❌ [BeatStore] Update error:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * Delete a beat
 * DELETE /api/studio/beats/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const beat = await Beat.findByIdAndDelete(req.params.id);

    if (!beat) {
      return res.status(404).json({ ok: false, message: 'Beat not found' });
    }

    // Also remove from library
    await LibraryItem.deleteOne({ sourceId: req.params.id, type: 'beat' });

    res.json({ ok: true, message: 'Beat deleted' });

  } catch (err) {
    console.error('❌ [BeatStore] Delete error:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

// ==========================================
// SEED DATA (for demo when DB is empty)
// ==========================================

const SEED_BEATS = [
  {
    _id: 'seed1',
    title: 'No Limit East Houston Type Beat',
    producer: 'Studio AI',
    bpm: 140,
    key: 'C minor',
    duration: 180,
    mood: 'dark',
    genre: 'trap',
    tags: ['trap', 'south', 'bounce', 'houston'],
    previewUrl: 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg',
    price: 0,
    plays: 245,
    source: 'seed',
  },
  {
    _id: 'seed2',
    title: 'Southern Soul Vibes',
    producer: 'PowerHarmony',
    bpm: 85,
    key: 'G major',
    duration: 200,
    mood: 'soulful',
    genre: 'rnb',
    tags: ['soul', 'rnb', 'smooth', 'southern'],
    previewUrl: 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg',
    price: 0,
    plays: 189,
    source: 'seed',
  },
  {
    _id: 'seed3',
    title: 'Drill Energy',
    producer: 'Studio AI',
    bpm: 145,
    key: 'F# minor',
    duration: 150,
    mood: 'aggressive',
    genre: 'drill',
    tags: ['drill', 'dark', 'aggressive', 'uk'],
    previewUrl: 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg',
    price: 0,
    plays: 312,
    source: 'seed',
  },
  {
    _id: 'seed4',
    title: 'Gospel Keys',
    producer: 'PowerHarmony',
    bpm: 100,
    key: 'Bb major',
    duration: 240,
    mood: 'uplifting',
    genre: 'gospel',
    tags: ['gospel', 'uplifting', 'piano', 'spiritual'],
    previewUrl: 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg',
    price: 0,
    plays: 156,
    source: 'seed',
  },
];

export default router;





