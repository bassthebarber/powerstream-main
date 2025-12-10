// backend/src/config/featureFlags.js
// Central feature flags based on environment configuration
// Used for graceful degradation when external services are not configured

/**
 * Feature availability flags
 * Each flag indicates whether the required environment variables are present
 */
export const features = {
  // ========== AI Services ==========
  
  // MusicGen - AI Beat Generation
  musicgen: !!(process.env.MUSICGEN_API_BASE || process.env.MUSICGEN_API_KEY),
  aiBeats: !!(process.env.MUSICGEN_API_BASE || process.env.MUSICGEN_API_KEY),
  
  // OpenAI GPT - Text/Chat AI
  openai: !!process.env.OPENAI_API_KEY,
  
  // Anthropic Claude - Advanced AI
  claude: !!process.env.ANTHROPIC_API_KEY,
  
  // AI Lyrics Generation (OpenAI or Claude)
  aiLyrics: !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY),
  
  // AI Mix Suggestions
  aiMix: !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY),
  
  // AI Mastering
  aiMastering: !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY),
  
  // AI Remix Engine
  aiRemix: !!(process.env.MUSICGEN_API_BASE || process.env.MUSICGEN_API_KEY),
  
  // AI Pulse Assistant
  aiPulse: !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY),
  
  // Any AI Available (for fallback decisions)
  anyAI: !!(
    process.env.OPENAI_API_KEY || 
    process.env.ANTHROPIC_API_KEY || 
    process.env.MUSICGEN_API_BASE
  ),

  // ========== Media Processing ==========
  ffmpeg: true, // ffmpeg-static is bundled, always available

  // ========== Payments ==========
  stripe: !!process.env.STRIPE_SECRET_KEY,
  paypal: !!process.env.PAYPAL_CLIENT_ID,

  // ========== Real-time Communication ==========
  webRtcCalls: !!process.env.WEBRTC_SIGNALING_URL,

  // ========== Cloud Storage ==========
  cloudinary: !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ),

  // ========== Email ==========
  email: !!(process.env.SENDGRID_API_KEY || process.env.SMTP_HOST),
};

/**
 * Service configuration status
 * Returns detailed status for debugging/admin
 */
export function getServiceStatus() {
  return {
    // AI Services
    musicgen: {
      enabled: features.musicgen,
      requires: ["MUSICGEN_API_BASE or MUSICGEN_API_KEY"],
      category: "AI",
    },
    openai: {
      enabled: features.openai,
      requires: ["OPENAI_API_KEY"],
      category: "AI",
    },
    claude: {
      enabled: features.claude,
      requires: ["ANTHROPIC_API_KEY"],
      category: "AI",
    },
    aiLyrics: {
      enabled: features.aiLyrics,
      requires: ["OPENAI_API_KEY or ANTHROPIC_API_KEY"],
      category: "AI",
    },
    aiMix: {
      enabled: features.aiMix,
      requires: ["OPENAI_API_KEY or ANTHROPIC_API_KEY"],
      category: "AI",
    },
    aiMastering: {
      enabled: features.aiMastering,
      requires: ["OPENAI_API_KEY or ANTHROPIC_API_KEY"],
      category: "AI",
    },
    aiRemix: {
      enabled: features.aiRemix,
      requires: ["MUSICGEN_API_BASE"],
      category: "AI",
    },
    aiPulse: {
      enabled: features.aiPulse,
      requires: ["OPENAI_API_KEY or ANTHROPIC_API_KEY"],
      category: "AI",
    },
    
    // Payments
    stripe: {
      enabled: features.stripe,
      requires: ["STRIPE_SECRET_KEY"],
      category: "Payments",
    },
    paypal: {
      enabled: features.paypal,
      requires: ["PAYPAL_CLIENT_ID"],
      category: "Payments",
    },
    
    // Communication
    webRtcCalls: {
      enabled: features.webRtcCalls,
      requires: ["WEBRTC_SIGNALING_URL"],
      category: "Communication",
    },
    
    // Storage
    cloudinary: {
      enabled: features.cloudinary,
      requires: ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"],
      category: "Storage",
    },
    
    // Email
    email: {
      enabled: features.email,
      requires: ["SENDGRID_API_KEY or SMTP_HOST"],
      category: "Communication",
    },
  };
}

/**
 * Standard response for unconfigured services
 */
export function serviceNotConfiguredResponse(serviceName, friendlyMessage) {
  return {
    ok: false,
    code: "SERVICE_NOT_CONFIGURED",
    service: serviceName,
    message: friendlyMessage || `${serviceName} is not configured for this environment.`,
  };
}

export default features;

