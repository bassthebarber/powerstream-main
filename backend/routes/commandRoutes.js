// backend/routes/commandRoutes.js
import { Router } from "express";

const router = Router();

/**
 * Health check for command API
 * GET /api/commands/health
 */
router.get("/health", (req, res) => {
  res.json({ ok: true, route: "/api/commands" });
});

/**
 * Example: POST /api/commands/run
 * Body: { command: "reboot", args: {...} }
 */
router.post("/run", (req, res) => {
  const { command, args } = req.body;
  res.json({ ok: true, executed: { command, args } });
});

export default router;
