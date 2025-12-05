// backend/middleware/authMiddleware.js
// TODO: Config normalized to env.js for consistency.
import jwt from 'jsonwebtoken';
import env from '../src/config/env.js';

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    // Verify token using centralized config
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Attach decoded user info to request object
    req.user = decoded;

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

// Alias exports for compatibility
export default verifyToken;
