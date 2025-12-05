// backend/routes/studioExportRoutes.js
import { Router } from "express";
import { exportProject } from "../controllers/studioExportController.js";
import { authRequired } from "../middleware/requireAuth.js";

const router = Router();

/**
 * POST /api/studio/export
 * Export project/session to PowerStream (feed or station)
 */
router.post("/", authRequired, exportProject);

export default router;


