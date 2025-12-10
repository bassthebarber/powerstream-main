// backend/services/MixdownEngine.js
// MIXDOWN ENGINE - Combines user vocals + beat + FX into mastered WAV + MP3

import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

// Ensure exports directory exists
const EXPORTS_DIR = path.join(__dirname, "../exports");
if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
}

/**
 * MIXDOWN ENGINE
 * Combines user vocals + beat + FX into a mastered WAV + MP3
 * 
 * @param {Object} options
 * @param {string} options.vocalPath - Path to vocal track
 * @param {string} options.beatPath - Path to beat/instrumental track
 * @param {string} options.fxPath - Path to FX/effects track
 * @param {string} options.exportName - Name for the exported files
 * @param {Object} options.masteringPreset - Optional mastering preset
 * @returns {Promise<Object>} { wavOutput, mp3Output, duration, fileSize }
 */
export async function mixdownTrack({ 
  vocalPath, 
  beatPath, 
  fxPath, 
  exportName,
  masteringPreset = "standard",
}) {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(__dirname, "../exports/masters");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeName = exportName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const wavOutput = path.join(outputDir, `${safeName}_${timestamp}.wav`);
    const mp3Output = path.join(outputDir, `${safeName}_${timestamp}.mp3`);

    // Count valid inputs
    const inputs = [beatPath, vocalPath, fxPath].filter(p => p && fs.existsSync(p));
    
    if (inputs.length === 0) {
      return reject(new Error("No valid input files provided"));
    }

    console.log(`[MixdownEngine] Starting mixdown with ${inputs.length} inputs`);
    console.log(`[MixdownEngine] Preset: ${masteringPreset}`);

    // Build command
    let command = ffmpeg();
    
    // Add all valid inputs
    inputs.forEach(input => {
      command = command.input(input);
    });

    // Get mastering filters based on preset
    const filters = getMasteringFilters(masteringPreset, inputs.length);

    // First export WAV
    command
      .complexFilter(filters)
      .outputOptions([
        "-map", "[out]",
        "-ar", "48000",
        "-ac", "2",
      ])
      .output(wavOutput)
      .on("start", (cmd) => {
        console.log(`[MixdownEngine] FFmpeg command: ${cmd}`);
      })
      .on("progress", (progress) => {
        if (progress.percent) {
          console.log(`[MixdownEngine] Progress: ${Math.round(progress.percent)}%`);
        }
      })
      .on("error", (err, stdout, stderr) => {
        console.error("[MixdownEngine] FFmpeg error:", err.message);
        console.error("[MixdownEngine] stderr:", stderr);
        reject(err);
      })
      .on("end", async () => {
        console.log(`[MixdownEngine] WAV export complete: ${wavOutput}`);
        
        // Now convert to MP3
        try {
          await convertToMp3(wavOutput, mp3Output);
          
          // Get file info
          const wavStats = fs.statSync(wavOutput);
          const mp3Stats = fs.statSync(mp3Output);
          
          resolve({
            success: true,
            wavOutput,
            mp3Output,
            wavSize: wavStats.size,
            mp3Size: mp3Stats.size,
            preset: masteringPreset,
            timestamp,
          });
        } catch (mp3Err) {
          // WAV succeeded but MP3 failed - still return WAV
          console.error("[MixdownEngine] MP3 conversion failed:", mp3Err);
          resolve({
            success: true,
            wavOutput,
            mp3Output: null,
            wavSize: fs.statSync(wavOutput).size,
            mp3Error: mp3Err.message,
            preset: masteringPreset,
            timestamp,
          });
        }
      })
      .run();
  });
}

/**
 * Convert WAV to MP3
 */
function convertToMp3(wavPath, mp3Path) {
  return new Promise((resolve, reject) => {
    ffmpeg(wavPath)
      .audioCodec("libmp3lame")
      .audioBitrate("320k")
      .audioChannels(2)
      .audioFrequency(48000)
      .output(mp3Path)
      .on("error", reject)
      .on("end", () => {
        console.log(`[MixdownEngine] MP3 export complete: ${mp3Path}`);
        resolve(mp3Path);
      })
      .run();
  });
}

/**
 * Get mastering filters based on preset
 */
