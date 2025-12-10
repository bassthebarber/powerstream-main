// backend/recordingStudio/ai/studio/beatEngine.js
// Real AI Beat Generation Engine - Supports MusicGen API

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import Beat from '../../models/Beat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration from environment
const MUSICGEN_API_BASE = process.env.MUSICGEN_API_BASE || 'http://localhost:9100';
const MUSICGEN_API_KEY = process.env.MUSICGEN_API_KEY || '';
const BEAT_OUTPUT_DIR = process.env.BEAT_OUTPUT_DIR || path.join(__dirname, '../../output/beats');

// Ensure output directory exists
await fs.ensureDir(BEAT_OUTPUT_DIR);

/**
 * Generate a beat using MusicGen API or fallback to demo mode
 * @param {Object} params - Beat generation parameters
 * @returns {Promise<Object>} Generated beat info with file URL
 */
export async function generateBeat({
  prompt,
  bpm = 90,
  key = 'C minor',
  mood = 'dark',
  style = 'trap',
  lengthSeconds = 30,
  ownerUserId = null,
}) {
  const startTime = Date.now();
  console.log(`🎹 [BeatEngine] Generating beat: ${bpm} BPM, ${key}, ${mood}, ${style}`);

  // Build prompt if not provided
  const finalPrompt = prompt || buildMusicGenPrompt({ bpm, key, mood, style });

  try {
    // Try MusicGen API first
    const musicGenResult = await callMusicGenAPI({
      prompt: finalPrompt,
      duration: lengthSeconds,
      bpm,
    });

    if (musicGenResult.success) {
      // Save beat to database
      const beat = await saveBeatToDatabase({
        title: generateBeatTitle(mood, style, bpm),
        description: finalPrompt,
        bpm,
        key,
        mood,
        style,
        audioUrl: musicGenResult.audioUrl,
        previewUrl: musicGenResult.audioUrl,
        durationSeconds: lengthSeconds,
        source: 'musicgen',
        ownerUserId,
      });

      const processingTime = Date.now() - startTime;
      console.log(`✅ [BeatEngine] Generated via MusicGen in ${processingTime}ms`);

      return {
        success: true,
        beat,
        audioUrl: beat.audioUrl,
        processingTime,
        source: 'musicgen',
      };
    }
  } catch (err) {
    console.warn(`⚠️ [BeatEngine] MusicGen failed: ${err.message}, using fallback`);
  }

  // Fallback: Generate a pattern-based beat (no audio, but grid data)
  const fallbackResult = await generateFallbackBeat({ bpm, key, mood, style });
  
  // Save to database even in fallback mode
  const beat = await saveBeatToDatabase({
    title: generateBeatTitle(mood, style, bpm),
    description: `${mood} ${style} beat at ${bpm} BPM in ${key} (demo)`,
    bpm,
    key,
    mood,
    style,
    audioUrl: fallbackResult.audioUrl || null,
    previewUrl: null,
    durationSeconds: lengthSeconds,
    source: 'fallback',
    ownerUserId,
    pattern: fallbackResult.pattern,
  });

  const processingTime = Date.now() - startTime;
  console.log(`✅ [BeatEngine] Generated fallback pattern in ${processingTime}ms`);

  return {
    success: true,
    beat,
    pattern: fallbackResult.pattern,
    suggestionText: fallbackResult.suggestionText,
    audioUrl: beat.audioUrl,
    processingTime,
    source: 'fallback',
  };
}

/**
 * Call MusicGen API
 */
