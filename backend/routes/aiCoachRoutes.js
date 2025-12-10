// backend/routes/aiCoachRoutes.js

import express from "express";
import {
  analyzePerformanceController,
  listSessionsController,
  getSessionController,
  getRecentTakesController,
  listPersonasController,
  getPersonaController,
  upsertPersonaController,
  deletePersonaController,
  seedPersonasController,
} from "../controllers/aiCoachController.js";

const router = express.Router();

// ==========================================
// PERFORMANCE ANALYSIS
// ==========================================

// Artist: send performance to AI Coach
router.post("/analyze", analyzePerformanceController);

// Get all analyzed sessions (admin/dashboard)
router.get("/sessions", listSessionsController);

// Get single session by ID
router.get("/sessions/:id", getSessionController);

// Get recent takes for a track (Compare Takes feature)
router.get("/takes/recent", getRecentTakesController);

// ==========================================
// COACH PERSONAS (Admin)
// ==========================================

// Seed default personas (call once to initialize)
router.post("/personas/seed", seedPersonasController);

// List all personas
router.get("/personas", listPersonasController);

// Get single persona by key
router.get("/personas/:key", getPersonaController);

// Create or update persona
router.post("/personas", upsertPersonaController);

// Delete persona
router.delete("/personas/:key", deletePersonaController);

export default router;
