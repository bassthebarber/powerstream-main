// backend/routes/tvStationRoutes.js
import { Router } from "express";
import {
  getStations,
  getStationBySlug,
  getSouthernPowerStations,
  getWorldwideStations,
} from "../controllers/tvStationController.js";

const router = Router();

router.get("/", getStations);
router.get("/southern-power", getSouthernPowerStations);
router.get("/world", getWorldwideStations);
router.get("/:slug", getStationBySlug);

export default router;




