// backend/recordingStudio/controllers/masterController.js
// AI Mastering Engine Controller - Professional Audio Mastering
// Features: EQ, Compression, Stereo Spread, Limiting, Waveform Generation

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import crypto from 'crypto';
import ffmpegStatic from 'ffmpeg-static';
import { v2 as cloudinary } from 'cloudinary';
import Mixdown from '../models/Mixdown.js';
import LibraryItem from '../models/LibraryItem.js';
import { createRoyaltyEntryForMix } from '../services/royaltyService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const OUTPUT_DIR = process.env.MIX_OUTPUT_DIR || path.join(__dirname, '../output/mixes');
const TEMP_DIR = process.env.MIX_TEMP_DIR || path.join(__dirname, '../temp');
const FFMPEG_PATH = process.env.FFMPEG_PATH || ffmpegStatic;

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
// MASTERING PRESETS
// ==========================================

const MASTERING_PRESETS = {
  streaming: {
    name: 'Streaming Ready',
    description: 'Optimized for Spotify, Apple Music, YouTube (-14 LUFS)',
    loudnessTarget: -14,
    truePeakLimit: -1.0,
    eq: { lowCut: 30, lowBoost: 0, highBoost: 1.5 },
    compression: { ratio: 3, threshold: -12, attack: 15, release: 100 },
    stereoWidth: 110,
  },
  loud: {
    name: 'Loud Master',
    description: 'Maximum loudness for club/radio (-9 LUFS)',
    loudnessTarget: -9,
    truePeakLimit: -0.5,
    eq: { lowCut: 40, lowBoost: 2, highBoost: 2 },
    compression: { ratio: 6, threshold: -15, attack: 5, release: 80 },
    stereoWidth: 120,
  },
  dynamic: {
    name: 'Dynamic Master',
    description: 'Preserves dynamics for acoustic/jazz (-16 LUFS)',
    loudnessTarget: -16,
    truePeakLimit: -1.5,
    eq: { lowCut: 25, lowBoost: 0, highBoost: 1 },
    compression: { ratio: 2, threshold: -8, attack: 30, release: 200 },
    stereoWidth: 100,
  },
  hiphop: {
    name: 'Hip-Hop Master',
    description: 'Punchy bass, clear highs (-11 LUFS)',
    loudnessTarget: -11,
    truePeakLimit: -0.8,
    eq: { lowCut: 35, lowBoost: 3, highBoost: 2.5, midCut: -1 },
    compression: { ratio: 4, threshold: -14, attack: 8, release: 90 },
    stereoWidth: 115,
  },
  trap: {
    name: 'Trap Master',
    description: 'Heavy 808s, modern punch (-10 LUFS)',
    loudnessTarget: -10,
    truePeakLimit: -0.5,
    eq: { lowCut: 30, lowBoost: 4, subBoost: 2, highBoost: 3 },
    compression: { ratio: 5, threshold: -16, attack: 5, release: 60 },
    stereoWidth: 125,
  },
};

// ==========================================
// MAIN MASTERING CONTROLLER
// ==========================================

/**
 * Master an audio track with AI processing
 * POST /api/studio/ai/master
 */
