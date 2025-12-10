// backend/recordingStudio/routes/studioLyricsRoutes.js
// AI Lyric Generation Routes
import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// Check if AI is configured
const AI_CONFIGURED = !!process.env.OPENAI_API_KEY;

// All routes require authentication
router.use(requireAuth);

// Health check
router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "AI Lyrics",
    aiConfigured: AI_CONFIGURED,
    fallbackMode: !AI_CONFIGURED,
  });
});

/**
 * Generate lyrics with AI
 * POST /api/studio/lyrics/generate
 */
router.post("/generate", async (req, res) => {
  try {
    const { prompt, style, mood, length } = req.body;

    // Mock AI-generated lyrics
    const mockLyrics = `Verse 1:
In the digital age, where the beats collide,
PowerStream's the stage, nowhere left to hide.
Gold and black, the theme, a visual delight,
AI's the dream, shining ever so bright.

Chorus:
Write the future, sing the song,
PowerHarmony, where we all belong.
From the studio booth to the live stage light,
PowerStream's the force, day and through the night.

Verse 2:
${prompt ? `Inspired by: ${prompt}` : "Your creativity flows, like a river so deep,"}
Every word we write, a promise we keep.
The mic is hot, the speakers loud,
PowerStream's the name, we're making you proud.`;

    res.json({
      ok: true,
      lyrics: mockLyrics,
      prompt: prompt || "",
      style: style || "hip-hop",
      mood: mood || "uplifting",
      length: length || "16 bars",
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating lyrics:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;

