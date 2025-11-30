// backend/routes/brainRoutes.js
import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import { saveSnapshot } from "../utils/logs/SnapshotLogger.js";

const router = Router();

router.get("/health", (_req, res) => res.json({ brain: "online" }));

router.post("/task", verifyToken, (req, res) => {
  saveSnapshot("brain_task", { by: req.user?._id, task: req.body?.task });
  res.json({ ok: true, accepted: true });
});

export default router;
