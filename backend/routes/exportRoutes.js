// backend/routes/exportRoutes.js
// Studio Export Routes - Master export and stem export

import { Router } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { mixdownTrack, getMasteringPresets, analyzeAudio } from "../services/MixdownEngine.js";
import { exportStems, exportStemsFromTracks, getStemTypes } from "../services/StemExporter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// =====================================================
// GET /api/export/presets
// Get available mastering presets
// =====================================================
router.get("/presets", (req, res) => {
  try {
    const presets = getMasteringPresets();
    res.json({ success: true, presets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// GET /api/export/stem-types
// Get available stem types
// =====================================================
router.get("/stem-types", (req, res) => {
  try {
    const types = getStemTypes();
    res.json({ success: true, types });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// POST /api/export/master
// Export a mastered track (WAV + MP3)
// =====================================================
router.post("/master", async (req, res) => {
  try {
    const { 
      vocalPath, 
      beatPath, 
      fxPath, 
      exportName = "master",
      masteringPreset = "standard",
    } = req.body;

    console.log("[ExportRoutes] Master export request:", { vocalPath, beatPath, fxPath, exportName, masteringPreset });

    // Validate at least one input
    const hasInput = [vocalPath, beatPath, fxPath].some(p => p && fs.existsSync(p));
    
    if (!hasInput) {
      return res.status(400).json({ 
        success: false, 
        error: "At least one valid audio file path is required (vocalPath, beatPath, or fxPath)" 
      });
    }

    const result = await mixdownTrack({
      vocalPath: vocalPath && fs.existsSync(vocalPath) ? vocalPath : null,
      beatPath: beatPath && fs.existsSync(beatPath) ? beatPath : null,
      fxPath: fxPath && fs.existsSync(fxPath) ? fxPath : null,
      exportName,
      masteringPreset,
    });

    // Generate download URLs
    const wavUrl = result.wavOutput ? `/api/export/download/${path.basename(result.wavOutput)}` : null;
    const mp3Url = result.mp3Output ? `/api/export/download/${path.basename(result.mp3Output)}` : null;

    res.json({
      success: true,
      message: "Master export complete",
      wavFile: result.wavOutput,
      mp3File: result.mp3Output,
      wavUrl,
      mp3Url,
      wavSize: result.wavSize,
      mp3Size: result.mp3Size,
      preset: result.preset,
      timestamp: result.timestamp,
    });
  } catch (err) {
    console.error("[ExportRoutes] Master export error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// POST /api/export/stems
// Export stems from a mixed track
// =====================================================
router.post("/stems", async (req, res) => {
  try {
    const { 
      inputFile, 
      exportName = "stems",
      stems = ["vocals", "instrumental", "bass", "highs"],
    } = req.body;

    console.log("[ExportRoutes] Stem export request:", { inputFile, exportName, stems });

    if (!inputFile || !fs.existsSync(inputFile)) {
      return res.status(400).json({ 
        success: false, 
        error: "Valid inputFile path is required" 
      });
    }

    const result = await exportStems({
      inputFile,
      exportName,
      stems,
    });

    // Generate download URLs for each stem
    const downloads = {};
    for (const [stemName, stemPath] of Object.entries(result.stemFiles)) {
      downloads[stemName] = `/api/export/download/stems/${path.basename(result.outputDirectory)}/${path.basename(stemPath)}`;
    }

    res.json({
      success: true,
      message: "Stems exported successfully",
      outputDirectory: result.outputDirectory,
      stemFiles: result.stemFiles,
      downloads,
      metadata: result.metadata,
    });
  } catch (err) {
    console.error("[ExportRoutes] Stem export error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// POST /api/export/stems-from-tracks
// Export stems from separate track files
// =====================================================
router.post("/stems-from-tracks", async (req, res) => {
  try {
    const { tracks, exportName = "stems" } = req.body;

    if (!tracks || Object.keys(tracks).length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "tracks object is required with at least one track path" 
      });
    }

    console.log("[ExportRoutes] Stems from tracks request:", { tracks, exportName });

    const result = await exportStemsFromTracks({
      tracks,
      exportName,
    });

    res.json({
      success: true,
      message: "Track stems exported successfully",
      outputDirectory: result.outputDirectory,
      stemFiles: result.stemFiles,
      metadata: result.metadata,
    });
  } catch (err) {
    console.error("[ExportRoutes] Stems from tracks error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// POST /api/export/analyze
// Analyze an audio file
// =====================================================
router.post("/analyze", async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(400).json({ 
        success: false, 
        error: "Valid filePath is required" 
      });
    }

    const analysis = await analyzeAudio(filePath);

    res.json({
      success: true,
      analysis,
    });
  } catch (err) {
    console.error("[ExportRoutes] Analyze error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// GET /api/export/download/:filename
// Download an exported file
// =====================================================
router.get("/download/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    
    // Check in masters directory
    let filePath = path.join(__dirname, "../exports/masters", filename);
    
    if (!fs.existsSync(filePath)) {
      // Check in main exports directory
      filePath = path.join(__dirname, "../exports", filename);
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: "File not found" });
    }

    res.download(filePath, filename);
  } catch (err) {
    console.error("[ExportRoutes] Download error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// GET /api/export/download/stems/:folder/:filename
// Download a stem file
// =====================================================
router.get("/download/stems/:folder/:filename", (req, res) => {
  try {
    const { folder, filename } = req.params;
    const filePath = path.join(__dirname, "../exports/stems", folder, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: "Stem file not found" });
    }

    res.download(filePath, filename);
  } catch (err) {
    console.error("[ExportRoutes] Stem download error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// GET /api/export/list
// List exported files
// =====================================================
router.get("/list", (req, res) => {
  try {
    const mastersDir = path.join(__dirname, "../exports/masters");
    const stemsDir = path.join(__dirname, "../exports/stems");

    const masters = fs.existsSync(mastersDir) 
      ? fs.readdirSync(mastersDir).filter(f => f.endsWith(".mp3") || f.endsWith(".wav"))
      : [];

    const stems = fs.existsSync(stemsDir)
      ? fs.readdirSync(stemsDir).filter(f => fs.statSync(path.join(stemsDir, f)).isDirectory())
      : [];

    res.json({
      success: true,
      masters: masters.map(f => ({
        filename: f,
        url: `/api/export/download/${f}`,
        size: fs.statSync(path.join(mastersDir, f)).size,
        created: fs.statSync(path.join(mastersDir, f)).birthtime,
      })),
      stemFolders: stems.map(folder => {
        const folderPath = path.join(stemsDir, folder);
        const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".wav"));
        return {
          folder,
          files: files.map(f => ({
            filename: f,
            url: `/api/export/download/stems/${folder}/${f}`,
          })),
        };
      }),
    });
  } catch (err) {
    console.error("[ExportRoutes] List error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
