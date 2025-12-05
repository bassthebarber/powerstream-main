import jwt from 'jsonwebtoken';
import env from '../../src/config/env.js';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  try {
    // Use centralized JWT_SECRET from env.js (falls back to TOKEN_SECRET for backwards compat)
    const secret = env.JWT_SECRET || process.env.TOKEN_SECRET;
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'ESC') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};
