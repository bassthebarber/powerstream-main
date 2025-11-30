// backend/routes/autopilotRoutes.js
import { Router } from "express";

const router = Router();

/**
 * Health check
 * GET /api/autopilot/health
 */
router.get("/health", (req, res) => {
  res.json({ ok: true, route: "/api/autopilot" });
});

/**
 * Example: POST /api/autopilot/start
 */
router.post("/start", (req, res) => {
  res.json({ ok: true, message: "Autopilot started" });
});

/**
 * Example: POST /api/autopilot/stop
 */
router.post("/stop", (req, res) => {
  res.json({ ok: true, message: "Autopilot stopped" });
});

export default router;
