// /backend/recordingStudio/middleware/RollGate.js
export const restrictStudioAccess = (rolesAllowed = []) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (rolesAllowed.includes(userRole)) {
      return next();
    }
    return res.status(403).json({ error: 'Access denied' });
  };
};
