// backend/routes/powerStreamTVRoutes.js
import { Router } from "express";
import {
  getTitles,
  getTitleById,
  createTitle,
  unlockTitle,
} from "../controllers/powerStreamTVController.js";

const router = Router();

router.get("/titles", getTitles);
router.get("/titles/:id", getTitleById);
router.post("/titles", createTitle);
router.post("/titles/:id/unlock", unlockTitle);

export default router;


