// backend/recordingStudio/middleware/auth.js
// Authentication middleware for Recording Studio
// This file provides verifyToken and isAdmin middleware

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_KEY || 'powerstream-dev-secret';

// ============================================
// VERIFY TOKEN MIDDLEWARE
// ============================================
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ ok: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (jwtError) {
      console.warn('[Auth] Token verification failed:', jwtError.message);
      return res.status(401).json({ ok: false, message: 'Invalid token' });
    }
  } catch (error) {
    console.error('[Auth] Error:', error);
    res.status(500).json({ ok: false, message: 'Authentication error' });
  }
};

// ============================================
// IS ADMIN MIDDLEWARE
// ============================================
export const isAdmin = (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ ok: false, message: 'Not authenticated' });
    }

    const roles = user.roles || [user.role];
    const isAdminUser = roles.includes('admin') || roles.includes('ADMIN') || user.isAdmin === true;

    if (!isAdminUser) {
      return res.status(403).json({ ok: false, message: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('[Auth] Admin check error:', error);
    res.status(500).json({ ok: false, message: 'Authorization error' });
  }
};

// ============================================
// IS ENGINEER MIDDLEWARE
// ============================================
export const isEngineer = (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ ok: false, message: 'Not authenticated' });
    }

    const roles = user.roles || [user.role];
    const isEngineerUser = roles.includes('engineer') || roles.includes('ENGINEER') || 
                           roles.includes('admin') || roles.includes('ADMIN');

    if (!isEngineerUser) {
      return res.status(403).json({ ok: false, message: 'Engineer access required' });
    }

    next();
  } catch (error) {
    console.error('[Auth] Engineer check error:', error);
    res.status(500).json({ ok: false, message: 'Authorization error' });
  }
};

// ============================================
// OPTIONAL AUTH (doesn't require token but extracts user if present)
// ============================================
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
      } catch {
        // Token invalid but continue without user
        req.user = null;
      }
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

export default {
  verifyToken,
  isAdmin,
  isEngineer,
  optionalAuth,
};

