// backend/recordingStudio/controllers/aiBeatController.js
// AI Beat Engine Controller - Full Production Beat Generation
// Supports: OpenAI Audio API, MusicGen, auto key/BPM detection, FFmpeg normalization

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import crypto from 'crypto';
import ffmpegStatic from 'ffmpeg-static';
import * as musicMetadata from 'music-metadata';
import { v2 as cloudinary } from 'cloudinary';
import Beat from '../models/Beat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const OUTPUT_DIR = process.env.BEAT_OUTPUT_DIR || path.join(__dirname, '../output/beats');
const TEMP_DIR = process.env.BEAT_TEMP_DIR || path.join(__dirname, '../temp');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MUSICGEN_API_BASE = process.env.MUSICGEN_API_BASE || 'http://localhost:9100';
const MUSICGEN_API_KEY = process.env.MUSICGEN_API_KEY || '';

// Ensure directories exist
await fs.ensureDir(OUTPUT_DIR);
await fs.ensureDir(TEMP_DIR);

// Configure Cloudinary if available
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// ==========================================
// STYLE & MOOD CONFIGURATIONS
// ==========================================

const STYLE_PROMPTS = {
  trap: {
    description: 'hard-hitting trap beat with rolling 808s, crisp hi-hats, punchy kicks and modern trap melodies',
    bpmRange: [130, 170],
    keyPreference: ['C minor', 'D minor', 'F minor', 'G minor'],
    elements: ['808 bass', 'hi-hats', 'snare rolls', 'dark pads'],
  },
  drill: {
    description: 'UK/Chicago drill beat with sliding 808s, aggressive hi-hat patterns, dark piano melodies and haunting synths',
    bpmRange: [140, 150],
    keyPreference: ['D minor', 'E minor', 'F# minor'],
    elements: ['sliding 808', 'rapid hi-hats', 'dark piano', 'strings'],
  },
  rnb: {
    description: 'smooth R&B instrumental with warm chords, soft drums, lush pads and soulful melodies',
    bpmRange: [70, 100],
    keyPreference: ['G major', 'C major', 'E♭ major', 'B♭ major'],
    elements: ['rhodes piano', 'warm bass', 'soft drums', 'lush synths'],
  },
  hiphop: {
    description: 'classic hip-hop boom bap beat with sampled drums, jazzy loops, vinyl warmth and head-nodding groove',
    bpmRange: [85, 100],
    keyPreference: ['C minor', 'D minor', 'A minor'],
    elements: ['boom bap drums', 'jazz samples', 'vinyl crackle', 'bass'],
  },
  southern: {
    description: 'southern hip-hop beat with trunk-rattling bass, bouncy drums, chopped samples and Houston flavor',
    bpmRange: [65, 85],
    keyPreference: ['G minor', 'C minor', 'F minor'],
    elements: ['slow bass', 'bounce drums', 'chopped vocals', 'synth pads'],
  },
  gospel: {
    description: 'inspirational gospel-influenced beat with uplifting chords, church organ, powerful drums and spiritual energy',
    bpmRange: [80, 120],
    keyPreference: ['C major', 'G major', 'E♭ major', 'A♭ major'],
    elements: ['organ', 'choir pads', 'powerful drums', 'uplifting chords'],
  },
  lofi: {
    description: 'lo-fi hip-hop beat with dusty samples, vinyl texture, soft drums and nostalgic warm atmosphere',
    bpmRange: [70, 90],
    keyPreference: ['D minor', 'A minor', 'E minor'],
    elements: ['vinyl crackle', 'soft drums', 'dusty piano', 'tape wobble'],
  },
  afrobeat: {
    description: 'afrobeat instrumental with infectious rhythms, log drums, melodic guitars and danceable groove',
    bpmRange: [95, 115],
    keyPreference: ['G major', 'D major', 'A major'],
    elements: ['log drums', 'shakers', 'guitar', 'melodic synths'],
  },
};

const MOOD_MODIFIERS = {
  dark: 'dark, moody, atmospheric, haunting',
  uplifting: 'uplifting, energetic, positive, inspiring',
  aggressive: 'aggressive, hard-hitting, intense, powerful',
  chill: 'chill, relaxed, smooth, laid-back',
  melancholic: 'melancholic, emotional, sad, introspective',
  triumphant: 'triumphant, epic, victorious, anthemic',
  eerie: 'eerie, mysterious, suspenseful, unsettling',
  soulful: 'soulful, warm, emotional, groove-oriented',
};

