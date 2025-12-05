// backend/recordingStudio/routes/studioMixRoutes.js
// Mix & Master API Routes - Unified interface
import express from "express";
import { processMix } from "../controllers/mixController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

/**
 * Apply mix settings (EQ, compression, etc.)
 * POST /api/mix/apply
 * 
 * Body:
 * - trackId: string (optional)
 * - loopId: string (optional)
 * - mixId: string (optional, for updating existing mix)
 * - settings: { bass, mid, treble, presence, comp, limiter }
 */
router.post("/apply", async (req, res) => {
  try {
    const { trackId, loopId, mixId, settings } = req.body;

    // For now, return a mock response
    // In production, this would process the audio with FFmpeg
    const mockMixId = mixId || `mix_${Date.now()}`;
    const mockPreviewUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/v${Date.now()}/mix_preview.mp3`;

    res.json({
      ok: true,
      mixId: mockMixId,
      previewUrl: mockPreviewUrl,
      settings: settings || {},
      notes: "Mix applied successfully. Use previewUrl to play the result.",
    });
  } catch (error) {
    console.error("Error applying mix:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * Get AI recipe for mix
 * POST /api/mix/ai-recipe
 * 
 * Body:
 * - trackId: string (optional)
 * - loopId: string (optional)
 * - prompt: string (e.g., "Master brighter, +1 dB loudness, tame 300Hz mud")
 */
router.post("/ai-recipe", async (req, res) => {
  try {
    const { trackId, loopId, prompt } = req.body;

    // Mock AI recipe response
    const recipe = {
      mixId: `mix_${Date.now()}`,
      previewUrl: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/v${Date.now()}/ai_mix.mp3`,
      notes: prompt || "Master brighter, +1 dB loudness, tame 300Hz mud",
      settings: {
        bass: 4,
        mid: 1,
        treble: 3,
        presence: 2,
        comp: -3,
        limiter: -1,
      },
    };

    res.json({
      ok: true,
      ...recipe,
    });
  } catch (error) {
    console.error("Error getting AI recipe:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;

