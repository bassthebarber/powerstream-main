// backend/utils/SovereignAdminToken.js
import crypto from "crypto";

export function generateSovereignToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function validateSovereignToken(token) {
  const masterToken = process.env.SOVEREIGN_MASTER_TOKEN;
  return token === masterToken;
}

export default {
  generateSovereignToken,
  validateSovereignToken,
};
