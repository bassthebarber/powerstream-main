// backend/routes/ai/index.js
// AI routes aggregator per Overlord Spec
import { Router } from "express";
import aiStudioRoutes from "./aiStudioRoutes.js";
import brainRoutes from "./brainRoutes.js";
import copilotRoutes from "./copilotRoutes.js";

const router = Router();

// Mount all AI sub-routes
router.use("/studio", aiStudioRoutes);
router.use("/brain", brainRoutes);
router.use("/copilot", copilotRoutes);

export default router;



