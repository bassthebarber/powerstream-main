import express from "express";
const router = express.Router();

/**
 * Fallback Authentication Route
 * This prevents the server from crashing if
 * real authentication isn't implemented yet.
 */

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Auth routes placeholder working."
  });
});

export default router;
