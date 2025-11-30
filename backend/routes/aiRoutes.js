import express from "express";
import { handleAICommand } from "../controllers/aiController.js";

const router = Router();

// Main AI command route
router.post("/run", handleAICommand);

export default router;
