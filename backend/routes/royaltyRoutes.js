import { Router } from "express";
import {
  createWorkFromExport,
  logPlay,
  getWorkSummary,
  listWorks,
} from "../controllers/royaltyController.js";

const router = Router();

router.post("/work-from-export", createWorkFromExport);
router.post("/log-play", logPlay);
router.get("/work/:id", getWorkSummary);
router.get("/works", listWorks);

export default router;
