// backend/routes/monetization/payoutRoutes.js
// Payout/withdrawal routes per Overlord Spec
import { Router } from "express";
import {
  requestPayout,
  getMyRequests,
  cancelRequest,
} from "../../controllers/monetization/payoutController.js";
import { requireAuth } from "../../middleware/authMiddleware.js";

const router = Router();

// All payout routes require authentication
router.use(requireAuth);

// POST /api/payouts/request - Request a withdrawal
router.post("/request", requestPayout);

// GET /api/payouts/my-requests - Get user's withdrawal requests
router.get("/my-requests", getMyRequests);

// DELETE /api/payouts/:id - Cancel a pending request
router.delete("/:id", cancelRequest);

export default router;



