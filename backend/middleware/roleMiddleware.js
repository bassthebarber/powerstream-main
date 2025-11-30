// backend/middleware/roleMiddleware.js
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;
    if (user && allowedRoles.includes(user.role)) {
      return next();
    } else {
      return res.status(403).json({ error: `Access denied: Requires one of roles [${allowedRoles.join(', ')}]` });
    }
  };
};
