// backend/routes/tgtRoutes.js
import { Router } from "express";
import {
  getContestants,
  createContestant,
  voteForContestant,
  getLeaderboard,
} from "../controllers/tgtController.js";

const router = Router();

router.get("/contestants", getContestants);
router.post("/contestants", createContestant);
router.post("/contestants/:id/vote", voteForContestant);
router.get("/leaderboard", getLeaderboard);

export default router;