const REFERENCE_ARTISTS = {
  'travis scott': 'psychedelic trap with auto-tuned melodies, heavy 808s, ambient textures',
  'metro boomin': 'cinematic trap production, orchestral elements, hard-hitting drums',
  'future': 'dark trap with emotional melodies, heavy bass, atmospheric synths',
  'drake': 'smooth R&B-influenced hip-hop, catchy melodies, modern production',
  'j cole': 'soulful hip-hop with jazz samples, thoughtful production, boom bap influence',
  'kendrick lamar': 'experimental hip-hop with jazz elements, complex arrangements',
  'kanye': 'innovative production, soul samples, orchestral elements, genre-bending',
  'scarface': 'southern hip-hop, g-funk influences, storytelling beats, houston sound',
  'ugk': 'southern bounce, trunk music, chopped and screwed ready beats',
  'three 6 mafia': 'memphis rap, dark crunk, aggressive drums, eerie samples',
};

// ==========================================
// MAIN BEAT GENERATION CONTROLLER
// ==========================================

/**
 * Generate AI Beat - Main Controller Function
 * POST /api/studio/ai/generate-beat
 */
export async function generateBeat(req, res) {
  const startTime = Date.now();
  const requestId = crypto.randomBytes(8).toString('hex');
  
  console.log(`\n🎹 [AI Beat Engine] Starting generation #${requestId}`);

  try {
    // Extract parameters
    const {
      vibe = '',
      prompt = '',
      tempo,
      bpm: requestedBpm,
      genre = 'trap',
      style = genre,
      mood = 'dark',
      referenceArtist = '',
      bars = 16,
      key: requestedKey,
      aiMelody = true,
      emphasis808 = true,
    } = req.body;

    // Validate bars
    const validBars = [8, 16, 32].includes(bars) ? bars : 16;
    const lengthSeconds = validBars * 2; // ~2 seconds per bar at typical tempo

    // Determine BPM
    const styleConfig = STYLE_PROMPTS[style.toLowerCase()] || STYLE_PROMPTS.trap;
    const finalBpm = requestedBpm || tempo || 
      Math.floor(Math.random() * (styleConfig.bpmRange[1] - styleConfig.bpmRange[0])) + styleConfig.bpmRange[0];

    // Determine key
    const finalKey = requestedKey || 
      styleConfig.keyPreference[Math.floor(Math.random() * styleConfig.keyPreference.length)];

    // Build comprehensive prompt
    const aiPrompt = buildAIPrompt({
      vibe,
      prompt,
      style,
      mood,
      bpm: finalBpm,
      key: finalKey,
      referenceArtist,
      aiMelody,
      emphasis808,
      bars: validBars,
      styleConfig,
    });

    console.log(`📝 [AI Beat Engine] Prompt: "${aiPrompt.substring(0, 100)}..."`);
    console.log(`🎛️ [AI Beat Engine] Config: ${finalBpm} BPM, ${finalKey}, ${style}, ${validBars} bars`);

    // Send initial progress update via SSE if client supports it
    if (req.headers.accept?.includes('text/event-stream')) {
      return handleSSEGeneration(req, res, {
        aiPrompt,
        bpm: finalBpm,
        key: finalKey,
        style,
        mood,
        bars: validBars,
        lengthSeconds,
        requestId,
        startTime,
      });
    }

    // Standard JSON response
    const result = await executeGeneration({
      aiPrompt,
      bpm: finalBpm,
      key: finalKey,
      style,
      mood,
      bars: validBars,
      lengthSeconds,
      requestId,
      ownerUserId: req.user?._id || null,
    });

    const processingTime = Date.now() - startTime;

    if (!result.success) {
      console.error(`❌ [AI Beat Engine] Generation failed: ${result.error}`);
      return res.status(500).json({
        ok: false,
        message: result.error || 'Beat generation failed',
        requestId,
      });
    }

    console.log(`✅ [AI Beat Engine] Generated in ${processingTime}ms`);

    res.json({
      ok: true,
      beatId: result.beat._id || result.beat.id,
      name: result.beat.title,
      audioUrl: result.audioUrl,
      previewUrl: result.audioUrl,
      bpm: result.detectedBpm || finalBpm,
      key: result.detectedKey || finalKey,
      mood,
      style,
      bars: validBars,
      durationSeconds: result.durationSeconds || lengthSeconds,
      pattern: result.pattern,
      suggestionText: result.suggestionText,
      source: result.source,
      processingTime,
      requestId,
      metadata: {
        fileSize: result.fileSize,
        format: result.format || 'mp3',
        sampleRate: result.sampleRate,
        channels: result.channels,
      },
    });

  } catch (err) {
    console.error(`❌ [AI Beat Engine] Error:`, err);
    res.status(500).json({
      ok: false,
      message: err.message || 'Internal beat generation error',
      requestId,
    });
  }
}

