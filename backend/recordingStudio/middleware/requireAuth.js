// backend/recordingStudio/middleware/requireAuth.js

export const requireAuth = (req, res, next) => {
  try {
    // Placeholder logic — ALWAYS allow for now
    // Later: you'll hook in JWT or Supabase auth here
    req.user = { id: "system-dev-user" };
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
      details: err.message,
    });
  }
};
