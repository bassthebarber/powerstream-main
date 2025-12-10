// backend/src/utils/ids.js
// ID generation and validation utilities
import mongoose from "mongoose";
import crypto from "crypto";

/**
 * Validate MongoDB ObjectId
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Convert string to ObjectId
 */
export const toObjectId = (id) => {
  if (!id) return null;
  if (id instanceof mongoose.Types.ObjectId) return id;
  if (!isValidObjectId(id)) return null;
  return new mongoose.Types.ObjectId(id);
};

/**
 * Generate a new ObjectId
 */
export const newObjectId = () => {
  return new mongoose.Types.ObjectId();
};

/**
 * Generate a random string ID
 */
export const generateId = (length = 16) => {
  return crypto.randomBytes(length).toString("hex");
};

/**
 * Generate a URL-safe token
 */
export const generateToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString("base64url");
};

/**
 * Generate a short code (for share links, etc.)
 */
export const generateShortCode = (length = 8) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
};

/**
 * Generate a numeric verification code
 */
export const generateVerificationCode = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + crypto.randomInt(max - min + 1)).toString();
};

export default {
  isValidObjectId,
  toObjectId,
  newObjectId,
  generateId,
  generateToken,
  generateShortCode,
  generateVerificationCode,
};



