// backend/recordingStudio/controllers/mixController.js
// Mix & Master Controller - Real FFmpeg-based audio processing

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import Mixdown from '../models/Mixdown.js';
import { processAndMaster, analyzeLoudness, getAudioMetadata, TEMP_DIR } from '../utils/audioProcessor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure temp directory exists
await fs.ensureDir(TEMP_DIR);

/**
 * Process a mix request with real FFmpeg
 * POST /api/mix/process
 */
export const processMix = async (req, res) => {
  const startTime = Date.now();
  let tempFilePath = null;
  let mixdownDoc = null;

  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: "No audio file provided" });
    }

    const { trackName, artistName, genre, chain } = req.body;
    let chainSettings = {};
    
    try {
      chainSettings = chain ? JSON.parse(chain) : {};
    } catch {
      // Use defaults if parse fails
    }

    console.log(`🎚️ [MixController] Processing: ${trackName || "Untitled"} (${genre || "unknown"})`);
    console.log(`📁 File: ${req.file.originalname} (${req.file.size} bytes)`);

    // Save uploaded file to temp directory
    const timestamp = Date.now();
    const ext = path.extname(req.file.originalname) || '.wav';
    const tempFilename = `upload_${timestamp}${ext}`;
    tempFilePath = path.join(TEMP_DIR, tempFilename);
    
    await fs.writeFile(tempFilePath, req.file.buffer);
    console.log(`💾 Saved temp file: ${tempFilePath}`);

    // Create initial Mixdown document
    mixdownDoc = new Mixdown({
      trackTitle: trackName || 'Untitled',
      artistName: artistName || 'Unknown Artist',
      genre: genre || 'unknown',
      inputFilePath: tempFilePath,
      status: 'processing',
      processingChain: {
        eq: chainSettings.eq || {},
        compressor: chainSettings.compressor || {},
        limiter: chainSettings.limiter || {},
        loudnessTarget: chainSettings.loudnessTarget || -14,
      },
    });
    await mixdownDoc.save();

    // Process with real FFmpeg
    const result = await processAndMaster(tempFilePath, {
      trackTitle: trackName || 'Untitled',
      genre: genre || 'unknown',
      loudnessTarget: chainSettings.loudnessTarget || -14,
      eq: chainSettings.eq || {},
      compressor: chainSettings.compressor || {},
      limiter: chainSettings.limiter || {},
      outputFormat: chainSettings.outputFormat || 'mp3',
      outputBitrate: chainSettings.outputBitrate || 320,
    });

    if (!result.success) {
      throw new Error('Processing failed');
    }

    // Upload to Cloudinary if configured
    let downloadUrl = null;
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const uploadResult = await cloudinary.uploader.upload(result.outputPath, {
          resource_type: 'auto',
          folder: 'powerstream/mixes',
          public_id: `mix_${timestamp}`,
        });
        downloadUrl = uploadResult.secure_url;
        console.log(`☁️ Uploaded to Cloudinary: ${downloadUrl}`);
      } catch (cloudErr) {
        console.warn('⚠️ Cloudinary upload failed:', cloudErr.message);
        // Continue without cloud URL
      }
    }

    // If no Cloudinary, serve from local path (for dev)
    if (!downloadUrl) {
      downloadUrl = `/api/mix/download/${path.basename(result.outputPath)}`;
    }

    // Update Mixdown document
    mixdownDoc.outputFilePath = result.outputPath;
    mixdownDoc.outputUrl = downloadUrl;
    mixdownDoc.loudnessIntegrated = result.outputMetrics.integratedLoudness;
    mixdownDoc.loudnessRange = result.outputMetrics.loudnessRange;
    mixdownDoc.truePeak = result.outputMetrics.truePeak;
    mixdownDoc.processingTime = result.processingTime;
    mixdownDoc.fileSize = result.fileSize;
    mixdownDoc.duration = result.duration;
    mixdownDoc.format = result.settings.outputFormat;
    mixdownDoc.bitrate = result.settings.outputBitrate;
    mixdownDoc.status = 'completed';
    mixdownDoc.processingNotes = generateProcessingNotes(genre, result);
    await mixdownDoc.save();

    // Clean up temp input file
    await fs.remove(tempFilePath).catch(() => {});

    const processingTime = Date.now() - startTime;
    console.log(`✅ [MixController] Complete in ${processingTime}ms`);

    // Return response matching frontend expectations
    res.json({
      ok: true,
      status: "ok",
      mixdownId: mixdownDoc._id,
      trackName: mixdownDoc.trackTitle,
      genre: mixdownDoc.genre,
      // Loudness as percentage (0-100 scale for UI meter)
      loudness: Math.round(Math.min(100, Math.max(0, (mixdownDoc.loudnessIntegrated + 20) * 5))),
      peak: mixdownDoc.truePeak,
      lufs: mixdownDoc.loudnessIntegrated,
      loudnessRange: mixdownDoc.loudnessRange,
      notes: mixdownDoc.processingNotes,
      downloadUrl: mixdownDoc.outputUrl,
      duration: mixdownDoc.duration,
      processingTime: `${(processingTime / 1000).toFixed(1)}s`,
    });

  } catch (err) {
    console.error("❌ [MixController] Error:", err);

    // Update document status if created
    if (mixdownDoc) {
      mixdownDoc.status = 'failed';
      mixdownDoc.errorMessage = err.message;
      await mixdownDoc.save().catch(() => {});
    }

    // Clean up temp file
    if (tempFilePath) {
      await fs.remove(tempFilePath).catch(() => {});
    }

    res.status(500).json({ 
      ok: false, 
      message: err.message || "Mix processing failed" 
    });
  }
};

