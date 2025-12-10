// backend/src/utils/crypto.js
// Cryptographic utilities
import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 10;

/**
 * Hash a password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate a secure random token
 */
export const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString("hex");
};

/**
 * Hash a string using SHA-256
 */
export const sha256 = (data) => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

/**
 * HMAC signature
 */
export const hmacSign = (data, secret) => {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
};

/**
 * Verify HMAC signature
 */
export const hmacVerify = (data, secret, signature) => {
  const expected = hmacSign(data, secret);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};

/**
 * Encrypt data with AES-256
 */
export const encrypt = (text, key) => {
  const iv = crypto.randomBytes(16);
  const keyBuffer = crypto.scryptSync(key, "salt", 32);
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

/**
 * Decrypt AES-256 encrypted data
 */
export const decrypt = (encryptedText, key) => {
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const keyBuffer = crypto.scryptSync(key, "salt", 32);
  const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

export default {
  hashPassword,
  comparePassword,
  generateSecureToken,
  sha256,
  hmacSign,
  hmacVerify,
  encrypt,
  decrypt,
};



