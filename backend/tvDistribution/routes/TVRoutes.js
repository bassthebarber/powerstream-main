// backend/tvDistribution/routes/tvRoutes.js
import { Router } from "express";
import * as tvController from "../controllers/TVController.js";

const router = Router();

router.get("/roku/feed", tvController.rokuFeed);
router.get("/fire/config", tvController.fireFeed);
router.get("/apple/feed", tvController.appleFeed);

export default router;
