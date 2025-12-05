// backend/recordingStudio/middleware/requireRole.js
// Role-based authorization middleware for AI Studio
// POWERSTREAM AI STUDIO – LIVE ROOM & ENGINEER CONTRACT MODE

import env from "../../src/config/env.js";

/**
 * Role constants matching User.model.js
 */
export const ROLES = {
  USER: "user",
  ADMIN: "admin",
  ARTIST: "artist",
  ENGINEER: "engineer",
  STATION_OWNER: "stationOwner",
  CREATOR: "creator",
};

/**
 * Check if user has any of the specified roles
 * @param {Object} user - User object from JWT (req.user)
 * @param {string[]} allowedRoles - Array of allowed role strings
 * @returns {boolean}
 */
export function hasRole(user, allowedRoles) {
  if (!user) return false;
  
  // Check multi-role array
  if (Array.isArray(user.roles)) {
    return user.roles.some(role => allowedRoles.includes(role));
  }
  
  // Fallback to single role
  if (user.role && allowedRoles.includes(user.role)) {
    return true;
  }
  
  // Check isAdmin flag
  if (user.isAdmin && allowedRoles.includes(ROLES.ADMIN)) {
    return true;
  }
  
  return false;
}

/**
 * Middleware factory: require user to have at least one of the specified roles
 * @param {...string} roles - Roles that are allowed to access the route
 * @returns {Function} Express middleware
 * 
 * @example
 * router.get('/engineer-only', requireAuth, requireRole('engineer', 'admin'), handler);
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        ok: false, 
        error: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }
    
    if (!hasRole(req.user, roles)) {
      const roleList = roles.join(" or ");
      return res.status(403).json({ 
        ok: false, 
        error: `Access denied. Required role: ${roleList}`,
        code: "INSUFFICIENT_ROLE",
        requiredRoles: roles,
        userRoles: req.user.roles || [req.user.role],
      });
    }
    
    next();
  };
}

/**
 * Shortcut: Require engineer role
 */
export const requireEngineer = requireRole(ROLES.ENGINEER, ROLES.ADMIN);

/**
 * Shortcut: Require artist role
 */
export const requireArtist = requireRole(ROLES.ARTIST, ROLES.USER, ROLES.ADMIN);

/**
 * Shortcut: Require admin role
 */
export const requireAdmin = requireRole(ROLES.ADMIN);

/**
 * Shortcut: Require engineer or admin
 */
export const requireEngineerOrAdmin = requireRole(ROLES.ENGINEER, ROLES.ADMIN);

/**
 * Shortcut: Any studio participant (artist, engineer, admin)
 */
export const requireStudioAccess = requireRole(
  ROLES.ARTIST, 
  ROLES.ENGINEER, 
  ROLES.ADMIN, 
  ROLES.USER,
  ROLES.CREATOR
);

/**
 * Middleware: Check if user owns the resource or is admin
 * @param {Function} getOwnerId - Async function that returns the owner ID from request
 * @returns {Function} Express middleware
 * 
 * @example
 * router.put('/session/:id', requireAuth, requireOwnerOrAdmin(async (req) => {
 *   const session = await LiveRoomSession.findById(req.params.id);
 *   return session?.artistId?.toString();
 * }), handler);
 */
export function requireOwnerOrAdmin(getOwnerId) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "Authentication required" });
    }
    
    // Admins can access anything
    if (hasRole(req.user, [ROLES.ADMIN])) {
      return next();
    }
    
    try {
      const ownerId = await getOwnerId(req);
      const userId = req.user.id || req.user._id;
      
      if (ownerId && ownerId.toString() === userId.toString()) {
        return next();
      }
      
      return res.status(403).json({ 
        ok: false, 
        error: "Access denied. You do not own this resource.",
        code: "NOT_OWNER",
      });
    } catch (err) {
      return res.status(500).json({ ok: false, error: "Error checking ownership" });
    }
  };
}

/**
 * Middleware: Check if user is a participant in a session (artist or engineer)
 * @param {Function} getSession - Async function that returns the session from request
 * @returns {Function} Express middleware
 */
export function requireSessionParticipant(getSession) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "Authentication required" });
    }
    
    // Admins can access anything
    if (hasRole(req.user, [ROLES.ADMIN])) {
      return next();
    }
    
    try {
      const session = await getSession(req);
      if (!session) {
        return res.status(404).json({ ok: false, error: "Session not found" });
      }
      
      const userId = (req.user.id || req.user._id).toString();
      const isArtist = session.artistId?.toString() === userId;
      const isEngineer = session.engineerId?.toString() === userId;
      
      if (isArtist || isEngineer) {
        req.sessionRole = isEngineer ? "engineer" : "artist";
        return next();
      }
      
      return res.status(403).json({ 
        ok: false, 
        error: "Access denied. You are not a participant in this session.",
        code: "NOT_PARTICIPANT",
      });
    } catch (err) {
      return res.status(500).json({ ok: false, error: "Error checking session participation" });
    }
  };
}

export default {
  requireRole,
  requireEngineer,
  requireArtist,
  requireAdmin,
  requireEngineerOrAdmin,
  requireStudioAccess,
  requireOwnerOrAdmin,
  requireSessionParticipant,
  hasRole,
  ROLES,
};

