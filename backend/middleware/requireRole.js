// backend/middleware/requireRole.js
// Simple role-based authorization middleware

export function requireRole(...allowedRoles) {
  const allowed = allowedRoles.flat();

  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const primaryRole = user.role;
    const roles = Array.isArray(user.roles) ? user.roles : [primaryRole].filter(Boolean);

    const hasRole =
      (primaryRole && allowed.includes(primaryRole)) ||
      roles.some((r) => allowed.includes(r));

    if (!hasRole) {
      return res.status(403).json({
        message: `Access denied. Requires one of roles: [${allowed.join(", ")}]`,
      });
    }

    next();
  };
}

export default requireRole;