/**
 * Get mix status (for async processing)
 * GET /api/mix/status/:id
 */
export const getMixStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const mixdown = await Mixdown.findById(id);
    if (!mixdown) {
      return res.status(404).json({ ok: false, message: "Mixdown not found" });
    }

    res.json({
      ok: true,
      id: mixdown._id,
      status: mixdown.status,
      progress: mixdown.status === 'completed' ? 100 : 
                mixdown.status === 'processing' ? 50 : 0,
      message: mixdown.status === 'completed' ? 'Mix processing complete' :
               mixdown.status === 'failed' ? mixdown.errorMessage :
               'Processing...',
      downloadUrl: mixdown.outputUrl,
      loudness: mixdown.loudnessIntegrated,
      truePeak: mixdown.truePeak,
    });
  } catch (err) {
    console.error("❌ [MixController] Status error:", err);
    res.status(500).json({ ok: false, message: err.message || "Failed to get status" });
  }
};

/**
 * Get list of mixdowns (for library)
 * GET /api/mix/list
 */
export const listMixdowns = async (req, res) => {
  try {
    const { limit = 50, skip = 0, status } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const mixdowns = await Mixdown.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await Mixdown.countDocuments(query);

    res.json({
      ok: true,
      items: mixdowns.map(m => ({
        _id: m._id,
        name: m.trackTitle,
        title: m.trackTitle,
        artistName: m.artistName,
        genre: m.genre,
        type: 'mixdown',
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
    console.error("❌ [MixController] List error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Download a processed mix file
 * GET /api/mix/download/:filename
 */
export const downloadMix = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(path.dirname(__dirname), 'output', 'mixes', filename);

    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ ok: false, message: "File not found" });
    }

    res.download(filePath);
  } catch (err) {
    console.error("❌ [MixController] Download error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Generate processing notes based on genre and results
 */
function generateProcessingNotes(genre, result) {
  const genreNotes = {
    trap: "Applied 808 enhancement and hi-hat presence boost. Modern trap compression with punchy attack.",
    rnb: "Smoothed mids with warm analog-style saturation. Gentle limiting for silky dynamics.",
    gospel: "Enhanced choir frequencies with high-end air. Preserved dynamic range for emotional impact.",
    southern_soul: "Boosted low-mids for Southern warmth. Added vintage-style harmonic saturation.",
    hiphop: "Classic hip-hop mastering: punchy drums, clear vocals, solid foundation.",
    drill: "Aggressive limiting with enhanced percussion attack. Dark and gritty processing.",
    pop: "Bright and punchy master. Optimized loudness for streaming platforms.",
    default: "Applied balanced mastering chain with EQ, compression, and loudness normalization.",
  };

  const baseNote = genreNotes[genre] || genreNotes.default;
  const lufsNote = `Output: ${result.outputMetrics.integratedLoudness.toFixed(1)} LUFS, ` +
                   `True Peak: ${result.outputMetrics.truePeak.toFixed(1)} dBTP.`;
  
  return `${baseNote} ${lufsNote}`;
}

export default {
  processMix,
  getMixStatus,
  listMixdowns,
  downloadMix,
};
