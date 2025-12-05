// backend/routes/studioSessionRoutes.js
// Studio Session/Project Management Routes
import { Router } from "express";
import { saveSession, listSessions, getSession } from "../controllers/studioSessionController.js";
import { authRequired } from "../middleware/requireAuth.js";

const router = Router();

// All routes require authentication
router.use(authRequired);

/**
 * Save session/project
 * POST /api/studio/sessions/save
 */
router.post("/save", saveSession);

/**
 * List sessions for current user
 * GET /api/studio/sessions
 */
router.get("/", listSessions);

/**
 * Get session by ID
 * GET /api/studio/sessions/:id
 */
router.get("/:id", getSession);

export default router;

