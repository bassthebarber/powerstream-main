import { Router } from "express";
const router = Router();
import SovereignBuild from "../sovereign/SovereignBuild.js";

router.post('/build', async (req, res) => {
  const result = await SovereignBuild();
  res.json(result);
});

export default router;