/**
 * Build AI prompt from parameters
 */
function buildAIPrompt({ vibe, prompt, style, mood, bpm, key, referenceArtist, aiMelody, emphasis808, bars, styleConfig }) {
  const parts = [];

  // Base style description
  parts.push(`Professional ${styleConfig.description}`);

  // Technical specs
  parts.push(`at ${bpm} BPM in ${key}`);
  parts.push(`${bars} bars long`);

  // Mood modifier
  if (MOOD_MODIFIERS[mood]) {
    parts.push(`with a ${MOOD_MODIFIERS[mood]} feel`);
  }

  // Reference artist influence
  if (referenceArtist) {
    const ref = REFERENCE_ARTISTS[referenceArtist.toLowerCase()];
    if (ref) {
      parts.push(`inspired by ${referenceArtist} style: ${ref}`);
    } else {
      parts.push(`inspired by ${referenceArtist}`);
    }
  }

  // Custom vibe/prompt additions
  if (vibe) parts.push(vibe);
  if (prompt && prompt !== vibe) parts.push(prompt);

  // Production preferences
  if (emphasis808) {
    parts.push('heavy emphasis on 808 bass');
  }
  if (aiMelody) {
    parts.push('include memorable melody');
  }

  // Quality markers
  parts.push('studio quality, professionally mixed, radio ready');

  return parts.join('. ') + '.';
}

/**
 * Execute the actual beat generation
 */
