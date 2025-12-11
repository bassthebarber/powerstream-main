// backend/routes/ai/aiStudioRoutes.js
// AI Studio routes per Overlord Spec
import { Router } from "express";
import {
  getStudioCapabilities,
  generateContent,
  enhanceAudio,
  generateCaptions,
  analyzeMedia,
  getHistory,
} from "../../controllers/ai/aiStudioController.js";
import { requireAuth } from "../../middleware/authMiddleware.js";

const router = Router();

// All AI Studio routes require authentication
router.use(requireAuth);

// GET /api/ai/studio/capabilities - Get available AI capabilities
router.get("/capabilities", getStudioCapabilities);

// POST /api/ai/studio/generate - Generate content (text, image, etc.)
router.post("/generate", generateContent);

// POST /api/ai/studio/enhance-audio - Enhance audio quality
router.post("/enhance-audio", enhanceAudio);

// POST /api/ai/studio/captions - Generate captions for media
router.post("/captions", generateCaptions);

// POST /api/ai/studio/analyze - Analyze media content
router.post("/analyze", analyzeMedia);

// GET /api/ai/studio/history - Get generation history
router.get("/history", getHistory);

export default router;


