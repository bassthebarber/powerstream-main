// backend/src/config/env.js
// Centralized environment configuration with validation
// TODO: This is the SINGLE SOURCE OF TRUTH for all configuration.
// All other files should import from here, not use process.env directly.

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local first (takes precedence), then .env
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// ============================================================
// CRITICAL SECURITY NOTE:
// DO NOT add default values for secrets in production.
// All secrets MUST be set via environment variables.
// ============================================================

/**
 * Environment configuration object
 * All env vars should be accessed through this object
 */
const env = {
  // ============================================================
  // SERVER CONFIGURATION
  // ============================================================
  NODE_ENV: process.env.NODE_ENV || "development",
  HOST: process.env.HOST || "127.0.0.1",
  PORT: Number(process.env.PORT || 5001),
  
  // ============================================================
  // MONGODB CONFIGURATION
  // ============================================================
  MONGO_URI: process.env.MONGO_URI || null,
  MONGO_USER: process.env.MONGO_USER || null,
  MONGO_PASS: process.env.MONGO_PASS || null,
  MONGO_HOST: process.env.MONGO_HOST || "cluster0.ldmtan.mongodb.net",
  MONGO_DB: process.env.MONGO_DB || "powerstream",
  MONGO_APP: process.env.MONGO_APP || "Cluster0",
  MONGO_AUTH_SOURCE: process.env.MONGO_AUTH_SOURCE || "",
  
  // ============================================================
  // POSTGRESQL CONFIGURATION (optional, for ledger/money)
  // ============================================================
  POSTGRES_URI: process.env.POSTGRES_URI || null,
  POSTGRES_HOST: process.env.POSTGRES_HOST || "localhost",
  POSTGRES_PORT: Number(process.env.POSTGRES_PORT || 5432),
  POSTGRES_USER: process.env.POSTGRES_USER || "postgres",
  POSTGRES_PASS: process.env.POSTGRES_PASS || "",
  POSTGRES_DB: process.env.POSTGRES_DB || "powerstream_ledger",
  
  // ============================================================
  // REDIS CONFIGURATION
  // ============================================================
  USE_REDIS: process.env.USE_REDIS === "true",
  REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
  REDIS_PORT: Number(process.env.REDIS_PORT || 6379),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || "",
  REDIS_DB: Number(process.env.REDIS_DB || 0),
  REDIS_URL: process.env.REDIS_URL || null,
  
  // ============================================================
  // JWT AUTHENTICATION
  // TODO: Set JWT_SECRET in production; do NOT use a default value.
  // ============================================================
  JWT_SECRET: process.env.JWT_SECRET || null,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || null,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  
  // ============================================================
  // CLOUDINARY MEDIA STORAGE
  // ============================================================
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  CLOUDINARY_URL: process.env.CLOUDINARY_URL || "",
  
  // ============================================================
  // S3 STORAGE (optional alternative to Cloudinary)
  // ============================================================
  S3_BUCKET: process.env.S3_BUCKET || "",
  S3_REGION: process.env.S3_REGION || "us-east-1",
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY || "",
  S3_SECRET_KEY: process.env.S3_SECRET_KEY || "",
  
  // ============================================================
  // OPENAI API
  // ============================================================
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4",
  
  // ============================================================
  // STRIPE PAYMENTS
  // ============================================================
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || "",
  
  // ============================================================
  // PAYPAL PAYMENTS
  // ============================================================
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || "",
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || "",
  PAYPAL_MODE: process.env.PAYPAL_MODE || "sandbox",
  
  // ============================================================
  // APPLE PAY
  // ============================================================
  APPLE_PAY_MERCHANT_ID: process.env.APPLE_PAY_MERCHANT_ID || "",
  APPLE_PAY_DOMAIN: process.env.APPLE_PAY_DOMAIN || "",
  
  // ============================================================
  // EMAIL CONFIGURATION
  // ============================================================
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: Number(process.env.SMTP_PORT || 587),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  SMTP_FROM: process.env.SMTP_FROM || "noreply@powerstream.tv",
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  
  // ============================================================
  // CORS CONFIGURATION
  // ============================================================
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(",").map(s => s.trim()).filter(Boolean) || [],
  CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS?.split(",").map(s => s.trim()).filter(Boolean) || [],
  CORS_EXTRA_ORIGINS: process.env.CORS_EXTRA_ORIGINS?.split(",").map(s => s.trim()).filter(Boolean) || [],
  
  // ============================================================
  // STREAMING CONFIGURATION
  // ============================================================
  RTMP_PORT: Number(process.env.RTMP_PORT || 1935),
  HLS_PORT: Number(process.env.HLS_PORT || 8000),
  RTMP_SECRET: process.env.RTMP_SECRET || "",
  STREAM_DOMAIN: process.env.STREAM_DOMAIN || "localhost",
  
  // ============================================================
  // LIVEPEER INTEGRATION
  // ============================================================
  LIVEPEER_API_KEY: process.env.LIVEPEER_API_KEY || "",
  LIVEPEER_WEBHOOK_SECRET: process.env.LIVEPEER_WEBHOOK_SECRET || "",
  
  // ============================================================
  // ML SERVICE
  // ============================================================
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || "http://localhost:5200",
  ML_SERVICE_TIMEOUT: Number(process.env.ML_SERVICE_TIMEOUT || 5000),
  
  // ============================================================
  // FRONTEND URLs
  // ============================================================
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  STUDIO_URL: process.env.STUDIO_URL || "http://localhost:5174",
  ADMIN_URL: process.env.ADMIN_URL || "http://localhost:5175",
  
  // ============================================================
  // FEATURE FLAGS
  // ============================================================
  AUTO_SEED_DATA: process.env.AUTO_SEED_DATA === "true",
  ENABLE_GRAPHQL: process.env.ENABLE_GRAPHQL === "true",
  ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING !== "false",
  ENABLE_SWAGGER: process.env.ENABLE_SWAGGER === "true",
  ENABLE_BRAIN_MODE: process.env.ENABLE_BRAIN_MODE !== "false",
  ENABLE_ML_RECOMMENDATIONS: process.env.ENABLE_ML_RECOMMENDATIONS === "true",
  
  // ============================================================
  // LOGGING
  // ============================================================
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_FORMAT: process.env.LOG_FORMAT || "combined",
  
  // ============================================================
  // SOVEREIGN / ADMIN OVERRIDES
  // ============================================================
  SOVEREIGN_ADMIN_KEY: process.env.SOVEREIGN_ADMIN_KEY || null,
  VOICE_AUTH_PHRASE: process.env.VOICE_AUTH_PHRASE || null,
  
  // ============================================================
  // HELPERS
  // ============================================================
  isDev: () => env.NODE_ENV === "development",
  isProd: () => env.NODE_ENV === "production",
  isTest: () => env.NODE_ENV === "test",
};

