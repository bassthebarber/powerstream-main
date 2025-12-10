// backend/routes/monetization/adsRoutes.js
// Ad system routes per Overlord Spec
import { Router } from "express";
import {
  getActiveAds,
  getAdSlots,
  createAdSlot,
  updateAdSlot,
  deleteAdSlot,
  recordImpression,
  recordClick,
  getAdStats,
} from "../../controllers/monetization/adsController.js";
import { requireAuth, requireRole } from "../../middleware/authMiddleware.js";

const router = Router();

// Public routes
// GET /api/ads/active/:location - Get active ads for a location
router.get("/active/:location", getActiveAds);

// POST /api/ads/:id/impression - Record ad impression
router.post("/:id/impression", recordImpression);

// POST /api/ads/:id/click - Record ad click
router.post("/:id/click", recordClick);

// Protected routes (advertiser)
router.use(requireAuth);

// GET /api/ads/slots - Get all ad slots (admin only)
router.get("/slots", requireRole("admin"), getAdSlots);

// POST /api/ads/slots - Create new ad slot (admin only)
router.post("/slots", requireRole("admin"), createAdSlot);

// PATCH /api/ads/slots/:id - Update ad slot
router.patch("/slots/:id", updateAdSlot);

// DELETE /api/ads/slots/:id - Delete ad slot
router.delete("/slots/:id", deleteAdSlot);

// GET /api/ads/stats/:id - Get ad statistics
router.get("/stats/:id", getAdStats);

export default router;



