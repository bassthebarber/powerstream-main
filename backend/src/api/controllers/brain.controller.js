// backend/src/api/controllers/brain.controller.js
// Brain Mode Controller - Processes voice/text commands
import { asyncHandler } from "../middleware/error.middleware.js";
import brainService from "../../services/brain.service.js";
import eventsService from "../../services/events.service.js";
import { logger } from "../../config/logger.js";

/**
 * Brain Mode Controller
 * Handles voice/text command processing and navigation
 */
const brainController = {
  /**
   * Process a voice or text command
   * POST /api/brain/commands
   */
  processCommand: asyncHandler(async (req, res) => {
    const { command, context } = req.body;
    const userId = req.user.id;
    
    if (!command) {
      return res.status(400).json({
        success: false,
        message: "Command is required",
      });
    }
    
    // Process the command
    const result = await brainService.processCommand(userId, command, context);
    
    // Log the command event
    await eventsService.logEvent(userId, "brain_command", "user", userId, {
      command,
      intent: result.intent,
      success: result.success,
    });
    
    res.json({
      success: true,
      result,
    });
  }),
  
  /**
   * Process a navigation command
   * POST /api/brain/navigation
   */
  processNavigation: asyncHandler(async (req, res) => {
    const { command } = req.body;
    const userId = req.user.id;
    
    if (!command) {
      return res.status(400).json({
        success: false,
        message: "Navigation command is required",
      });
    }
    
    // Process navigation
    const result = await brainService.processNavigation(command);
    
    // Log navigation
    await eventsService.logEvent(userId, "brain_navigation", "user", userId, {
      command,
      destination: result.destination,
    });
    
    res.json({
      success: true,
      ...result,
    });
  }),
  
  /**
   * Execute an automation action
   * POST /api/brain/actions
   */
  executeAction: asyncHandler(async (req, res) => {
    const { action, params } = req.body;
    const userId = req.user.id;
    
    if (!action) {
      return res.status(400).json({
        success: false,
        message: "Action is required",
      });
    }
    
    // Execute the action
    const result = await brainService.executeAction(userId, action, params);
    
    // Log action
    await eventsService.logEvent(userId, "brain_action", "user", userId, {
      action,
      success: result.success,
    });
    
    res.json({
      success: true,
      result,
    });
  }),
  
  /**
   * Get available intents/commands
   * GET /api/brain/intents
   */
  getAvailableIntents: asyncHandler(async (req, res) => {
    const intents = brainService.getAvailableIntents();
    
    res.json({
      success: true,
      intents,
    });
  }),
  
  /**
   * Get command history for user
   * GET /api/brain/history
   */
  getCommandHistory: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { limit = 50 } = req.query;
    
    const history = await brainService.getCommandHistory(userId, parseInt(limit));
    
    res.json({
      success: true,
      history,
    });
  }),
  
  /**
   * Submit feedback on a command result
   * POST /api/brain/feedback
   */
  submitFeedback: asyncHandler(async (req, res) => {
    const { commandId, feedback, rating } = req.body;
    const userId = req.user.id;
    
    await brainService.submitFeedback(userId, commandId, { feedback, rating });
    
    res.json({
      success: true,
      message: "Feedback submitted",
    });
  }),
};

export default brainController;




