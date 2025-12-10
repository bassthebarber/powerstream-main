// backend/recordingStudio/middleware/requireRole.js

export const ROLES = {
  ADMIN: "admin",
  ENGINEER: "engineer",
  ARTIST: "artist",
  PRODUCER: "producer",
  STAFF: "staff",
};

/**
 * Middleware to require specific role(s)
 * @param {string|string[]} allowedRoles - Role(s) that can access the route
 */
export const requireRole = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          ok: false,
          error: "Unauthorized - No user found",
        });
      }

      const userRoles = req.user.roles || [req.user.role];
      const hasRole = roles.some(role => userRoles.includes(role));

      if (!hasRole) {
        return res.status(403).json({
          ok: false,
          error: `Forbidden - Requires one of: ${roles.join(", ")}`,
        });
      }

      next();
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: "Role check failed",
        details: err.message,
      });
    }
  };
};

/**
 * Middleware to require engineer role
 */
export const requireEngineer = requireRole([ROLES.ENGINEER, ROLES.ADMIN]);

/**
 * Middleware to require admin role
 */
export const requireAdmin = requireRole([ROLES.ADMIN]);

/**
 * Middleware to require artist role
 */
export const requireArtist = requireRole([ROLES.ARTIST, ROLES.ADMIN]);

/**
 * Middleware to require producer role
 */
export const requireProducer = requireRole([ROLES.PRODUCER, ROLES.ADMIN]);

/**
 * Middleware to check if user is a session participant
 */
export const requireSessionParticipant = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { sessionId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    if (!sessionId) {
      return next(); // Let the route handler deal with missing sessionId
    }

    // Check if user is admin
    const userRoles = req.user.roles || [req.user.role];
    if (userRoles.includes(ROLES.ADMIN)) {
      return next();
    }

    // Check session participation - defer to route for actual validation
    req.requiresParticipantCheck = true;
    next();
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: "Session participant check failed",
      details: err.message,
    });
  }
};

export default requireRole;

