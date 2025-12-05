// backend/src/api/routes/brain.routes.js
// Brain Mode API routes - Voice/Command processing
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import brainController from "../controllers/brain.controller.js";

const router = Router();

// All brain routes require authentication
router.use(authMiddleware);

/**
 * @route POST /api/brain/commands
 * @desc Process a voice or text command
 * @access Private
 */
router.post("/commands", brainController.processCommand);

/**
 * @route POST /api/brain/navigation
 * @desc Process a navigation command
 * @access Private
 */
router.post("/navigation", brainController.processNavigation);

/**
 * @route POST /api/brain/actions
 * @desc Execute an automation action
 * @access Private
 */
router.post("/actions", brainController.executeAction);

/**
 * @route GET /api/brain/intents
 * @desc Get available intents/commands
 * @access Private
 */
router.get("/intents", brainController.getAvailableIntents);

/**
 * @route GET /api/brain/history
 * @desc Get command history for user
 * @access Private
 */
router.get("/history", brainController.getCommandHistory);

/**
 * @route POST /api/brain/feedback
 * @desc Submit feedback on a command result
 * @access Private
 */
router.post("/feedback", brainController.submitFeedback);

export default router;

