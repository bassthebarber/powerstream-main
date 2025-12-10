// backend/services/StemExporter.js
// STEM EXPORTER - Export individual stems from a mixed track

import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * STEM EXPORTER
 * Exports individual stems from a mixed track or combines multiple inputs
 * 
 * Note: True stem separation requires AI models like Spleeter or Demucs.
 * This uses FFmpeg filters for basic frequency-based separation.
 * 
 * @param {Object} options
 * @param {string} options.inputFile - Path to input audio file
 * @param {string} options.exportName - Name for the export folder
 * @param {Array} options.stems - Which stems to export (vocals, bass, drums, other)
 * @returns {Promise<Object>} { stemFiles, outputDirectory }
 */
export async function exportStems({ 
  inputFile, 
  exportName,
  stems = ["vocals", "instrumental", "bass", "highs"],
}) {
  return new Promise(async (resolve, reject) => {
    if (!inputFile || !fs.existsSync(inputFile)) {
      return reject(new Error("Input file not found: " + inputFile));
    }

    const timestamp = Date.now();
    const safeName = exportName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const outputDirectory = path.join(__dirname, `../exports/stems/${safeName}_${timestamp}`);
    
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }

    console.log(`[StemExporter] Starting stem export for: ${inputFile}`);
    console.log(`[StemExporter] Output directory: ${outputDirectory}`);
    console.log(`[StemExporter] Stems to export: ${stems.join(", ")}`);

    const stemFiles = {};
    const exportPromises = [];

    // Define stem extraction filters
    const stemFilters = {
      vocals: {
        // Isolate mid-frequencies where vocals typically sit
        filter: "highpass=f=300,lowpass=f=5000,equalizer=f=3000:t=h:width=2000:g=3",
        description: "Vocal frequencies (300Hz - 5kHz boosted)",
      },
      instrumental: {
        // Remove vocal frequencies (basic vocal removal)
        filter: "highpass=f=80,bandreject=f=3000:w=1500",
        description: "Instrumental (vocals reduced)",
      },
      bass: {
        // Low frequencies
        filter: "lowpass=f=250,bass=g=3",
        description: "Bass frequencies (< 250Hz)",
      },
      highs: {
        // High frequencies
        filter: "highpass=f=6000,treble=g=2",
        description: "High frequencies (> 6kHz)",
      },
      mids: {
        // Mid frequencies
        filter: "highpass=f=500,lowpass=f=4000",
        description: "Mid frequencies (500Hz - 4kHz)",
      },
      drums: {
        // Transient-focused (basic)
        filter: "highpass=f=60,lowpass=f=8000,acompressor=threshold=-20dB:ratio=8:attack=0.5:release=10",
        description: "Drum transients (basic extraction)",
      },
    };

    // Export each requested stem
    for (const stem of stems) {
      if (!stemFilters[stem]) {
        console.warn(`[StemExporter] Unknown stem type: ${stem}`);
        continue;
      }

      const outputPath = path.join(outputDirectory, `${stem}.wav`);
      stemFiles[stem] = outputPath;

      const promise = exportSingleStem(inputFile, outputPath, stemFilters[stem].filter, stem);
      exportPromises.push(promise);
    }

    try {
      await Promise.all(exportPromises);
      
      console.log(`[StemExporter] All stems exported successfully`);
      
      // Create metadata file
      const metadata = {
        sourceFile: path.basename(inputFile),
        exportName: safeName,
        timestamp,
        stems: Object.keys(stemFiles).map(stem => ({
          name: stem,
          file: path.basename(stemFiles[stem]),
          description: stemFilters[stem]?.description || "",
        })),
      };
      
      fs.writeFileSync(
        path.join(outputDirectory, "stems_info.json"),
        JSON.stringify(metadata, null, 2)
      );
      
      resolve({
        success: true,
        stemFiles,
        outputDirectory,
        metadata,
      });
    } catch (err) {
      console.error("[StemExporter] Error exporting stems:", err);
      reject(err);
    }
  });
}

/**
 * Export a single stem
 */
function exportSingleStem(inputFile, outputPath, filter, stemName) {
  return new Promise((resolve, reject) => {
    console.log(`[StemExporter] Exporting ${stemName}...`);
    
    ffmpeg(inputFile)
      .audioFilters(filter)
      .outputOptions([
        "-ar", "48000",
        "-ac", "2",
      ])
      .output(outputPath)
      .on("start", (cmd) => {
        console.log(`[StemExporter] ${stemName} command started`);
      })
      .on("error", (err) => {
        console.error(`[StemExporter] Error exporting ${stemName}:`, err.message);
        reject(err);
      })
      .on("end", () => {
        console.log(`[StemExporter] ${stemName} exported: ${outputPath}`);
        resolve(outputPath);
      })
      .run();
  });
}

/**
 * Export stems from multiple separate input files
 * (When user has individual tracks already)
 * 
 * @param {Object} options
 * @param {Object} options.tracks - Object with track paths { vocals, beat, bass, fx, etc. }
 * @param {string} options.exportName - Name for the export folder
 * @returns {Promise<Object>} { stemFiles, outputDirectory }
 */
export async function exportStemsFromTracks({ tracks, exportName }) {
  return new Promise(async (resolve, reject) => {
    const timestamp = Date.now();
    const safeName = exportName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const outputDirectory = path.join(__dirname, `../exports/stems/${safeName}_${timestamp}`);
    
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }

    console.log(`[StemExporter] Exporting individual tracks as stems`);

    const stemFiles = {};
    const exportPromises = [];

    // Copy/convert each provided track as a stem
    for (const [trackName, trackPath] of Object.entries(tracks)) {
      if (!trackPath || !fs.existsSync(trackPath)) {
        console.warn(`[StemExporter] Track not found: ${trackName} -> ${trackPath}`);
        continue;
      }

      const outputPath = path.join(outputDirectory, `${trackName}.wav`);
      stemFiles[trackName] = outputPath;

      const promise = new Promise((res, rej) => {
        ffmpeg(trackPath)
          .outputOptions(["-ar", "48000", "-ac", "2"])
          .output(outputPath)
          .on("error", rej)
          .on("end", () => {
            console.log(`[StemExporter] ${trackName} stem exported`);
            res(outputPath);
          })
          .run();
      });

      exportPromises.push(promise);
    }

    try {
      await Promise.all(exportPromises);
      
      // Create metadata file
      const metadata = {
        exportName: safeName,
        timestamp,
        stems: Object.keys(stemFiles).map(stem => ({
          name: stem,
          file: path.basename(stemFiles[stem]),
        })),
      };
      
      fs.writeFileSync(
        path.join(outputDirectory, "stems_info.json"),
        JSON.stringify(metadata, null, 2)
      );
      
      resolve({
        success: true,
        stemFiles,
        outputDirectory,
        metadata,
      });
    } catch (err) {
      console.error("[StemExporter] Error exporting tracks:", err);
      reject(err);
    }
  });
}

/**
 * Get available stem types
 */
export function getStemTypes() {
  return [
    { id: "vocals", name: "Vocals", description: "Vocal frequencies (300Hz - 5kHz)" },
    { id: "instrumental", name: "Instrumental", description: "Everything except vocals" },
    { id: "bass", name: "Bass", description: "Low frequencies (< 250Hz)" },
    { id: "highs", name: "Highs", description: "High frequencies (> 6kHz)" },
    { id: "mids", name: "Mids", description: "Mid frequencies (500Hz - 4kHz)" },
    { id: "drums", name: "Drums", description: "Drum transients (basic)" },
  ];
}

export default {
  exportStems,
  exportStemsFromTracks,
  getStemTypes,
};


