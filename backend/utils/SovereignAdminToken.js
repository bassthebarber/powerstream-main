// backend/utils/SovereignAdminToken.js

const crypto = require('crypto');

function generateSovereignToken() {
  return crypto.randomBytes(32).toString('hex');
}

function validateSovereignToken(token) {
  const masterToken = process.env.SOVEREIGN_MASTER_TOKEN;
  return token === masterToken;
}

module.exports = {
  generateSovereignToken,
  validateSovereignToken
};