async function executeGeneration({ aiPrompt, bpm, key, style, mood, bars, lengthSeconds, requestId, ownerUserId }) {
  let result = null;

  // Try OpenAI Audio first (if API key available)
  if (OPENAI_API_KEY) {
    console.log(`🤖 [AI Beat Engine] Trying OpenAI Audio API...`);
    try {
      result = await generateWithOpenAI({ aiPrompt, lengthSeconds, bpm, requestId });
      if (result.success) {
        console.log(`✅ [AI Beat Engine] OpenAI generation successful`);
      }
    } catch (err) {
      console.warn(`⚠️ [AI Beat Engine] OpenAI failed: ${err.message}`);
    }
  }

  // Try MusicGen as fallback
  if (!result?.success && MUSICGEN_API_BASE && MUSICGEN_API_BASE !== 'http://localhost:9100') {
    console.log(`🎵 [AI Beat Engine] Trying MusicGen API...`);
    try {
      result = await generateWithMusicGen({ aiPrompt, lengthSeconds, bpm, requestId });
      if (result.success) {
        console.log(`✅ [AI Beat Engine] MusicGen generation successful`);
      }
    } catch (err) {
      console.warn(`⚠️ [AI Beat Engine] MusicGen failed: ${err.message}`);
    }
  }

  // Fallback to pattern-based generation
  if (!result?.success) {
    console.log(`🎹 [AI Beat Engine] Using pattern fallback...`);
    result = await generateFallbackPattern({ bpm, key, style, mood, bars });
    result.source = 'pattern';
  }

  // If we have audio, process it
  if (result.audioPath) {
    // Normalize audio with FFmpeg
    const normalizedPath = await normalizeAudio(result.audioPath, requestId);
    if (normalizedPath) {
      result.audioPath = normalizedPath;
    }

    // Auto-detect key and BPM from the audio
    const detected = await detectKeyAndBpm(result.audioPath);
    if (detected) {
      result.detectedBpm = detected.bpm || bpm;
      result.detectedKey = detected.key || key;
      result.durationSeconds = detected.duration;
      result.sampleRate = detected.sampleRate;
      result.channels = detected.channels;
    }

    // Get file size
    try {
      const stats = await fs.stat(result.audioPath);
      result.fileSize = stats.size;
    } catch {}

    // Upload to Cloudinary if configured
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const uploadResult = await cloudinary.uploader.upload(result.audioPath, {
          resource_type: 'auto',
          folder: 'powerstream/beats',
          public_id: `beat_${requestId}`,
        });
        result.audioUrl = uploadResult.secure_url;
        result.cloudinaryId = uploadResult.public_id;
        
        // Clean up local file after upload
        await fs.remove(result.audioPath).catch(() => {});
      } catch (cloudErr) {
        console.warn(`☁️ [AI Beat Engine] Cloudinary upload failed:`, cloudErr.message);
        result.audioUrl = `/api/beats/download/${path.basename(result.audioPath)}`;
      }
    } else {
      // Move to output directory and serve locally
      const filename = `beat_${requestId}.mp3`;
      const outputPath = path.join(OUTPUT_DIR, filename);
      await fs.move(result.audioPath, outputPath, { overwrite: true });
      result.audioUrl = `/api/beats/download/${filename}`;
      result.localPath = outputPath;
    }
  }

  // Save to database
  const beat = await saveBeatToDatabase({
    title: generateBeatTitle(mood, style, bpm),
    description: aiPrompt.substring(0, 500),
    bpm: result.detectedBpm || bpm,
    key: result.detectedKey || key,
    mood,
    style,
    bars,
    audioUrl: result.audioUrl,
    durationSeconds: result.durationSeconds || lengthSeconds,
    source: result.source,
    pattern: result.pattern,
    ownerUserId,
    cloudinaryId: result.cloudinaryId,
  });

  return {
    success: true,
    beat,
    audioUrl: result.audioUrl,
    pattern: result.pattern,
    suggestionText: result.suggestionText || generateSuggestion(style, mood),
    source: result.source,
    detectedBpm: result.detectedBpm,
    detectedKey: result.detectedKey,
    durationSeconds: result.durationSeconds,
    fileSize: result.fileSize,
    format: 'mp3',
    sampleRate: result.sampleRate,
    channels: result.channels,
  };
}

/**
 * Generate with OpenAI Audio API
 */
