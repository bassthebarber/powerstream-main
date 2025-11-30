// ✅ FILE 3: SovereignKeySeal.js
// 📁 Location: /backend/utils/SovereignKeySeal.js

const crypto = require('crypto');

function generateSovereignSeal(stationName) {
  const secret = process.env.SOVEREIGN_SEAL_SECRET || 'SOUTHERN_POWER_MASTER_KEY';
  const hash = crypto.createHmac('sha512', secret).update(stationName).digest('hex');
  return `SOVEREIGN-${hash.slice(0, 32).toUpperCase()}`;
}

module.exports = { generateSovereignSeal };
