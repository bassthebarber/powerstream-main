import express from "express";
import { generateBeat } from "../controllers/recordingStudioController.js";

const router = express.Router();

router.post("/generate", generateBeat);

export default router;