async function callMusicGenAPI({ prompt, duration, bpm }) {
  // Check if MusicGen is configured
  if (!MUSICGEN_API_BASE || MUSICGEN_API_BASE === 'http://localhost:9100') {
    console.log('⚠️ [BeatEngine] MusicGen API not configured, will use fallback');
    throw new Error('MusicGen API not configured');
  }

  console.log(`🎵 [BeatEngine] Calling MusicGen: ${MUSICGEN_API_BASE}`);

  const headers = {
    'Content-Type': 'application/json',
  };
  if (MUSICGEN_API_KEY) {
    headers['Authorization'] = `Bearer ${MUSICGEN_API_KEY}`;
  }

  const response = await fetch(`${MUSICGEN_API_BASE}/api/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      prompt,
      duration,
      bpm,
      model: 'musicgen-small', // or musicgen-medium, musicgen-large
      format: 'mp3',
    }),
    timeout: 120000, // 2 minute timeout for generation
  });

  if (!response.ok) {
    throw new Error(`MusicGen API error: ${response.status}`);
  }

  const data = await response.json();

  // Handle different response formats
  let audioUrl = data.audio_url || data.url || data.audioUrl;

  // If we get binary audio back, save it locally
  if (data.audio_base64) {
    const buffer = Buffer.from(data.audio_base64, 'base64');
    const filename = `beat_${Date.now()}.mp3`;
    const filepath = path.join(BEAT_OUTPUT_DIR, filename);
    await fs.writeFile(filepath, buffer);

    // Upload to Cloudinary if configured
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const uploadResult = await cloudinary.uploader.upload(filepath, {
          resource_type: 'auto',
          folder: 'powerstream/beats',
          public_id: `beat_${Date.now()}`,
        });
        audioUrl = uploadResult.secure_url;
        // Clean up local file
        await fs.remove(filepath);
      } catch (cloudErr) {
        console.warn('☁️ Cloudinary upload failed:', cloudErr.message);
        audioUrl = `/api/beats/download/${filename}`;
      }
    } else {
      audioUrl = `/api/beats/download/${filename}`;
    }
  }

  return {
    success: true,
    audioUrl,
  };
}

/**
 * Build MusicGen prompt from parameters
 */
function buildMusicGenPrompt({ bpm, key, mood, style }) {
  const moodDescriptors = {
    dark: 'dark, moody, atmospheric',
    uplifting: 'uplifting, energetic, positive',
    aggressive: 'aggressive, hard-hitting, intense',
    chill: 'chill, relaxed, smooth',
    melancholic: 'melancholic, emotional, sad',
    triumphant: 'triumphant, epic, victorious',
    eerie: 'eerie, haunting, mysterious',
  };

  const styleDescriptors = {
    trap: 'trap beat with 808 bass, hi-hats, and snare rolls',
    rnb: 'smooth R&B beat with warm chords and soft drums',
    hiphop: 'classic hip-hop boom bap beat with punchy drums',
    drill: 'UK drill beat with sliding 808s and dark melodies',
    'boom-bap': 'boom bap beat with sampled drums and jazzy elements',
    'lo-fi': 'lo-fi hip-hop beat with vinyl crackle and warm textures',
    pop: 'pop instrumental with catchy melody and modern production',
    southern: 'southern hip-hop beat with bouncy drums and trunk-rattling bass',
  };

  const moodDesc = moodDescriptors[mood] || mood;
  const styleDesc = styleDescriptors[style] || style;

  return `A ${moodDesc} ${styleDesc} at ${bpm} BPM in ${key}. Professional quality instrumental.`;
}

/**
 * Generate fallback beat pattern (no audio, just MIDI-like data)
 */
async function generateFallbackBeat({ bpm, key, mood, style }) {
  const steps = 16;

  // Mood-specific pattern configurations
  const moodConfigs = {
    trap: { kickDensity: 0.3, snareDensity: 0.2, hatDensity: 0.7, percDensity: 0.3 },
    drill: { kickDensity: 0.35, snareDensity: 0.25, hatDensity: 0.8, percDensity: 0.4 },
    chill: { kickDensity: 0.2, snareDensity: 0.15, hatDensity: 0.4, percDensity: 0.2 },
    aggressive: { kickDensity: 0.4, snareDensity: 0.3, hatDensity: 0.85, percDensity: 0.5 },
    default: { kickDensity: 0.25, snareDensity: 0.2, hatDensity: 0.5, percDensity: 0.25 },
  };

  const config = moodConfigs[mood] || moodConfigs[style] || moodConfigs.default;

  // Generate pattern
  const pattern = {
    kick: generateTrackPattern(steps, config.kickDensity, [0, 6, 10]),
    snare: generateTrackPattern(steps, config.snareDensity, [4, 12]),
    hat: generateTrackPattern(steps, config.hatDensity, []),
    perc: generateTrackPattern(steps, config.percDensity, []),
  };

  // Suggestion text
  const suggestions = {
    trap: 'Classic trap bounce. Add 808 slides for extra bounce.',
    drill: 'Aggressive drill energy. Layer with dark pads.',
    chill: 'Smooth and laid back. Perfect for melodic vocals.',
    aggressive: 'Hard-hitting drums. Add distortion for extra grit.',
    default: 'Solid foundation. Add melody on top.',
  };

  return {
    pattern,
    suggestionText: suggestions[mood] || suggestions[style] || suggestions.default,
    audioUrl: null, // No audio in fallback mode
  };
}

/**
 * Generate a single track pattern
 */
function generateTrackPattern(steps, density, emphasisSteps = []) {
  const pattern = new Array(steps).fill(false);
  
  // Always hit emphasis steps
  for (const step of emphasisSteps) {
    if (step < steps) pattern[step] = true;
  }
  
  // Randomly fill other steps based on density
  for (let i = 0; i < steps; i++) {
    if (!emphasisSteps.includes(i) && Math.random() < density) {
      pattern[i] = true;
    }
  }
  
  return pattern;
}

/**
 * Generate a creative beat title
 */
function generateBeatTitle(mood, style, bpm) {
  const adjectives = ['Dark', 'Southern', 'Midnight', 'Golden', 'Street', 'Power', 'Silent', 'Epic', 'Royal'];
  const nouns = ['Dreams', 'Nights', 'Hustle', 'Crown', 'Streets', 'Empire', 'Legacy', 'Flow', 'Wave'];
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adj} ${noun} (${style} ${bpm}BPM)`;
}

/**
 * Save beat to database (with fallback for connection issues)
 */
async function saveBeatToDatabase(beatData) {
  try {
    const beat = new Beat({
      title: beatData.title,
      description: beatData.description,
      genre: beatData.style,
      bpm: beatData.bpm,
      key: beatData.key,
      mood: beatData.mood,
      tags: [beatData.mood, beatData.style, `${beatData.bpm}bpm`],
      fileUrl: beatData.audioUrl || 'demo',
      previewUrl: beatData.previewUrl,
      durationSeconds: beatData.durationSeconds,
      source: beatData.source,
      producerId: beatData.ownerUserId,
      pattern: beatData.pattern,
    });

    await beat.save();
    return beat;
  } catch (err) {
    console.warn('⚠️ [BeatEngine] Database save failed:', err.message);
    // Return a mock beat object if DB save fails
    return {
      _id: `temp_${Date.now()}`,
      title: beatData.title,
      description: beatData.description,
      genre: beatData.style,
      bpm: beatData.bpm,
      key: beatData.key,
      mood: beatData.mood,
      tags: [beatData.mood, beatData.style, `${beatData.bpm}bpm`],
      fileUrl: beatData.audioUrl || 'demo',
      source: 'memory',
      pattern: beatData.pattern,
      createdAt: new Date(),
    };
  }
}

/**
 * List beats from database with filters (with fallback for connection issues)
 */
export async function listBeats({
  genre,
  mood,
  minBpm,
  maxBpm,
  sort = 'newest',
  limit = 50,
  skip = 0,
}) {
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
      popular: { purchases: -1, createdAt: -1 },
      price_low: { price: 1 },
      price_high: { price: -1 },
    };

    const beats = await Beat.find(query)
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await Beat.countDocuments(query);

    return {
      beats: beats.map(b => ({
        _id: b._id,
        title: b.title,
        producer: 'Studio AI',
        bpm: b.bpm,
        key: b.key,
        mood: b.mood,
        genre: b.genre,
        tags: b.tags,
        previewUrl: b.fileUrl,
        audioUrl: b.fileUrl,
        price: b.price,
        source: b.source,
        createdAt: b.createdAt,
      })),
      total,
    };
  } catch (err) {
    console.warn('⚠️ [BeatEngine] Database query failed:', err.message);
    // Return empty array if DB query fails
    return { beats: [], total: 0 };
  }
}

/**
 * Get available beat styles
 */
export function getAvailableStyles() {
  return ["trap", "rnb", "hiphop", "drill", "boom-bap", "lo-fi", "pop", "southern", "gospel"];
}

/**
 * Get available moods
 */
export function getAvailableMoods() {
  return ["dark", "uplifting", "aggressive", "chill", "melancholic", "triumphant", "eerie"];
}

export default { 
  generateBeat, 
  listBeats, 
  getAvailableStyles, 
  getAvailableMoods 
};