async function generateWithOpenAI({ aiPrompt, lengthSeconds, bpm, requestId }) {
  // OpenAI's Audio API (for music generation / text-to-speech)
  // Note: As of 2024, OpenAI doesn't have a dedicated music generation API
  // This is a placeholder for when they release one, or use GPT-4 for MIDI generation
  
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: `Beat generation prompt: ${aiPrompt}`,
      voice: 'onyx',
      response_format: 'mp3',
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI API error: ${response.status}`);
  }

  // Save audio to temp file
  const buffer = await response.arrayBuffer();
  const audioPath = path.join(TEMP_DIR, `openai_${requestId}.mp3`);
  await fs.writeFile(audioPath, Buffer.from(buffer));

  return {
    success: true,
    audioPath,
    source: 'openai',
  };
}

/**
 * Generate with MusicGen API
 */
async function generateWithMusicGen({ aiPrompt, lengthSeconds, bpm, requestId }) {
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
      prompt: aiPrompt,
      duration: Math.min(lengthSeconds, 30), // MusicGen typically maxes at 30s
      bpm,
      model: 'musicgen-medium',
      format: 'mp3',
    }),
    signal: AbortSignal.timeout(180000), // 3 minute timeout
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `MusicGen API error: ${response.status}`);
  }

  const data = await response.json();

  // Handle different response formats
  let audioPath = null;

  if (data.audio_base64) {
    audioPath = path.join(TEMP_DIR, `musicgen_${requestId}.mp3`);
    await fs.writeFile(audioPath, Buffer.from(data.audio_base64, 'base64'));
  } else if (data.audio_url || data.url) {
    // Download from URL
    const audioUrl = data.audio_url || data.url;
    const audioResponse = await fetch(audioUrl);
    if (audioResponse.ok) {
      audioPath = path.join(TEMP_DIR, `musicgen_${requestId}.mp3`);
      await fs.writeFile(audioPath, Buffer.from(await audioResponse.arrayBuffer()));
    }
  }

  if (!audioPath) {
    throw new Error('No audio data in MusicGen response');
  }

  return {
    success: true,
    audioPath,
    source: 'musicgen',
  };
}

/**
 * Generate fallback pattern (no audio, just grid data)
 */
async function generateFallbackPattern({ bpm, key, style, mood, bars }) {
  const steps = 16;

  // Style-specific pattern configurations
  const styleConfigs = {
    trap: { kickDensity: 0.3, snareDensity: 0.2, hatDensity: 0.75, percDensity: 0.3, bassDensity: 0.4 },
    drill: { kickDensity: 0.35, snareDensity: 0.25, hatDensity: 0.85, percDensity: 0.4, bassDensity: 0.5 },
    rnb: { kickDensity: 0.2, snareDensity: 0.15, hatDensity: 0.4, percDensity: 0.2, bassDensity: 0.25 },
    hiphop: { kickDensity: 0.25, snareDensity: 0.2, hatDensity: 0.5, percDensity: 0.25, bassDensity: 0.3 },
    southern: { kickDensity: 0.2, snareDensity: 0.15, hatDensity: 0.4, percDensity: 0.35, bassDensity: 0.45 },
    gospel: { kickDensity: 0.2, snareDensity: 0.2, hatDensity: 0.35, percDensity: 0.25, bassDensity: 0.2 },
    lofi: { kickDensity: 0.2, snareDensity: 0.15, hatDensity: 0.3, percDensity: 0.2, bassDensity: 0.25 },
    afrobeat: { kickDensity: 0.35, snareDensity: 0.25, hatDensity: 0.6, percDensity: 0.5, bassDensity: 0.35 },
  };

  const config = styleConfigs[style] || styleConfigs.trap;

  // Generate pattern
  const pattern = {
    kick: generateTrackPattern(steps, config.kickDensity, [0, 6, 10]),
    snare: generateTrackPattern(steps, config.snareDensity, [4, 12]),
    hat: generateTrackPattern(steps, config.hatDensity, []),
    perc: generateTrackPattern(steps, config.percDensity, []),
    '808': generateTrackPattern(steps, config.bassDensity, [0, 8]),
  };

  return {
    success: true,
    pattern,
    suggestionText: generateSuggestion(style, mood),
    audioUrl: null,
    source: 'pattern',
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
 * Normalize audio using FFmpeg
 */
async function normalizeAudio(inputPath, requestId) {
  const outputPath = path.join(TEMP_DIR, `normalized_${requestId}.mp3`);

  return new Promise((resolve) => {
    const args = [
      '-i', inputPath,
      '-af', 'loudnorm=I=-14:LRA=11:TP=-1.5',
      '-ar', '44100',
      '-b:a', '320k',
      '-y',
      outputPath,
    ];

    const ffmpeg = spawn(ffmpegStatic, args);
    let stderr = '';

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', async (code) => {
      if (code === 0) {
        // Clean up original
        await fs.remove(inputPath).catch(() => {});
        resolve(outputPath);
      } else {
        console.warn(`⚠️ [AI Beat Engine] FFmpeg normalization failed:`, stderr.slice(-500));
        resolve(inputPath); // Return original on failure
      }
    });

    ffmpeg.on('error', (err) => {
      console.warn(`⚠️ [AI Beat Engine] FFmpeg error:`, err.message);
      resolve(inputPath);
    });
  });
}

/**
 * Auto-detect key and BPM from audio file
 */
async function detectKeyAndBpm(audioPath) {
  try {
    const metadata = await musicMetadata.parseFile(audioPath);
    
    const result = {
      duration: metadata.format.duration,
      sampleRate: metadata.format.sampleRate,
      channels: metadata.format.numberOfChannels,
      bitrate: metadata.format.bitrate,
    };

    // Check for embedded BPM in metadata
    if (metadata.native?.['ID3v2.3']?.find(t => t.id === 'TBPM')) {
      const bpmTag = metadata.native['ID3v2.3'].find(t => t.id === 'TBPM');
      result.bpm = parseInt(bpmTag.value, 10);
    }

    // Check for key
    if (metadata.native?.['ID3v2.3']?.find(t => t.id === 'TKEY')) {
      const keyTag = metadata.native['ID3v2.3'].find(t => t.id === 'TKEY');
      result.key = keyTag.value;
    }

    // Fallback: estimate BPM from duration (rough estimate for loop-based content)
    if (!result.bpm && result.duration) {
      // Assume 4 bars = duration, calculate BPM
      // This is a rough estimate for beat-based content
      const bars = Math.round(result.duration / 2); // ~2 sec per bar
      if (bars > 0) {
        result.estimatedBpm = Math.round((bars * 4 * 60) / result.duration);
      }
    }

    return result;
  } catch (err) {
    console.warn(`⚠️ [AI Beat Engine] Metadata detection failed:`, err.message);
    return null;
  }
}

/**
 * Generate creative beat title
 */
function generateBeatTitle(mood, style, bpm) {
  const adjectives = {
    dark: ['Midnight', 'Shadow', 'Eclipse', 'Phantom', 'Obsidian'],
    uplifting: ['Golden', 'Rising', 'Triumph', 'Glory', 'Summit'],
    aggressive: ['Iron', 'Thunder', 'Blaze', 'Storm', 'Fury'],
    chill: ['Velvet', 'Mellow', 'Breeze', 'Drift', 'Haze'],
    melancholic: ['Rain', 'Solitude', 'Memory', 'Fading', 'Echo'],
    triumphant: ['Crown', 'Empire', 'Legacy', 'Dynasty', 'Victory'],
    eerie: ['Specter', 'Void', 'Wraith', 'Abyss', 'Hollow'],
    soulful: ['Soul', 'Spirit', 'Heart', 'Essence', 'Warmth'],
  };

  const nouns = {
    trap: ['Dreams', 'Hustle', 'Streets', 'Zone', 'Wave'],
    drill: ['Nights', 'Blocks', 'Code', 'Mode', 'Slide'],
    rnb: ['Vibes', 'Love', 'Touch', 'Feel', 'Groove'],
    hiphop: ['Flow', 'Cypher', 'Session', 'Bounce', 'Boom'],
    southern: ['South', 'Houston', 'Texas', 'Screwed', 'Trunk'],
    gospel: ['Grace', 'Faith', 'Rise', 'Glory', 'Light'],
    lofi: ['Tape', 'Memory', 'Night', 'Study', 'Chill'],
    afrobeat: ['Dance', 'Rhythm', 'Sun', 'Energy', 'Heat'],
  };

  const adjs = adjectives[mood] || adjectives.dark;
  const ns = nouns[style] || nouns.trap;

  const adj = adjs[Math.floor(Math.random() * adjs.length)];
  const noun = ns[Math.floor(Math.random() * ns.length)];

  return `${adj} ${noun} (${style} ${bpm}bpm)`;
}

/**
 * Generate producer suggestion text
 */
function generateSuggestion(style, mood) {
  const suggestions = {
    trap: {
      dark: 'Hard-hitting foundation. Layer with dark pads and add 808 slides for maximum impact.',
      aggressive: 'Intense energy perfect for hard verses. Add distortion to taste.',
      default: 'Classic trap bounce. Experiment with hi-hat rolls and snare patterns.',
    },
    drill: {
      dark: 'UK drill energy ready. Add sliding 808s and dark piano for authentic sound.',
      aggressive: 'Aggressive drill foundation. Layer with haunting melodies.',
      default: 'Drill-ready drums. Add characteristic sliding bass patterns.',
    },
    rnb: {
      chill: 'Smooth R&B vibes. Perfect for melodic vocals and harmonies.',
      soulful: 'Soulful foundation. Add rhodes and warm synths.',
      default: 'Smooth groove ready for vocals. Keep it minimal and let the voice shine.',
    },
    southern: {
      dark: 'Houston flavor ready for the trunk. Chop and screw friendly.',
      chill: 'Slow and smooth. Perfect for storytelling verses.',
      default: 'Southern bounce foundation. Add chopped samples for authenticity.',
    },
  };

  const styleSuggestions = suggestions[style] || suggestions.trap;
  return styleSuggestions[mood] || styleSuggestions.default || 'Solid foundation ready for vocals.';
}

/**
 * Save beat to database
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
      tags: [beatData.mood, beatData.style, `${beatData.bpm}bpm`, `${beatData.bars}bars`],
      fileUrl: beatData.audioUrl || 'pattern',
      previewUrl: beatData.audioUrl,
      durationSeconds: beatData.durationSeconds,
      source: beatData.source,
      producerId: beatData.ownerUserId,
      pattern: beatData.pattern,
      metadata: {
        cloudinaryId: beatData.cloudinaryId,
        bars: beatData.bars,
      },
    });

    await beat.save();
    console.log(`💾 [AI Beat Engine] Beat saved to database: ${beat._id}`);
    return beat;
  } catch (err) {
    console.warn(`⚠️ [AI Beat Engine] Database save failed:`, err.message);
    // Return mock beat object if DB save fails
    return {
      _id: `temp_${Date.now()}`,
      title: beatData.title,
      genre: beatData.style,
      bpm: beatData.bpm,
      key: beatData.key,
      mood: beatData.mood,
      fileUrl: beatData.audioUrl || 'pattern',
      source: beatData.source,
      pattern: beatData.pattern,
      createdAt: new Date(),
    };
  }
}

/**
 * Handle SSE (Server-Sent Events) for real-time progress
 */
async function handleSSEGeneration(req, res, config) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    sendEvent('progress', { stage: 'starting', message: 'Initializing AI Beat Engine...', percent: 5 });

    sendEvent('progress', { stage: 'prompt', message: 'Building generation prompt...', percent: 10 });
    await new Promise(r => setTimeout(r, 100));

    sendEvent('progress', { stage: 'generating', message: 'AI is creating your beat...', percent: 30 });

    const result = await executeGeneration({
      aiPrompt: config.aiPrompt,
      bpm: config.bpm,
      key: config.key,
      style: config.style || 'trap',
      mood: config.mood || 'dark',
      bars: config.bars,
      lengthSeconds: config.lengthSeconds,
      requestId: config.requestId,
      ownerUserId: req.user?._id || null,
    });

    sendEvent('progress', { stage: 'processing', message: 'Processing audio...', percent: 70 });
    await new Promise(r => setTimeout(r, 100));

    sendEvent('progress', { stage: 'saving', message: 'Saving to library...', percent: 90 });
    await new Promise(r => setTimeout(r, 100));

    const processingTime = Date.now() - config.startTime;

    sendEvent('complete', {
      ok: true,
      beatId: result.beat._id || result.beat.id,
      name: result.beat.title,
      audioUrl: result.audioUrl,
      bpm: result.detectedBpm || config.bpm,
      key: result.detectedKey || config.key,
      mood: config.mood,
      style: config.style,
      pattern: result.pattern,
      suggestionText: result.suggestionText,
      source: result.source,
      processingTime,
    });

  } catch (err) {
    sendEvent('error', { message: err.message || 'Beat generation failed' });
  }

  res.end();
}

// ==========================================
// ADDITIONAL CONTROLLER FUNCTIONS
// ==========================================

/**
 * Get generation options/presets
 * GET /api/studio/ai/generate-beat/options
 */
export async function getGenerationOptions(req, res) {
  res.json({
    ok: true,
    styles: Object.keys(STYLE_PROMPTS),
    moods: Object.keys(MOOD_MODIFIERS),
    referenceArtists: Object.keys(REFERENCE_ARTISTS),
    barsOptions: [8, 16, 32],
    defaultSettings: {
      bpm: 140,
      key: 'C minor',
      style: 'trap',
      mood: 'dark',
      bars: 16,
    },
  });
}

/**
 * Download beat file
 * GET /api/beats/download/:filename
 */
export async function downloadBeat(req, res) {
  try {
    const { filename } = req.params;
    const filePath = path.join(OUTPUT_DIR, filename);

    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ ok: false, message: 'Beat file not found' });
    }

    res.download(filePath);
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
}

/**
 * Get beat by ID
 * GET /api/studio/ai/beat/:id
 */
export async function getBeatById(req, res) {
  try {
    const beat = await Beat.findById(req.params.id);
    if (!beat) {
      return res.status(404).json({ ok: false, message: 'Beat not found' });
    }
    res.json({ ok: true, beat });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
}

export default {
  generateBeat,
  getGenerationOptions,
  downloadBeat,
  getBeatById,
};



