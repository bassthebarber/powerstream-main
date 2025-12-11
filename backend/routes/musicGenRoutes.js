import express from "express";
import { generateMusic } from "../controllers/musicgenController.js";

const router = express.Router();

// Health check
router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "MusicGen API" });
});

// Generate audio
router.post("/generate", generateMusic);

export default router;
