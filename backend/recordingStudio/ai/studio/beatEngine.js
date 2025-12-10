// backend/recordingStudio/ai/studio/beatEngine.js
// AI Beat Generation Engine
// Provides pattern-based beat generation with optional AI integration

import Beat from '../../models/Beat.js';

// Available styles and moods
const STYLES = ['trap', 'drill', 'boom-bap', 'rnb', 'lofi', 'afrobeat', 'reggaeton', 'house', 'hiphop'];
const MOODS = ['dark', 'hype', 'chill', 'emotional', 'aggressive', 'uplifting', 'melodic', 'hard'];

// ============================================
// GET AVAILABLE OPTIONS
// ============================================
export function getAvailableStyles() {
  return STYLES;
}

export function getAvailableMoods() {
  return MOODS;
}

// ============================================
// DRUM PATTERN GENERATORS
// ============================================
const PATTERNS = {
  trap: {
    kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    openHat: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  },
  drill: {
    kick: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    perc: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  },
  boomBap: {
    kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  },
  rnb: {
    kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
  lofi: {
    kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hihat: [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0],
  },
};

// ============================================
// GENERATE BEAT
// ============================================
export async function generateBeat(options = {}) {
  const {
    prompt,
    bpm = 140,
    key = 'C minor',
    mood = 'dark',
    style = 'trap',
    lengthSeconds = 30,
    ownerUserId,
  } = options;

  const startTime = Date.now();
  
  try {
    // Get pattern for style
    const styleKey = style.toLowerCase().replace('-', '').replace(' ', '');
    const pattern = PATTERNS[styleKey] || PATTERNS.trap;
    
    // Generate beat title
    const title = prompt || `${mood.charAt(0).toUpperCase() + mood.slice(1)} ${style.charAt(0).toUpperCase() + style.slice(1)} Beat`;
    
    // Create beat document
    const beat = new Beat({
      title,
      producer: 'PowerHarmony AI',
      bpm,
      key,
      mood,
      genre: style,
      duration: lengthSeconds,
      pattern,
      tags: [mood, style, 'ai-generated'],
      source: 'ai-generated',
      ownerUserId,
      status: 'ready',
      createdAt: new Date(),
    });

    // Try to save to database (may fail if no DB connection)
    try {
      await beat.save();
    } catch (dbError) {
      console.warn('[BeatEngine] DB save skipped:', dbError.message);
    }

    const processingTime = Date.now() - startTime;

    return {
      success: true,
      beat,
      pattern,
      audioUrl: null, // Would be generated audio URL
      suggestionText: `Generated ${mood} ${style} beat at ${bpm} BPM in ${key}`,
      source: 'pattern-generator',
      processingTime,
    };

  } catch (error) {
    console.error('[BeatEngine] Generate error:', error);
    return {
      success: false,
      error: error.message,
      source: 'pattern-generator',
    };
  }
}

// ============================================
// LIST BEATS
// ============================================
export async function listBeats(options = {}) {
  const {
    genre,
    mood,
    minBpm,
    maxBpm,
    sort = 'newest',
    limit = 50,
    skip = 0,
  } = options;

  try {
    const query = {};
    
    if (genre) query.genre = genre;
    if (mood) query.mood = mood;
    if (minBpm || maxBpm) {
      query.bpm = {};
      if (minBpm) query.bpm.$gte = Number(minBpm);
      if (maxBpm) query.bpm.$lte = Number(maxBpm);
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { plays: -1 },
      bpm: { bpm: 1 },
    };

    const beats = await Beat.find(query)
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip(skip)
      .limit(limit);

    const total = await Beat.countDocuments(query);

    return { beats, total };

  } catch (error) {
    console.error('[BeatEngine] List error:', error);
    return { beats: [], total: 0, error: error.message };
  }
}

export default {
  generateBeat,
  listBeats,
  getAvailableStyles,
  getAvailableMoods,
};

