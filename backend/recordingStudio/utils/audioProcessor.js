// backend/recordingStudio/utils/audioProcessor.js
// Real FFmpeg-based audio processing for Mix & Master

import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use system FFmpeg on production (Linux), ffmpeg-static for local dev
const FFMPEG_PATH = process.env.FFMPEG_PATH || ffmpegStatic;
if (FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(FFMPEG_PATH);
}

// Output directories
export const OUTPUT_DIR = process.env.MIX_OUTPUT_DIR || path.join(__dirname, '..', 'output', 'mixes');
export const TEMP_DIR = process.env.MIX_TEMP_DIR || path.join(__dirname, '..', 'temp');

// Ensure directories exist (async init)
async function ensureDirectories() {
  try {
    await fs.ensureDir(OUTPUT_DIR);
    await fs.ensureDir(TEMP_DIR);
    console.log('📁 Audio processor directories ready');
  } catch (err) {
    console.error('Failed to create directories:', err.message);
  }
}
ensureDirectories();

/**
 * Analyze audio file for loudness metrics using EBU R128
 * @param {string} inputPath - Path to input audio file
 * @returns {Promise<Object>} Loudness metrics
 */
export async function analyzeLoudness(inputPath) {
  return new Promise((resolve, reject) => {
    let stderr = '';
    
    ffmpeg(inputPath)
      .audioFilters('ebur128=peak=true')
      .format('null')
      .on('stderr', (line) => {
        stderr += line + '\n';
      })
      .on('error', (err) => {
        console.error('❌ FFmpeg loudness analysis error:', err.message);
        // Return fallback values if analysis fails
        resolve({
          integratedLoudness: -16.0,
          loudnessRange: 8.0,
          truePeak: -1.0,
          samplePeak: -1.5,
        });
      })
      .on('end', () => {
        // Parse EBU R128 output from stderr
        const metrics = parseEBUR128Output(stderr);
        console.log('📊 Loudness analysis:', metrics);
        resolve(metrics);
      })
      .output('-')
      .run();
  });
}

/**
 * Parse FFmpeg EBU R128 output
 */
function parseEBUR128Output(stderr) {
  const metrics = {
    integratedLoudness: -16.0,
    loudnessRange: 8.0,
    truePeak: -1.0,
    samplePeak: -1.5,
  };

  // Extract Integrated loudness (I:)
  const intMatch = stderr.match(/I:\s*([-\d.]+)\s*LUFS/);
  if (intMatch) metrics.integratedLoudness = parseFloat(intMatch[1]);

  // Extract Loudness Range (LRA:)
  const lraMatch = stderr.match(/LRA:\s*([-\d.]+)\s*LU/);
  if (lraMatch) metrics.loudnessRange = parseFloat(lraMatch[1]);

  // Extract True Peak
  const tpMatch = stderr.match(/True peak:\s*Peak:\s*([-\d.]+)\s*dBFS/i) || 
                  stderr.match(/Peak:\s*([-\d.]+)\s*dBFS/);
  if (tpMatch) metrics.truePeak = parseFloat(tpMatch[1]);

  // Extract Sample Peak (fallback)
  const spMatch = stderr.match(/Sample peak:\s*([-\d.]+)\s*dBFS/i);
  if (spMatch) metrics.samplePeak = parseFloat(spMatch[1]);

  return metrics;
}

/**
 * Process and master an audio file
 * @param {string} inputPath - Path to input audio file
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processing result with output path and metrics
 */