function getMasteringFilters(preset, inputCount) {
  // Build input mixing filter
  const inputLabels = [];
  for (let i = 0; i < inputCount; i++) {
    inputLabels.push(`[${i}:a]`);
  }
  
  // Mix all inputs together
  const mixFilter = inputCount > 1 
    ? `${inputLabels.join("")}amix=inputs=${inputCount}:duration=longest[mixed]`
    : `${inputLabels[0]}acopy[mixed]`;

  // Mastering chain based on preset
  const presets = {
    standard: [
      mixFilter,
      // Compression
      "[mixed]acompressor=threshold=-12dB:ratio=4:attack=5:release=50[comp]",
      // High shelf boost for presence
      "[comp]highshelf=f=8000:g=2[eq]",
      // Loudness normalization
      "[eq]loudnorm=I=-14:TP=-1:LRA=11[out]",
    ],
    hiphop: [
      mixFilter,
      // Heavy compression for punch
      "[mixed]acompressor=threshold=-10dB:ratio=6:attack=3:release=30[comp]",
      // Bass boost
      "[comp]bass=g=6:f=80[bass]",
      // High presence
      "[bass]highshelf=f=6000:g=3[eq]",
      // Loudness normalization
      "[eq]loudnorm=I=-12:TP=-0.5:LRA=9[out]",
    ],
    rnb: [
      mixFilter,
      // Smooth compression
      "[mixed]acompressor=threshold=-14dB:ratio=3:attack=10:release=100[comp]",
      // Warm bass
      "[comp]bass=g=4:f=100[bass]",
      // Vocal presence
      "[bass]equalizer=f=3000:t=h:width=500:g=2[eq]",
      // Loudness normalization
      "[eq]loudnorm=I=-14:TP=-1:LRA=11[out]",
    ],
    rock: [
      mixFilter,
      // Aggressive compression
      "[mixed]acompressor=threshold=-8dB:ratio=5:attack=2:release=20[comp]",
      // Mid-range punch
      "[comp]equalizer=f=1000:t=h:width=800:g=3[eq1]",
      // High cut for warmth
      "[eq1]lowpass=f=16000[eq]",
      // Loudness normalization
      "[eq]loudnorm=I=-11:TP=-0.5:LRA=8[out]",
    ],
    broadcast: [
      mixFilter,
      // Broadcast standard compression
      "[mixed]acompressor=threshold=-18dB:ratio=3:attack=20:release=200[comp]",
      // EQ for clarity
      "[comp]highpass=f=80[hp]",
      "[hp]lowpass=f=15000[lp]",
      // Loudness normalization to -24 LUFS (broadcast standard)
      "[lp]loudnorm=I=-24:TP=-2:LRA=7[out]",
    ],
    clean: [
      mixFilter,
      // Minimal processing - just normalize
      "[mixed]loudnorm=I=-16:TP=-1:LRA=14[out]",
    ],
  };

  return presets[preset] || presets.standard;
}

/**
 * Get available mastering presets
 */
export function getMasteringPresets() {
  return [
    { id: "standard", name: "Standard", description: "Balanced mastering for all genres" },
    { id: "hiphop", name: "Hip-Hop / Trap", description: "Heavy bass, punchy compression" },
    { id: "rnb", name: "R&B / Soul", description: "Warm, smooth, vocal-forward" },
    { id: "rock", name: "Rock / Pop", description: "Aggressive, mid-focused punch" },
    { id: "broadcast", name: "Broadcast", description: "Broadcast-safe levels (-24 LUFS)" },
    { id: "clean", name: "Clean / Podcast", description: "Minimal processing, just normalization" },
  ];
}

/**
 * Analyze audio file
 */
export function analyzeAudio(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      
      const audio = metadata.streams.find(s => s.codec_type === "audio");
      if (!audio) return reject(new Error("No audio stream found"));
      
      resolve({
        duration: metadata.format.duration,
        bitrate: metadata.format.bit_rate,
        sampleRate: audio.sample_rate,
        channels: audio.channels,
        codec: audio.codec_name,
        format: metadata.format.format_name,
      });
    });
  });
}

export default {
  mixdownTrack,
  getMasteringPresets,
  analyzeAudio,
};