// ============================================================
// DEVELOPMENT/TEST FALLBACKS
// These are ONLY used in development/test mode for convenience.
// In production, all secrets MUST be explicitly set.
// ============================================================
if (!env.isProd()) {
  // Allow dev/test mode without real secrets for easier local development
  if (!env.JWT_SECRET) {
    env.JWT_SECRET = "dev_jwt_secret_DO_NOT_USE_IN_PRODUCTION";
    console.warn("⚠️  [DEV] Using default JWT_SECRET. Set JWT_SECRET env var for production.");
  }
  
  // In development/test, we derive a refresh secret if missing so the server can start.
  // In production, JWT_REFRESH_SECRET is mandatory and must be explicitly set.
  if (!env.JWT_REFRESH_SECRET) {
    // Derive from JWT_SECRET for consistency in dev, or use a generated fallback
    env.JWT_REFRESH_SECRET = `${env.JWT_SECRET}_refresh_dev`;
    console.warn("⚠️  [DEV] JWT_REFRESH_SECRET not set. Derived from JWT_SECRET for development.");
  }
}

/**
 * Build MongoDB URI from components or return full URI
 */
export const buildMongoUri = () => {
  if (env.MONGO_URI) return env.MONGO_URI;
  
  if (!env.MONGO_USER || !env.MONGO_PASS) return null;
  
  const encUser = encodeURIComponent(env.MONGO_USER);
  const encPass = encodeURIComponent(env.MONGO_PASS);
  const base = `mongodb+srv://${encUser}:${encPass}@${env.MONGO_HOST}/${env.MONGO_DB}?retryWrites=true&w=majority&appName=${encodeURIComponent(env.MONGO_APP)}`;
  
  return env.MONGO_AUTH_SOURCE 
    ? `${base}&authSource=${encodeURIComponent(env.MONGO_AUTH_SOURCE)}`
    : base;
};

/**
 * Get allowed CORS origins
 */
