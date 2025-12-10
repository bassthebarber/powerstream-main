// backend/controllers/ai/aiStudioController.js
// AI Studio controller per Overlord Spec
import { sendSuccess, sendError } from "../../utils/response.js";
import aiStudioService from "../../services/ai/aiStudio.service.js";

/**
 * GET /api/ai/studio/capabilities
 * Get available AI capabilities
 */
export async function getStudioCapabilities(req, res, next) {
  try {
    const capabilities = await aiStudioService.getCapabilities();
    return sendSuccess(res, { capabilities });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/ai/studio/generate
 * Generate content using AI
 */
export async function generateContent(req, res, next) {
  try {
    const userId = req.user.id;
    const { type, prompt, options } = req.body;
    
    if (!type || !prompt) {
      return sendError(res, "Type and prompt are required", 400, "MISSING_PARAMS");
    }
    
    const result = await aiStudioService.generate(userId, type, prompt, options);
    
    if (!result.success) {
      return sendError(res, result.message, 400, result.code);
    }
    
    return sendSuccess(res, result.data, "Content generated");
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/ai/studio/enhance-audio
 * Enhance audio quality using AI
 */
export async function enhanceAudio(req, res, next) {
  try {
    const userId = req.user.id;
    const { audioUrl, options } = req.body;
    
    if (!audioUrl) {
      return sendError(res, "Audio URL is required", 400, "MISSING_AUDIO");
    }
    
    const result = await aiStudioService.enhanceAudio(userId, audioUrl, options);
    
    if (!result.success) {
      return sendError(res, result.message, 400, result.code);
    }
    
    return sendSuccess(res, result.data, "Audio enhanced");
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/ai/studio/captions
 * Generate captions for media
 */
export async function generateCaptions(req, res, next) {
  try {
    const userId = req.user.id;
    const { mediaUrl, mediaType, language } = req.body;
    
    if (!mediaUrl) {
      return sendError(res, "Media URL is required", 400, "MISSING_MEDIA");
    }
    
    const result = await aiStudioService.generateCaptions(userId, mediaUrl, {
      mediaType,
      language: language || "en",
    });
    
    if (!result.success) {
      return sendError(res, result.message, 400, result.code);
    }
    
    return sendSuccess(res, result.data, "Captions generated");
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/ai/studio/analyze
 * Analyze media content
 */
export async function analyzeMedia(req, res, next) {
  try {
    const userId = req.user.id;
    const { mediaUrl, analysisType } = req.body;
    
    if (!mediaUrl) {
      return sendError(res, "Media URL is required", 400, "MISSING_MEDIA");
    }
    
    const result = await aiStudioService.analyzeMedia(userId, mediaUrl, analysisType);
    
    if (!result.success) {
      return sendError(res, result.message, 400, result.code);
    }
    
    return sendSuccess(res, result.data);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ai/studio/history
 * Get generation history
 */
export async function getHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const { limit = 20, skip = 0, type } = req.query;
    
    const history = await aiStudioService.getHistory(userId, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      type,
    });
    
    return sendSuccess(res, { history });
  } catch (error) {
    next(error);
  }
}

export default {
  getStudioCapabilities,
  generateContent,
  enhanceAudio,
  generateCaptions,
  analyzeMedia,
  getHistory,
};


