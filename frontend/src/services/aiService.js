// frontend/src/services/aiService.js
// Frontend AI Service - Interface with PowerStream AI capabilities

import api from "../lib/api.js";
import { isServiceNotConfigured, getNotConfiguredMessage } from "../config/featureFlags.js";

/**
 * AI Service Status Cache
 */
let aiStatusCache = null;
let aiStatusCacheTime = 0;
const CACHE_TTL = 60000; // 1 minute

/**
 * Get AI service status with caching
 */
export async function getAIStatus(forceRefresh = false) {
  const now = Date.now();
  
  if (!forceRefresh && aiStatusCache && now - aiStatusCacheTime < CACHE_TTL) {
    return aiStatusCache;
  }

  try {
    const response = await api.get("/ai/health");
    aiStatusCache = response.data;
    aiStatusCacheTime = now;
    return aiStatusCache;
  } catch (error) {
    console.warn("[AI Service] Health check failed:", error.message);
    return {
      ok: false,
      services: {},
      summary: { total: 0, enabled: 0, disabled: 0 },
    };
  }
}

/**
 * Check if a specific AI service is available
 */
export async function isServiceAvailable(serviceName) {
  const status = await getAIStatus();
  return status.services?.[serviceName]?.enabled ?? false;
}

/**
 * AI Pulse - Assistant Query
 */
export async function queryAIPulse(query, context = {}) {
  try {
    const response = await api.post("/ai/pulse", { query, context });
    return response.data;
  } catch (error) {
    const data = error.response?.data;
    if (isServiceNotConfigured(data)) {
      return {
        ok: false,
        notConfigured: true,
        message: getNotConfiguredMessage("aiPulse"),
      };
    }
    console.error("[AI Pulse] Error:", error);
    return {
      ok: false,
      message: error.response?.data?.message || "AI Pulse is unavailable",
    };
  }
}

/**
 * Generate AI Lyrics
 */
export async function generateLyrics({ mood, genre, topic, style = "verse" }) {
  try {
    const response = await api.post("/ai/lyrics", { mood, genre, topic, style });
    return response.data;
  } catch (error) {
    const data = error.response?.data;
    if (isServiceNotConfigured(data)) {
      return {
        ok: false,
        notConfigured: true,
        message: getNotConfiguredMessage("aiLyrics"),
      };
    }
    console.error("[AI Lyrics] Error:", error);
    return {
      ok: false,
      message: error.response?.data?.message || "Lyrics generation failed",
    };
  }
}

/**
 * Get AI Mix Suggestions
 */
export async function getMixSuggestions({ trackInfo, currentMix = {}, targetGenre = "trap" }) {
  try {
    const response = await api.post("/ai/mix-suggestions", {
      trackInfo,
      currentMix,
      targetGenre,
    });
    return response.data;
  } catch (error) {
    const data = error.response?.data;
    if (isServiceNotConfigured(data)) {
      return {
        ok: false,
        notConfigured: true,
        message: getNotConfiguredMessage("aiMix"),
        fallbackSuggestions: getDefaultMixTips(targetGenre),
      };
    }
    console.error("[AI Mix] Error:", error);
    return {
      ok: false,
      message: error.response?.data?.message || "Mix suggestions failed",
    };
  }
}

/**
 * Get AI Mastering Suggestions
 */
export async function getMasteringSuggestions({ audioAnalysis, targetLoudness = -14, genre = "trap" }) {
  try {
    const response = await api.post("/ai/mastering-suggestions", {
      audioAnalysis,
      targetLoudness,
      genre,
    });
    return response.data;
  } catch (error) {
    const data = error.response?.data;
    if (isServiceNotConfigured(data)) {
      return {
        ok: false,
        notConfigured: true,
        message: getNotConfiguredMessage("aiMastering"),
        fallbackSuggestions: getDefaultMasteringTips(genre),
      };
    }
    console.error("[AI Mastering] Error:", error);
    return {
      ok: false,
      message: error.response?.data?.message || "Mastering suggestions failed",
    };
  }
}

/**
 * Generic AI Chat
 */
export async function aiChat(messages, options = {}) {
  try {
    const response = await api.post("/ai/chat", { messages, options });
    return response.data;
  } catch (error) {
    const data = error.response?.data;
    if (isServiceNotConfigured(data)) {
      return {
        ok: false,
        notConfigured: true,
        message: "AI chat is not configured",
      };
    }
    console.error("[AI Chat] Error:", error);
    return {
      ok: false,
      message: error.response?.data?.message || "AI chat failed",
    };
  }
}

/**
 * AI Completion (single prompt)
 */
export async function aiComplete(prompt, options = {}) {
  try {
    const response = await api.post("/ai/complete", { prompt, options });
    return response.data;
  } catch (error) {
    const data = error.response?.data;
    if (isServiceNotConfigured(data)) {
      return {
        ok: false,
        notConfigured: true,
        message: "AI completion is not configured",
      };
    }
    console.error("[AI Complete] Error:", error);
    return {
      ok: false,
      message: error.response?.data?.message || "AI completion failed",
    };
  }
}

// ========== Fallback Content ==========

function getDefaultMixTips(genre) {
  const tips = {
    trap: [
      "Boost 808 sub frequencies around 40-60Hz",
      "Add hi-hat rolls with subtle swing",
      "Use compression on the snare for punch",
      "Pan hi-hats slightly off-center",
    ],
    rnb: [
      "Keep vocals forward in the mix",
      "Use warm plate reverb on vocals",
      "Soft compression on the bus",
      "Add subtle stereo widening to pads",
    ],
    drill: [
      "Heavy sub emphasis on the 808",
      "Aggressive compression on drums",
      "Dark reverb on melodies",
      "Layer snares for impact",
    ],
  };
  return tips[genre] || tips.trap;
}

function getDefaultMasteringTips(genre) {
  return [
    `Target loudness: -14 LUFS for streaming`,
    "Apply gentle limiting (2-3dB max)",
    "Check mono compatibility",
    "Leave headroom (-1dB true peak)",
    "A/B with reference tracks",
  ];
}

// ========== Export ==========

export default {
  getAIStatus,
  isServiceAvailable,
  queryAIPulse,
  generateLyrics,
  getMixSuggestions,
  getMasteringSuggestions,
  aiChat,
  aiComplete,
};