export const getAllowedOrigins = () => {
  const origins = [
    ...env.CORS_ORIGINS,
    ...env.CORS_ALLOWED_ORIGINS,
    ...env.CORS_EXTRA_ORIGINS,
  ];
  
  // Always allow frontend URLs
  if (env.FRONTEND_URL) origins.push(env.FRONTEND_URL);
  if (env.STUDIO_URL) origins.push(env.STUDIO_URL);
  if (env.ADMIN_URL) origins.push(env.ADMIN_URL);
  
  if (origins.length === 0 || env.isDev()) {
    // Defaults for development
    origins.push(
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://localhost:5001"
    );
  }
  
  // Dedupe
  return [...new Set(origins)];
};

/**
 * Validate required env vars
 * FAILS FAST in production if critical config is missing.
 * In development/test, only warns but allows server to start.
 */
export const validateEnv = () => {
  const errors = [];
  const warnings = [];
  
  // ============================================================
  // PRODUCTION-ONLY CHECKS: These MUST be set in production
  // In development/test, fallbacks are applied above, so these won't trigger.
  // ============================================================
  if (env.isProd()) {
    // JWT Secret - CRITICAL (must be a real secure value)
    if (!env.JWT_SECRET || env.JWT_SECRET.includes("dev_") || env.JWT_SECRET.includes("DO_NOT_USE")) {
      errors.push("JWT_SECRET must be set to a secure value in production");
    }
    
    // MongoDB - CRITICAL
    if (!env.MONGO_URI && (!env.MONGO_USER || !env.MONGO_PASS)) {
      errors.push("MongoDB credentials required: Set MONGO_URI or (MONGO_USER + MONGO_PASS)");
    }
    
    // JWT Refresh Secret - CRITICAL in production
    // Must be explicitly set and not a dev fallback
    if (!env.JWT_REFRESH_SECRET || 
        env.JWT_REFRESH_SECRET.includes("dev_") || 
        env.JWT_REFRESH_SECRET.includes("_refresh_dev") ||
        env.JWT_REFRESH_SECRET.includes("DO_NOT_USE")) {
      errors.push("JWT_REFRESH_SECRET must be set to a secure value in production");
    }
  }
  
  // ============================================================
  // DEV/TEST SANITY CHECK
  // Ensure fallbacks were properly applied (should always pass)
  // ============================================================
  if (!env.isProd()) {
    if (!env.JWT_SECRET) {
      warnings.push("JWT_SECRET is not set (should have been assigned a dev fallback)");
    }
    if (!env.JWT_REFRESH_SECRET) {
      warnings.push("JWT_REFRESH_SECRET is not set (should have been derived from JWT_SECRET)");
    }
  }
  
  // ============================================================
  // WARNINGS: Recommended but not critical
  // ============================================================
  if (!env.CLOUDINARY_CLOUD_NAME && !env.S3_BUCKET) {
    warnings.push("No media storage configured (Cloudinary or S3). Media uploads may fail.");
  }
  
  if (!env.SMTP_HOST) {
    warnings.push("SMTP not configured. Email sending will fail.");
  }
  
  if (!env.STRIPE_SECRET_KEY && !env.PAYPAL_CLIENT_ID) {
    warnings.push("No payment provider configured. Payments will fail.");
  }
  
  // ============================================================
  // OUTPUT
  // ============================================================
  if (warnings.length > 0 && !env.isTest()) {
    console.warn("⚠️  Configuration warnings:");
    warnings.forEach(w => console.warn(`   - ${w}`));
  }
  
  if (errors.length > 0) {
    console.error("❌ CRITICAL: Environment validation failed:");
    errors.forEach(e => console.error(`   - ${e}`));
    
    // Only fail fast in production - let dev/test continue with warnings
    if (env.isProd()) {
      console.error("\n🛑 Server cannot start with invalid configuration in production mode.\n");
      process.exit(1);
    }
  }
  
  return errors.length === 0;
};

/**
 * Get a summary of current configuration (safe to log, no secrets)
 */
export const getConfigSummary = () => ({
  env: env.NODE_ENV,
  host: env.HOST,
  port: env.PORT,
  mongoConfigured: !!(env.MONGO_URI || (env.MONGO_USER && env.MONGO_PASS)),
  redisEnabled: env.USE_REDIS,
  cloudinaryConfigured: !!env.CLOUDINARY_CLOUD_NAME,
  stripeConfigured: !!env.STRIPE_SECRET_KEY,
  paypalConfigured: !!env.PAYPAL_CLIENT_ID,
  smtpConfigured: !!env.SMTP_HOST,
  graphqlEnabled: env.ENABLE_GRAPHQL,
  rateLimitingEnabled: env.ENABLE_RATE_LIMITING,
  brainModeEnabled: env.ENABLE_BRAIN_MODE,
});

export default env;
