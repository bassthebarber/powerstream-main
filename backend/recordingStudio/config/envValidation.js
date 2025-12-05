// backend/recordingStudio/config/envValidation.js
// Environment variable validation for Recording Studio
// NOTE: Uses centralized config from /src/config/env.js
import env from "../../src/config/env.js";

const STUDIO_PORT = process.env.STUDIO_PORT || 5100;

export function validateEnv() {
  const missing = [];
  const warnings = [];

  // Check for JWT_SECRET from centralized config
  if (!env.JWT_SECRET) {
    missing.push("JWT_SECRET (via /src/config/env.js)");
  }

  // Check optional studio-specific vars
  const optionalVars = [
    "STUDIO_MONGO_URI",
    "USE_CLOUDINARY",
    "ALLOWED_ORIGIN",
  ];

  for (const varName of optionalVars) {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  }

  // Report
  if (missing.length > 0) {
    console.error("❌ Recording Studio: Missing required environment variables:");
    missing.forEach((v) => console.error(`   - ${v}`));
  }

  if (warnings.length > 0 && env.isDev()) {
    console.warn("⚠️ Recording Studio: Missing optional environment variables:");
    warnings.forEach((v) => console.warn(`   - ${v}`));
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

export function getEnvSummary() {
  return {
    STUDIO_PORT,
    NODE_ENV: env.NODE_ENV,
    MONGO_CONFIGURED: Boolean(process.env.STUDIO_MONGO_URI || env.MONGO_URI),
    CLOUDINARY_CONFIGURED: Boolean(env.CLOUDINARY_CLOUD_NAME),
    REDIS_CONFIGURED: env.USE_REDIS,
  };
}

// Export studio-specific config that uses centralized env
export const studioConfig = {
  PORT: STUDIO_PORT,
  JWT_SECRET: env.JWT_SECRET,
  NODE_ENV: env.NODE_ENV,
  MONGO_URI: process.env.STUDIO_MONGO_URI || env.MONGO_URI,
  CLOUDINARY_CLOUD_NAME: env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: env.CLOUDINARY_API_SECRET,
  USE_REDIS: env.USE_REDIS,
  REDIS_HOST: env.REDIS_HOST,
  REDIS_PORT: env.REDIS_PORT,
  isDev: env.isDev,
  isProd: env.isProd,
};

export default { validateEnv, getEnvSummary, studioConfig };





