// backend/routes/presenceRoutes.js
import express from "express";
import {
  getPresence,
  setPresence,
  touchPresence,
  listOnline,
} from "../controllers/UserPresenceController.js";
// import { protect } from "../middleware/authMiddleware.js"; // enable if needed

const router = Router();

// router.use(protect);

router.get("/online", listOnline);          // GET /api/presence/online
router.get("/:userId", getPresence);        // GET /api/presence/:userId
router.post("/:userId", setPresence);       // POST /api/presence/:userId
router.post("/:userId/touch", touchPresence); // POST /api/presence/:userId/touch

export default router;