export async function processAndMaster(inputPath, options = {}) {
  const startTime = Date.now();
  
  const {
    trackTitle = 'Untitled',
    genre = 'unknown',
    loudnessTarget = -14, // LUFS for streaming
    eq = {},
    compressor = {},
    limiter = {},
    outputFormat = 'mp3',
    outputBitrate = 320,
  } = options;

  // Generate output filename
  const timestamp = Date.now();
  const safeTitle = trackTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
  const outputFilename = `${safeTitle}_master_${timestamp}.${outputFormat}`;
  const outputPath = path.join(OUTPUT_DIR, outputFilename);

  console.log(`🎚️ [AudioProcessor] Starting master: ${trackTitle}`);
  console.log(`📁 Input: ${inputPath}`);
  console.log(`📁 Output: ${outputPath}`);

  // First, analyze the input
  const inputMetrics = await analyzeLoudness(inputPath);
  console.log(`📊 Input loudness: ${inputMetrics.integratedLoudness} LUFS`);

  // Build the filter chain
  const filters = buildFilterChain({
    inputLoudness: inputMetrics.integratedLoudness,
    loudnessTarget,
    eq,
    compressor,
    limiter,
    genre,
  });

  return new Promise((resolve, reject) => {
    let cmd = ffmpeg(inputPath);

    // Apply audio filters
    if (filters.length > 0) {
      cmd = cmd.audioFilters(filters);
    }

    // Output settings
    cmd
      .audioBitrate(outputBitrate)
      .audioChannels(2)
      .audioFrequency(44100);

    if (outputFormat === 'mp3') {
      cmd.audioCodec('libmp3lame');
    } else if (outputFormat === 'wav') {
      cmd.audioCodec('pcm_s24le');
    } else if (outputFormat === 'flac') {
      cmd.audioCodec('flac');
    }

    cmd
      .on('start', (commandLine) => {
        console.log('🎬 FFmpeg command:', commandLine.substring(0, 200) + '...');
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`⏳ Processing: ${Math.round(progress.percent)}%`);
        }
      })
      .on('error', (err) => {
        console.error('❌ FFmpeg processing error:', err.message);
        reject(new Error(`FFmpeg error: ${err.message}`));
      })
      .on('end', async () => {
        const processingTime = Date.now() - startTime;
        console.log(`✅ Processing complete in ${processingTime}ms`);

        // Analyze output
        const outputMetrics = await analyzeLoudness(outputPath);
        
        // Get file stats
        const stats = await fs.stat(outputPath);
        
        // Get duration
        const duration = await getAudioDuration(outputPath);

        resolve({
          success: true,
          outputPath,
          outputFilename,
          inputMetrics,
          outputMetrics,
          processingTime,
          fileSize: stats.size,
          duration,
          settings: {
            loudnessTarget,
            eq,
            compressor,
            limiter,
            outputFormat,
            outputBitrate,
          },
        });
      })
      .save(outputPath);
  });
}

/**
 * Build FFmpeg filter chain based on settings
 */
function buildFilterChain(options) {
  const {
    inputLoudness,
    loudnessTarget,
    eq = {},
    compressor = {},
    limiter = {},
    genre,
  } = options;

  const filters = [];

  // 1. High-pass filter (remove sub-bass rumble)
  const lowCut = eq.lowCut || 80;
  filters.push(`highpass=f=${lowCut}`);

  // 2. EQ adjustments based on genre
  const presence = eq.presence || 50;
  const air = eq.air || 30;
  
  if (presence > 30) {
    // Boost presence frequencies (2-5kHz)
    const presenceGain = ((presence - 50) / 50) * 3; // -3 to +3 dB
    filters.push(`equalizer=f=3500:t=q:w=1.5:g=${presenceGain}`);
  }
  
  if (air > 20) {
    // Add air/brightness (10-16kHz)
    const airGain = ((air - 50) / 50) * 2; // -2 to +2 dB
    filters.push(`equalizer=f=12000:t=q:w=2:g=${airGain}`);
  }

  // 3. Compression (using FFmpeg's compand)
  const threshold = compressor.threshold || -12;
  const ratio = compressor.ratio || 4;
  const attack = (compressor.attack || 10) / 1000; // ms to seconds
  const release = (compressor.release || 100) / 1000;
  
  // Build compand points for compression
  // Format: attack,decay:soft-knee_dB:point1:point2:...
  filters.push(`acompressor=threshold=${threshold}dB:ratio=${ratio}:attack=${attack}:release=${release}:makeup=2`);

  // 4. Loudness normalization using loudnorm
  filters.push(`loudnorm=I=${loudnessTarget}:TP=-1.0:LRA=11:print_format=summary`);

  // 5. Final limiter
  const ceiling = limiter.ceiling || -0.3;
  filters.push(`alimiter=level_in=1:level_out=1:limit=${Math.abs(ceiling)}:attack=5:release=50`);

  return filters;
}

/**
 * Get audio duration using ffprobe
 */
export async function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error('FFprobe error:', err.message);
        resolve(0);
        return;
      }
      resolve(metadata.format?.duration || 0);
    });
  });
}

/**
 * Get audio metadata
 */
export async function getAudioMetadata(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error('FFprobe error:', err.message);
        resolve({});
        return;
      }
      
      const format = metadata.format || {};
      const audioStream = metadata.streams?.find(s => s.codec_type === 'audio') || {};
      
      resolve({
        duration: format.duration || 0,
        bitrate: format.bit_rate || 0,
        size: format.size || 0,
        format: format.format_name || 'unknown',
        sampleRate: audioStream.sample_rate || 44100,
        channels: audioStream.channels || 2,
        codec: audioStream.codec_name || 'unknown',
      });
    });
  });
}

/**
 * Clean up temporary files
 */
export async function cleanupTempFiles(files) {
  for (const file of files) {
    try {
      if (await fs.pathExists(file)) {
        await fs.remove(file);
        console.log(`🗑️ Cleaned up: ${file}`);
      }
    } catch (err) {
      console.error(`Failed to cleanup ${file}:`, err.message);
    }
  }
}

export default {
  analyzeLoudness,
  processAndMaster,
  getAudioDuration,
  getAudioMetadata,
  cleanupTempFiles,
};

