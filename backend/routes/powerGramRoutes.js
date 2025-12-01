// backend/routes/powerGramRoutes.js
import { Router } from "express";
import {
  getGrams,
  createGram,
  likeGram,
  commentOnGram,
} from "../controllers/powerGramController.js";

const router = Router();

router.get("/", getGrams);
router.post("/", createGram);
router.post("/:id/like", likeGram);
router.post("/:id/comment", commentOnGram);

export default router;
