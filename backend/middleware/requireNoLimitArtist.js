// backend/middleware/requireNoLimitArtist.js

/**
 * Middleware to restrict access to No Limit East Houston artists and Label Admins.
 * Use this to gate premium/advanced features.
 * 
 * In development (NODE_ENV !== 'production'), this middleware allows all requests through
 * so you can test premium features without authentication.
 */
export default function requireNoLimitArtist(req, res, next) {
  // In development, allow all requests through for testing
  if (process.env.NODE_ENV !== "production") {
    return next();
  }

  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (user.label === "NO_LIMIT_EAST_HOUSTON" || user.label === "LABEL_ADMIN") {
    return next();
  }

  return res.status(403).json({
    message: "This advanced feature is reserved for No Limit East Houston artists.",
  });
}



