// backend/utils/sovereignShield.js

const jwt = require('jsonwebtoken');
const User = require('../models/Usermodel');
const logUplink = require('../logs/logUplink');

const SOVEREIGN_LEVEL = 'sovereign'; // Custom role tag
const SOVEREIGN_SECRET = process.env.SOVEREIGN_SECRET || 'PowerStreamGodKey';

/**
 * Middleware to verify sovereign-level access using JWT + Role
 */
exports.verifySovereign = async (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== SOVEREIGN_LEVEL) {
      return res.status(401).json({ error: 'Unauthorized - Not Sovereign' });
    }

    req.user = user;
    next();
  } catch (err) {
    logUplink('SovereignShield', 'error', 'Access denied', { error: err.message });
    return res.status(401).json({ error: 'Invalid token or permissions' });
  }
};

/**
 * Validate a sovereign system override key
 */
exports.verifyOverrideKey = (key) => {
  return key === SOVEREIGN_SECRET;
};

/**
 * Injects into routes, services, admin panels, override cores
 */
exports.isSovereignUser = (user) => {
  return user && user.role === SOVEREIGN_LEVEL;
};
