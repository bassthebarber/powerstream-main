// backend/src/api/routes/tv.routes.js
// Canonical TV routes (stations, streams, guide)
import { Router } from "express";
import tvController from "../controllers/tv.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.get("/stations", optionalAuth, tvController.getStations);
router.get("/stations/:slug", optionalAuth, tvController.getStation);
router.get("/live", tvController.getLiveStations);
router.get("/guide", tvController.getTVGuide);

// Protected routes - user's stations
router.get("/my-stations", requireAuth, tvController.getMyStations);

// Protected routes - station management
router.post("/stations", requireAuth, tvController.createStation);
router.put("/stations/:id", requireAuth, tvController.updateStation);
router.delete("/stations/:id", requireAuth, tvController.deleteStation);

// Stream management
router.get("/stations/:id/stream-key", requireAuth, tvController.getStreamKey);
router.post("/stations/:id/stream-key/regenerate", requireAuth, tvController.regenerateStreamKey);
router.post("/stations/:id/go-live", requireAuth, tvController.goLive);
router.post("/stations/:id/end-stream", requireAuth, tvController.endStream);

export default router;




