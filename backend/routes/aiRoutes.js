// backend/routes/aiRoutes.js
// Unified AI Routes - All AI services under /api/ai/*

import { Router } from 'express';
import { authRequired } from '../middleware/requireAuth.js';
import { features } from '../src/config/featureFlags.js';
import AIServiceManager from '../src/services/ai/AIServiceManager.js';

const router = Router();

// ========== Health & Status ==========

/**
 * GET /api/ai/health
 * Check AI services health and availability
 */
router.get('/health', (_req, res) => {
  const status = AIServiceManager.getAIServiceStatus();
  const enabledCount = Object.values(status).filter(s => s.enabled).length;
  
  res.json({
    ok: true,
    service: 'PowerStream AI',
    timestamp: new Date().toISOString(),
    summary: {
      total: Object.keys(status).length,
      enabled: enabledCount,
      disabled: Object.keys(status).length - enabledCount,
    },
    services: status,
  });
});

/**
 * GET /api/ai/status
 * Detailed status of all AI services (requires auth for security)
 */
router.get('/status', authRequired, (_req, res) => {
  res.json({
    ok: true,
    features: {
      musicgen: features.musicgen,
      openai: features.openai,
      claude: features.claude,
      aiLyrics: features.aiLyrics,
      aiMix: features.aiMix,
      aiMastering: features.aiMastering,
      aiRemix: features.aiRemix,
      aiPulse: features.aiPulse,
      anyAI: features.anyAI,
    },
    services: AIServiceManager.getAIServiceStatus(),
  });
});

// ========== AI Pulse (Assistant) ==========

/**
 * POST /api/ai/pulse
 * AI Pulse assistant endpoint
 */
router.post('/pulse', authRequired, async (req, res) => {
  try {
    const { query, context = {} } = req.body;
    
    if (!query) {
      return res.status(400).json({ ok: false, message: 'Query is required' });
    }

    // Add user context
    const fullContext = {
      ...context,
      userId: req.user?.id,
      userName: req.user?.name,
    };

    const result = await AIServiceManager.aiPulse(query, fullContext);
    
    if (!result.ok) {
      return res.status(503).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('[AI Pulse] Error:', error);
    res.status(500).json({ ok: false, message: 'AI Pulse error', error: error.message });
  }
});

// ========== Lyrics Generation ==========

/**
 * POST /api/ai/lyrics
 * Generate AI lyrics
 */
router.post('/lyrics', authRequired, async (req, res) => {
  try {
    const { mood, genre, topic, style = 'verse' } = req.body;

    if (!mood || !genre || !topic) {
      return res.status(400).json({ 
        ok: false, 
        message: 'mood, genre, and topic are required' 
      });
    }

    console.log(`📝 [AI Lyrics] Generating: ${mood} ${genre} - ${topic}`);

    const result = await AIServiceManager.generateLyrics({
      mood,
      genre,
      topic,
      style,
    });

    res.json(result);
  } catch (error) {
    console.error('[AI Lyrics] Error:', error);
    res.status(500).json({ ok: false, message: 'Lyrics generation error', error: error.message });
  }
});

// ========== Mix Suggestions ==========

/**
 * POST /api/ai/mix-suggestions
 * Get AI-powered mix suggestions
 */
router.post('/mix-suggestions', authRequired, async (req, res) => {
  try {
    const { trackInfo, currentMix = {}, targetGenre = 'trap' } = req.body;

    if (!trackInfo) {
      return res.status(400).json({ ok: false, message: 'trackInfo is required' });
    }

    console.log(`🎛️ [AI Mix] Getting suggestions for ${targetGenre}`);

    const result = await AIServiceManager.getMixSuggestions({
      trackInfo,
      currentMix,
      targetGenre,
    });

    res.json(result);
  } catch (error) {
    console.error('[AI Mix] Error:', error);
    res.status(500).json({ ok: false, message: 'Mix suggestions error', error: error.message });
  }
});

// ========== Mastering Suggestions ==========

/**
 * POST /api/ai/mastering-suggestions
 * Get AI-powered mastering suggestions
 */
router.post('/mastering-suggestions', authRequired, async (req, res) => {
  try {
    const { audioAnalysis, targetLoudness = -14, genre = 'trap' } = req.body;

    if (!audioAnalysis) {
      return res.status(400).json({ ok: false, message: 'audioAnalysis is required' });
    }

    console.log(`🎚️ [AI Mastering] Getting suggestions for ${genre} @ ${targetLoudness} LUFS`);

    const result = await AIServiceManager.getMasteringSuggestions({
      audioAnalysis,
      targetLoudness,
      genre,
    });

    res.json(result);
  } catch (error) {
    console.error('[AI Mastering] Error:', error);
    res.status(500).json({ ok: false, message: 'Mastering suggestions error', error: error.message });
  }
});

// ========== Generic AI Chat ==========

/**
 * POST /api/ai/chat
 * Generic AI chat endpoint (for advanced use cases)
 */
router.post('/chat', authRequired, async (req, res) => {
  try {
    const { messages, options = {} } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ ok: false, message: 'messages array is required' });
    }

    const result = await AIServiceManager.aiChat(messages, {
      ...options,
      fallbackSafe: true,
    });

    if (!result.ok && result.fallback) {
      return res.status(503).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('[AI Chat] Error:', error);
    res.status(500).json({ ok: false, message: 'AI chat error', error: error.message });
  }
});

// ========== AI Complete (Single Prompt) ==========

/**
 * POST /api/ai/complete
 * Single prompt completion
 */
router.post('/complete', authRequired, async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({ ok: false, message: 'prompt is required' });
    }

    const result = await AIServiceManager.aiComplete(prompt, {
      ...options,
      fallbackSafe: true,
    });

    if (!result.ok && result.fallback) {
      return res.status(503).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('[AI Complete] Error:', error);
    res.status(500).json({ ok: false, message: 'AI completion error', error: error.message });
  }
});

export default router;
