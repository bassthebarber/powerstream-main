// frontend/src/config/featureFlags.js
// Frontend feature flags - determined by API responses or env vars
// Used for graceful degradation UI when services are not available

/**
 * Feature availability flags
 * These are initial defaults; actual availability is confirmed via API responses
 */
export const features = {
  // ========== AI Services ==========
  // All default to true - actual availability confirmed via API
  
  // MusicGen - AI Beat Generation
  musicgen: true,
  aiBeats: true,
  
  // OpenAI GPT
  openai: true,
  
  // Claude AI
  claude: true,
  
  // AI Lyrics
  aiLyrics: true,
  
  // AI Mix Suggestions
  aiMix: true,
  
  // AI Mastering
  aiMastering: true,
  
  // AI Remix
  aiRemix: true,
  
  // AI Pulse Assistant
  aiPulse: true,

  // ========== Payments ==========
  payments: import.meta.env.VITE_PAYMENTS_ENABLED === "true",

  // ========== WebRTC Calls ==========
  webRtcCalls: import.meta.env.VITE_WEBRTC_ENABLED === "true",

  // ========== Core Features ==========
  fileUpload: true,
};

/**
 * Check if an API response indicates a service is not configured
 * @param {object} response - API response data
 * @returns {boolean}
 */
export function isServiceNotConfigured(response) {
  return response?.code === "SERVICE_NOT_CONFIGURED";
}

/**
 * Get user-friendly message for unconfigured services
 * @param {string} serviceName - Name of the service
 * @returns {string}
 */
export function getNotConfiguredMessage(serviceName) {
  const messages = {
    aiBeats: "AI Beat Generation is not configured yet. Pattern-based beats are still available.",
    aiLyrics: "AI Lyrics is not configured. You can write lyrics manually.",
    aiMix: "AI Mix suggestions are not available. Manual mixing is fully functional.",
    aiPulse: "AI Pulse is not configured for this environment.",
    payments: "Payments are not configured. Contact support for purchase options.",
    webRtcCalls: "Voice/video calls are coming soon!",
    default: "This feature is not configured for this environment.",
  };
  return messages[serviceName] || messages.default;
}

/**
 * Feature banner component props generator
 * @param {string} featureName 
 * @param {object} apiResponse 
 * @returns {object|null}
 */
export function getFeatureBannerProps(featureName, apiResponse) {
  if (!isServiceNotConfigured(apiResponse)) {
    return null;
  }
  
  return {
    type: "info",
    message: getNotConfiguredMessage(featureName),
    dismissible: true,
  };
}

export default features;

