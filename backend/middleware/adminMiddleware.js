// backend/middleware/adminMiddleware.js
export const isAdmin = (req, res, next) => {
  const user = req.user;
  if (user && user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied: Admins only' });
  }
};
