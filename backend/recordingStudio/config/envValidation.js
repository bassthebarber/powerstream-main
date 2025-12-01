// backend/recordingStudio/config/envValidation.js
// Environment variable validation for Recording Studio

const requiredVars = [
  "STUDIO_PORT",
  "JWT_SECRET",
];

const optionalVars = [
  "STUDIO_MONGO_URI",
  "MONGO_URI",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "REDIS_HOST",
  "REDIS_PORT",
  "USE_REDIS",
  "USE_CLOUDINARY",
  "ALLOWED_ORIGIN",
  "NODE_ENV",
];

export function validateEnv() {
  const missing = [];
  const warnings = [];

  // Check required vars
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Check optional vars and warn
  for (const varName of optionalVars) {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  }

  // Report
  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((v) => console.error(`   - ${v}`));
  }

  if (warnings.length > 0) {
    console.warn("⚠️ Missing optional environment variables (using defaults):");
    warnings.forEach((v) => console.warn(`   - ${v}`));
  }

  // Set defaults
  process.env.STUDIO_PORT = process.env.STUDIO_PORT || "5100";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "powerstream-dev-secret-change-me";
  process.env.NODE_ENV = process.env.NODE_ENV || "development";

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

export function getEnvSummary() {
  return {
    STUDIO_PORT: process.env.STUDIO_PORT || "5100",
    NODE_ENV: process.env.NODE_ENV || "development",
    MONGO_CONFIGURED: Boolean(process.env.STUDIO_MONGO_URI || process.env.MONGO_URI),
    CLOUDINARY_CONFIGURED: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    REDIS_CONFIGURED: process.env.USE_REDIS === "true",
  };
}

export default { validateEnv, getEnvSummary };



