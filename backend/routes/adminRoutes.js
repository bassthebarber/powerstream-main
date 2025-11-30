// backend/routes/adminRoutes.js
import { Router } from "express";

const router = Router();

/**
 * Health check for admin API
 * GET /api/admin/health
 */
router.get("/health", (req, res) => {
  res.json({ ok: true, route: "/api/admin" });
});

/**
 * Example: GET /api/admin/stats
 * Replace with real admin logic (DB queries, coin revenue, etc.)
 */
router.get("/stats", (req, res) => {
  res.json({
    users: 150,
    coinsSold: 2500,
    revenue: "$1,200",
  });
});

/**
 * Example: POST /api/admin/action
 */
router.post("/action", (req, res) => {
  const { action, payload } = req.body;
  res.json({ ok: true, performed: { action, payload } });
});

export default router;
