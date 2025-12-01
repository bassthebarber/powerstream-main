// frontend/studio-app/src/config/api.js
// Centralized API configuration for PowerHarmony Studio
// This file is the single source of truth for all API endpoints

/**
 * Main PowerStream API (authentication, AI Coach, AI Studio Pro)
 * Default: http://localhost:5001
 * Production: Set VITE_API_BASE in .env
 */
export const API_BASE = 
  import.meta.env.VITE_API_BASE || 
  import.meta.env.VITE_API_BASE_URL || 
  "http://localhost:5001";

/**
 * Recording Studio API (uploads, mix, recordings, royalty, export)
 * Default: http://localhost:5100
 * Production: Set VITE_STUDIO_API_BASE in .env
 */
export const STUDIO_API_BASE = 
  import.meta.env.VITE_STUDIO_API_BASE || 
  import.meta.env.VITE_STUDIO_API_BASE_URL || 
  "http://localhost:5100";

/**
 * AI Coach endpoint for performance analysis
 */
export const AI_COACH_API = `${API_BASE}/api/aicoach`;

/**
 * AI Studio Pro endpoint for advanced features
 */
export const AI_STUDIO_API = `${API_BASE}/api/aistudio`;

/**
 * Studio recordings endpoint
 */
export const RECORDINGS_API = `${STUDIO_API_BASE}/api/recordings`;

/**
 * Mix & Master endpoint (FFmpeg processing)
 */
export const MIX_API = `${STUDIO_API_BASE}/api/mix`;

/**
 * Beats library/store endpoint
 */
export const BEATS_API = `${STUDIO_API_BASE}/api/beats`;

/**
 * Royalty/splits endpoint
 */
export const ROYALTY_API = `${STUDIO_API_BASE}/api/royalty`;

/**
 * Upload endpoint (Cloudinary)
 */
export const UPLOAD_API = `${STUDIO_API_BASE}/api/upload`;

/**
 * Export/email endpoint
 */
export const EXPORT_API = `${STUDIO_API_BASE}/api/export`;

/**
 * Library endpoint (unified access to recordings, beats, mixes)
 */
export const LIBRARY_API = `${STUDIO_API_BASE}/api/library`;

/**
 * AI Voice Clone endpoint
 */
export const VOICE_API = `${STUDIO_API_BASE}/api/studio/voice`;

/**
 * TV Streaming Export endpoint
 */
export const TV_EXPORT_API = `${STUDIO_API_BASE}/api/studio/tv`;

/**
 * Admin Producer Dashboard endpoint
 */
export const ADMIN_PRODUCERS_API = `${STUDIO_API_BASE}/api/studio/admin/producers`;

/**
 * Health check endpoint for studio
 */
export const STUDIO_HEALTH = `${STUDIO_API_BASE}/studio-health`;

/**
 * Environment info for display
 */
export const ENV_INFO = {
  apiBase: API_BASE,
  studioApiBase: STUDIO_API_BASE,
  environment: import.meta.env.MODE || "development",
  version: "1.1.0",
};

export default {
  API_BASE,
  STUDIO_API_BASE,
  AI_COACH_API,
  AI_STUDIO_API,
  RECORDINGS_API,
  MIX_API,
  BEATS_API,
  ROYALTY_API,
  UPLOAD_API,
  EXPORT_API,
  LIBRARY_API,
  VOICE_API,
  TV_EXPORT_API,
  ADMIN_PRODUCERS_API,
  STUDIO_HEALTH,
  ENV_INFO,
};
