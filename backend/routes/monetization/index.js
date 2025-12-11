// backend/routes/monetization/index.js
// Monetization routes aggregator per Overlord Spec
import { Router } from "express";
import coinsRoutes from "./coinsRoutes.js";
import payoutRoutes from "./payoutRoutes.js";
import subscriptionsRoutes from "./subscriptionsRoutes.js";
import adsRoutes from "./adsRoutes.js";
import adminFinanceRoutes from "./adminFinanceRoutes.js";

const router = Router();

// Mount all monetization sub-routes
router.use("/coins", coinsRoutes);
router.use("/payouts", payoutRoutes);
router.use("/subscriptions", subscriptionsRoutes);
router.use("/ads", adsRoutes);
router.use("/admin/finance", adminFinanceRoutes);

export default router;