export async function masterTrack(req, res) {
  const startTime = Date.now();
  const requestId = crypto.randomBytes(8).toString('hex');
  let tempFilePath = null;
  let mixdownDoc = null;

  console.log(`\n🎛️ [AI Master Engine] Starting mastering #${requestId}`);

  try {
    // Handle file from memory (multer) or path
    if (!req.file && !req.body.inputUrl && !req.body.inputPath) {
      return res.status(400).json({ 
        ok: false, 
        message: "No audio file provided. Upload a file or provide inputUrl/inputPath." 
      });
    }

    // Extract parameters
    const {
      trackName = 'Untitled',
      artistName = 'Unknown Artist',
      genre = 'hiphop',
      preset = 'streaming',
      // Custom mastering parameters (override preset)
      loudnessTarget,
      truePeakLimit,
      lowCut = 80,
      highBoost = 3, // +3dB at 12kHz
      compressionRatio = 4,
      compressionKnee = 'soft',
      stereoWidth = 120, // +20% = 120%
      outputFormat = 'mp3',
      outputBitrate = 320,
      generateWaveform = true,
      compareBeforeAfter = true,
    } = req.body;

    // Get preset defaults
    const presetConfig = MASTERING_PRESETS[preset] || MASTERING_PRESETS.streaming;

    // Merge custom settings with preset
    const settings = {
      loudnessTarget: loudnessTarget ?? presetConfig.loudnessTarget,
      truePeakLimit: truePeakLimit ?? presetConfig.truePeakLimit,
      eq: {
        lowCut: lowCut ?? presetConfig.eq.lowCut,
        lowBoost: presetConfig.eq.lowBoost || 0,
        highBoost: highBoost ?? presetConfig.eq.highBoost,
        midCut: presetConfig.eq.midCut || 0,
        subBoost: presetConfig.eq.subBoost || 0,
      },
      compression: {
        ratio: compressionRatio ?? presetConfig.compression.ratio,
        threshold: presetConfig.compression.threshold,
        attack: presetConfig.compression.attack,
        release: presetConfig.compression.release,
        knee: compressionKnee,
      },
      stereoWidth: stereoWidth ?? presetConfig.stereoWidth,
      outputFormat,
      outputBitrate,
    };

    console.log(`📝 [AI Master] Track: "${trackName}" by ${artistName}`);
    console.log(`🎚️ [AI Master] Preset: ${preset}, Target: ${settings.loudnessTarget} LUFS`);
    console.log(`🔊 [AI Master] Stereo Width: ${settings.stereoWidth}%`);

    // Save uploaded file to temp directory
    const timestamp = Date.now();
    let inputPath;

    if (req.file) {
      const ext = path.extname(req.file.originalname) || '.wav';
      const tempFilename = `master_input_${requestId}${ext}`;
      tempFilePath = path.join(TEMP_DIR, tempFilename);
      await fs.writeFile(tempFilePath, req.file.buffer);
      inputPath = tempFilePath;
      console.log(`💾 [AI Master] Saved upload: ${tempFilePath} (${req.file.size} bytes)`);
    } else if (req.body.inputPath) {
      inputPath = req.body.inputPath;
    } else {
      // Download from URL
      // TODO: Implement URL download
      return res.status(400).json({ ok: false, message: "URL input not yet implemented" });
    }

    // Create initial Mixdown document
    try {
      mixdownDoc = new Mixdown({
        trackTitle: trackName,
        artistName,
        genre,
        inputFilePath: inputPath,
        status: 'processing',
        processingChain: {
          eq: settings.eq,
          compressor: settings.compression,
          limiter: { ceiling: settings.truePeakLimit },
          loudnessTarget: settings.loudnessTarget,
        },
      });
      await mixdownDoc.save();
    } catch (dbErr) {
      console.warn('⚠️ [AI Master] DB save failed, continuing without:', dbErr.message);
    }

    // Analyze input audio
    console.log(`📊 [AI Master] Analyzing input...`);
    const inputMetrics = await analyzeAudio(inputPath);
    console.log(`📊 [AI Master] Input: ${inputMetrics.loudness?.toFixed(1) || '?'} LUFS, Peak: ${inputMetrics.truePeak?.toFixed(1) || '?'} dB`);

    // Generate waveform for input (before)
    let inputWaveform = null;
    if (generateWaveform && compareBeforeAfter) {
      inputWaveform = await generateWaveformData(inputPath, 'input');
    }

    // Build FFmpeg filter chain
    const filterChain = buildMasteringChain(settings);
    console.log(`🔧 [AI Master] Filter chain: ${filterChain.length} stages`);

    // Process audio with FFmpeg
    const safeTitle = trackName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40);
    const outputFilename = `${safeTitle}_master_${requestId}.${outputFormat}`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);

    console.log(`⚙️ [AI Master] Processing with FFmpeg...`);
    await runFFmpegMaster(inputPath, outputPath, filterChain, settings);

    // Analyze output
    console.log(`📊 [AI Master] Analyzing output...`);
    const outputMetrics = await analyzeAudio(outputPath);
    console.log(`📊 [AI Master] Output: ${outputMetrics.loudness?.toFixed(1) || '?'} LUFS, Peak: ${outputMetrics.truePeak?.toFixed(1) || '?'} dB`);

    // Generate waveform for output (after)
    let outputWaveform = null;
    if (generateWaveform) {
      outputWaveform = await generateWaveformData(outputPath, 'output');
    }

    // Get file stats
    const stats = await fs.stat(outputPath);
    const duration = outputMetrics.duration || 0;

    // Upload to Cloudinary if configured
    let downloadUrl = null;
    let cloudinaryId = null;

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const uploadResult = await cloudinary.uploader.upload(outputPath, {
          resource_type: 'auto',
          folder: 'powerstream/masters',
          public_id: `master_${requestId}`,
        });
        downloadUrl = uploadResult.secure_url;
        cloudinaryId = uploadResult.public_id;
        console.log(`☁️ [AI Master] Uploaded to Cloudinary`);
      } catch (cloudErr) {
        console.warn('⚠️ [AI Master] Cloudinary upload failed:', cloudErr.message);
      }
    }

    // Fallback to local URL
    if (!downloadUrl) {
      downloadUrl = `/api/mix/download/${outputFilename}`;
    }

    // Update database document
    if (mixdownDoc) {
      try {
        mixdownDoc.outputFilePath = outputPath;
        mixdownDoc.outputUrl = downloadUrl;
        mixdownDoc.loudnessIntegrated = outputMetrics.loudness;
        mixdownDoc.loudnessRange = outputMetrics.loudnessRange;
        mixdownDoc.truePeak = outputMetrics.truePeak;
        mixdownDoc.processingTime = Date.now() - startTime;
        mixdownDoc.fileSize = stats.size;
        mixdownDoc.duration = duration;
        mixdownDoc.format = outputFormat;
        mixdownDoc.bitrate = outputBitrate;
        mixdownDoc.status = 'completed';
        mixdownDoc.processingNotes = generateMasteringNotes(settings, inputMetrics, outputMetrics);
        await mixdownDoc.save();
      } catch (dbErr) {
        console.warn('⚠️ [AI Master] DB update failed:', dbErr.message);
      }
    }

    // Save to unified Library
    let libraryItemId = null;
    try {
      const libraryItem = new LibraryItem({
        title: trackName,
        type: 'mix',
        bpm: req.body.bpm,
        key: req.body.key,
        duration: duration,
        mood: req.body.mood,
        genre: genre,
        tags: [genre, preset, 'mastered'].filter(Boolean),
        fileUrl: downloadUrl,
        previewUrl: downloadUrl,
        artistName,
        producerName: 'AI Master Engine',
        description: generateMasteringNotes(settings, inputMetrics, outputMetrics),
        fileSize: stats.size,
        format: outputFormat,
        bitrate: outputBitrate,
        source: 'mastered',
        sourceId: mixdownDoc?._id?.toString(),
        loudnessIntegrated: outputMetrics.loudness,
        loudnessRange: outputMetrics.loudnessRange,
        truePeak: outputMetrics.truePeak,
        processingNotes: generateMasteringNotes(settings, inputMetrics, outputMetrics),
        processingChain: {
          eq: settings.eq,
          compression: settings.compression,
          stereoWidth: settings.stereoWidth,
          loudnessTarget: settings.loudnessTarget,
        },
        status: 'ready',
        visibility: 'private',
        ownerUserId: req.user?._id,
      });
      await libraryItem.save();
      libraryItemId = libraryItem._id;
      console.log(`📚 [AI Master] Saved to library: ${libraryItem.title}`);
    } catch (libErr) {
      console.warn('⚠️ [AI Master] Library save failed:', libErr.message);
    }

    // Create royalty entry for the mix
    let royaltySplitId = null;
    if (mixdownDoc) {
      try {
        const royaltySplit = await createRoyaltyEntryForMix(mixdownDoc, {
          contributors: [
            { name: artistName, role: 'artist', percentage: 100 },
          ],
        });
        royaltySplitId = royaltySplit?._id;
      } catch (royaltyErr) {
        console.warn('⚠️ [AI Master] Royalty entry failed:', royaltyErr.message);
      }
    }

    // Clean up temp input file
    if (tempFilePath) {
      await fs.remove(tempFilePath).catch(() => {});
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ [AI Master] Complete in ${processingTime}ms`);

    // Return comprehensive response
    res.json({
      ok: true,
      message: 'Mastering Complete',
      masterId: mixdownDoc?._id || `temp_${requestId}`,
      libraryItemId,
      royaltySplitId,
      requestId,
      
      // Track info
      trackName,
      artistName,
      genre,
      preset,
      
      // Metrics
      input: {
        loudness: inputMetrics.loudness,
        truePeak: inputMetrics.truePeak,
        loudnessRange: inputMetrics.loudnessRange,
        waveform: inputWaveform,
      },
      output: {
        loudness: outputMetrics.loudness,
        truePeak: outputMetrics.truePeak,
        loudnessRange: outputMetrics.loudnessRange,
        waveform: outputWaveform,
      },
      
      // For UI meters (0-100 scale)
      loudnessPercent: Math.round(Math.min(100, Math.max(0, (outputMetrics.loudness + 20) * 5))),
      peakPercent: Math.round(Math.min(100, Math.max(0, (outputMetrics.truePeak + 6) * 16))),
      
      // Processing info
      settings: {
        loudnessTarget: settings.loudnessTarget,
        truePeakLimit: settings.truePeakLimit,
        stereoWidth: settings.stereoWidth,
        compressionRatio: settings.compression.ratio,
        eq: settings.eq,
      },
      
      // Output
      downloadUrl,
      duration: Math.round(duration * 10) / 10,
      fileSize: stats.size,
      format: outputFormat,
      bitrate: outputBitrate,
      processingTime: `${(processingTime / 1000).toFixed(1)}s`,
      
      // Notes
      notes: generateMasteringNotes(settings, inputMetrics, outputMetrics),
    });

  } catch (err) {
    console.error(`❌ [AI Master] Error:`, err);

    // Update document status if created
    if (mixdownDoc) {
      try {
        mixdownDoc.status = 'failed';
        mixdownDoc.errorMessage = err.message;
        await mixdownDoc.save();
      } catch {}
    }

    // Clean up temp file
    if (tempFilePath) {
      await fs.remove(tempFilePath).catch(() => {});
    }

    res.status(500).json({
      ok: false,
      message: err.message || 'Mastering failed',
      requestId,
    });
  }
}

/**
 * Get available mastering presets
 * GET /api/studio/ai/master/presets
 */
export async function getMasteringPresets(req, res) {
  res.json({
    ok: true,
    presets: Object.entries(MASTERING_PRESETS).map(([key, value]) => ({
      id: key,
      name: value.name,
      description: value.description,
      loudnessTarget: value.loudnessTarget,
    })),
    defaultSettings: {
      lowCut: 80,
      highBoost: 3,
      compressionRatio: 4,
      stereoWidth: 120,
      loudnessTarget: -9,
    },
  });
}

/**
 * Compare before/after master
 * GET /api/studio/ai/master/compare/:id
 */
export async function compareMaster(req, res) {
  try {
    const { id } = req.params;
    const mixdown = await Mixdown.findById(id);

    if (!mixdown) {
      return res.status(404).json({ ok: false, message: 'Master not found' });
    }

    // Generate waveforms for both if paths exist
    let inputWaveform = null;
    let outputWaveform = null;

    if (mixdown.inputFilePath && await fs.pathExists(mixdown.inputFilePath)) {
      inputWaveform = await generateWaveformData(mixdown.inputFilePath, 'input');
    }

    if (mixdown.outputFilePath && await fs.pathExists(mixdown.outputFilePath)) {
      outputWaveform = await generateWaveformData(mixdown.outputFilePath, 'output');
    }

    res.json({
      ok: true,
      id: mixdown._id,
      trackTitle: mixdown.trackTitle,
      before: {
        waveform: inputWaveform,
        url: mixdown.inputUrl,
      },
      after: {
        waveform: outputWaveform,
        url: mixdown.outputUrl,
        loudness: mixdown.loudnessIntegrated,
        truePeak: mixdown.truePeak,
      },
      settings: mixdown.processingChain,
    });

  } catch (err) {
    console.error('❌ [AI Master] Compare error:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
}

// ==========================================
// FFMPEG PROCESSING FUNCTIONS
// ==========================================

/**
 * Build the mastering filter chain for FFmpeg
 */
function buildMasteringChain(settings) {
  const filters = [];

  // 1. HIGH-PASS FILTER (Low cut at specified frequency)
  // Remove sub-bass rumble
  filters.push(`highpass=f=${settings.eq.lowCut}:poles=2`);

  // 2. EQ CURVE
  // Low shelf boost (if specified)
  if (settings.eq.lowBoost && settings.eq.lowBoost !== 0) {
    filters.push(`equalizer=f=80:t=q:w=0.7:g=${settings.eq.lowBoost}`);
  }

  // Sub boost (for trap/bass music)
  if (settings.eq.subBoost && settings.eq.subBoost !== 0) {
    filters.push(`equalizer=f=50:t=q:w=0.5:g=${settings.eq.subBoost}`);
  }

  // Mid cut (optional for certain genres)
  if (settings.eq.midCut && settings.eq.midCut !== 0) {
    filters.push(`equalizer=f=400:t=q:w=1:g=${settings.eq.midCut}`);
  }

  // High shelf boost at 12kHz (+3dB default)
  if (settings.eq.highBoost && settings.eq.highBoost !== 0) {
    filters.push(`equalizer=f=12000:t=h:w=0.7:g=${settings.eq.highBoost}`);
  }

  // 3. COMPRESSOR (4:1 ratio, soft knee)
  // acompressor format: threshold:ratio:attack:release:makeup:knee
  const knee = settings.compression.knee === 'soft' ? 6 : 2;
  const attack = settings.compression.attack / 1000; // ms to seconds
  const release = settings.compression.release / 1000;
  filters.push(
    `acompressor=threshold=${settings.compression.threshold}dB:` +
    `ratio=${settings.compression.ratio}:` +
    `attack=${attack}:` +
    `release=${release}:` +
    `makeup=2:` +
    `knee=${knee}`
  );

  // 4. STEREO WIDTH ENHANCEMENT (+20% width = 120)
  // Using stereotools for precise width control
  if (settings.stereoWidth !== 100) {
    // stereotools: mlev=mid level, slev=side level
    // To increase width: boost sides relative to mid
    // Width 120% = slev slightly higher
    const widthMultiplier = settings.stereoWidth / 100;
    const sideLevel = Math.min(2, widthMultiplier);
    const midLevel = 1;
    filters.push(`stereotools=mlev=${midLevel}:slev=${sideLevel}:mode=lr>ms`);
  }

  // 5. LOUDNESS NORMALIZATION with LIMITER
  // loudnorm provides integrated loudness targeting with true peak limiting
  filters.push(
    `loudnorm=I=${settings.loudnessTarget}:` +
    `TP=${settings.truePeakLimit}:` +
    `LRA=11:` +
    `print_format=summary`
  );

  // 6. FINAL SAFETY LIMITER
  // Ensure no clips escape
  filters.push(
    `alimiter=` +
    `level_in=1:` +
    `level_out=1:` +
    `limit=${Math.abs(settings.truePeakLimit)}:` +
    `attack=5:` +
    `release=50:` +
    `asc=1:` +
    `asc_level=0.5`
  );

  return filters;
}

/**
 * Run FFmpeg with the mastering chain
 */
function runFFmpegMaster(inputPath, outputPath, filterChain, settings) {
  return new Promise((resolve, reject) => {
    const filterString = filterChain.join(',');

    const args = [
      '-i', inputPath,
      '-af', filterString,
      '-ar', '44100',
      '-ac', '2',
    ];

    // Output format settings
    if (settings.outputFormat === 'mp3') {
      args.push('-c:a', 'libmp3lame');
      args.push('-b:a', `${settings.outputBitrate}k`);
    } else if (settings.outputFormat === 'wav') {
      args.push('-c:a', 'pcm_s24le');
    } else if (settings.outputFormat === 'flac') {
      args.push('-c:a', 'flac');
    }

    args.push('-y', outputPath);

    console.log(`🎬 [AI Master] FFmpeg args: ${args.slice(0, 6).join(' ')} ...`);

    const ffmpeg = spawn(FFMPEG_PATH, args);
    let stderr = '';

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        console.error('❌ FFmpeg stderr:', stderr.slice(-1000));
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on('error', (err) => {
      reject(new Error(`FFmpeg spawn error: ${err.message}`));
    });
  });
}

/**
 * Analyze audio file for loudness metrics
 */
function analyzeAudio(filePath) {
  return new Promise((resolve) => {
    const args = [
      '-i', filePath,
      '-af', 'ebur128=peak=true',
      '-f', 'null',
      '-',
    ];

    const ffmpeg = spawn(FFMPEG_PATH, args);
    let stderr = '';

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', () => {
      // Parse EBU R128 output
      const metrics = {
        loudness: -16,
        loudnessRange: 8,
        truePeak: -1,
        duration: 0,
      };

      // Integrated loudness
      const intMatch = stderr.match(/I:\s*([-\d.]+)\s*LUFS/);
      if (intMatch) metrics.loudness = parseFloat(intMatch[1]);

      // Loudness range
      const lraMatch = stderr.match(/LRA:\s*([-\d.]+)\s*LU/);
      if (lraMatch) metrics.loudnessRange = parseFloat(lraMatch[1]);

      // True peak
      const tpMatch = stderr.match(/Peak:\s*([-\d.]+)\s*dBFS/);
      if (tpMatch) metrics.truePeak = parseFloat(tpMatch[1]);

      // Duration
      const durMatch = stderr.match(/Duration:\s*(\d+):(\d+):(\d+)\.(\d+)/);
      if (durMatch) {
        metrics.duration = 
          parseInt(durMatch[1]) * 3600 +
          parseInt(durMatch[2]) * 60 +
          parseInt(durMatch[3]) +
          parseInt(durMatch[4]) / 100;
      }

      resolve(metrics);
    });

    ffmpeg.on('error', () => {
      resolve({ loudness: -16, loudnessRange: 8, truePeak: -1, duration: 0 });
    });
  });
}

/**
 * Generate waveform data for visualization
 * Returns array of amplitude values (0-1)
 */
function generateWaveformData(filePath, label = 'audio') {
  return new Promise((resolve) => {
    const samples = 200; // Number of waveform points

    // Use FFmpeg to get peak levels across the file
    const args = [
      '-i', filePath,
      '-af', `asetnsamples=${samples},astats=metadata=1:reset=1`,
      '-f', 'null',
      '-',
    ];

    const ffmpeg = spawn(FFMPEG_PATH, args);
    let stderr = '';

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', () => {
      // Generate synthetic waveform based on audio characteristics
      // In production, you'd parse the actual peak data
      const waveform = [];
      
      // Extract peak values from astats output
      const peakMatches = stderr.matchAll(/Peak level dB:\s*([-\d.]+)/g);
      const peaks = [...peakMatches].map(m => parseFloat(m[1]));

      if (peaks.length > 0) {
        // Normalize peaks to 0-1 range
        const minPeak = Math.min(...peaks);
        const maxPeak = Math.max(...peaks);
        const range = maxPeak - minPeak || 1;

        for (let i = 0; i < samples; i++) {
          const peakIdx = Math.floor((i / samples) * peaks.length);
          const normalizedPeak = (peaks[peakIdx] - minPeak) / range;
          waveform.push(Math.max(0.05, Math.min(1, normalizedPeak)));
        }
      } else {
        // Generate placeholder waveform
        for (let i = 0; i < samples; i++) {
          const base = 0.3 + Math.sin(i * 0.1) * 0.2;
          const noise = Math.random() * 0.3;
          waveform.push(Math.min(1, base + noise));
        }
      }

      resolve(waveform);
    });

    ffmpeg.on('error', () => {
      // Return placeholder on error
      const waveform = [];
      for (let i = 0; i < 200; i++) {
        waveform.push(0.3 + Math.random() * 0.4);
      }
      resolve(waveform);
    });
  });
}

/**
 * Generate mastering notes based on processing
 */
function generateMasteringNotes(settings, inputMetrics, outputMetrics) {
  const notes = [];

  // EQ notes
  notes.push(`Applied ${settings.eq.lowCut}Hz high-pass filter to remove rumble.`);
  if (settings.eq.highBoost > 0) {
    notes.push(`Boosted highs at 12kHz by +${settings.eq.highBoost}dB for air and presence.`);
  }

  // Compression notes
  notes.push(`Applied ${settings.compression.ratio}:1 compression with ${settings.compression.knee} knee.`);

  // Stereo width notes
  if (settings.stereoWidth > 100) {
    const widthIncrease = settings.stereoWidth - 100;
    notes.push(`Widened stereo image by +${widthIncrease}% for enhanced spaciousness.`);
  }

  // Loudness notes
  const loudnessChange = (outputMetrics.loudness - inputMetrics.loudness).toFixed(1);
  notes.push(`Normalized to ${settings.loudnessTarget} LUFS (${loudnessChange > 0 ? '+' : ''}${loudnessChange} LUFS change).`);

  // Peak limiting notes
  notes.push(`Limited true peak to ${settings.truePeakLimit}dB for safe streaming playback.`);

  // Final stats
  notes.push(`Final: ${outputMetrics.loudness?.toFixed(1) || '?'} LUFS, ${outputMetrics.truePeak?.toFixed(1) || '?'} dBTP.`);

  return notes.join(' ');
}

export default {
  masterTrack,
  getMasteringPresets,
  compareMaster,
};

