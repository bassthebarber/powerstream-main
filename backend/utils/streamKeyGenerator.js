// backend/utils/streamKeyGenerator.js
// Stream Key Generator Utility

import crypto from "crypto";

/**
 * Generate a unique stream key
 * @param {string} prefix - Optional prefix (e.g., "church", "tv", "user")
 * @returns {string} Stream key in format: prefix_randomhex
 */
export function generateStreamKey(prefix = "live") {
  const random = crypto.randomBytes(8).toString("hex");
  return `${prefix}_${random}`;
}

/**
 * Generate a secure stream key with timestamp
 * @param {string} prefix - Optional prefix
 * @returns {string} Stream key with embedded timestamp
 */
export function generateSecureStreamKey(prefix = "live") {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(6).toString("hex");
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Validate stream key format
 * @param {string} streamKey - The stream key to validate
 * @returns {boolean} True if valid format
 */
export function isValidStreamKey(streamKey) {
  if (!streamKey || typeof streamKey !== "string") return false;
  // Format: prefix_hex (e.g., church_a1b2c3d4e5f6g7h8)
  return /^[a-z]+_[a-z0-9]+$/i.test(streamKey);
}

export default {
  generateStreamKey,
  generateSecureStreamKey,
  isValidStreamKey,
};
