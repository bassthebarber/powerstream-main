// /backend/configs/security.js
export const jwtSecret = process.env.JWT_SECRET || "super-secret-key";
export const encryptionKey = process.env.ENCRYPTION_KEY || "default-encryption";
export const rateLimit = { windowMs: 60 * 1000, max: 100 }; // 100 requests/min

export default {
  jwtSecret,
  encryptionKey,
  rateLimit,
};
