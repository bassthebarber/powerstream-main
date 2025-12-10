// backend/controllers/ai/copilotController.js
// Copilot system controller per Overlord Spec
import { sendSuccess, sendError, sendNotFound } from "../../utils/response.js";
import copilotService from "../../services/ai/copilot.service.js";

/**
 * GET /api/copilot/status
 * Get Copilot status
 */
export async function getStatus(req, res, next) {
  try {
    const status = await copilotService.getStatus();
    return sendSuccess(res, { status });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/copilot/events
 * Get recent Copilot events
 */
export async function getEvents(req, res, next) {
  try {
    const { limit = 50, skip = 0, type } = req.query;
    
    const events = await copilotService.getEvents({
      limit: parseInt(limit),
      skip: parseInt(skip),
      type,
    });
    
    return sendSuccess(res, { events });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/copilot/intent
 * Process an intent/command through Copilot
 */
export async function processIntent(req, res, next) {
  try {
    const userId = req.user.id;
    const { intent, context, params } = req.body;
    
    if (!intent) {
      return sendError(res, "Intent is required", 400, "MISSING_INTENT");
    }
    
    const result = await copilotService.processIntent(userId, intent, {
      context,
      params,
    });
    
    if (!result.success) {
      return sendError(res, result.message, 400, result.code);
    }
    
    return sendSuccess(res, result.data);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/copilot/mode
 * Set Copilot operating mode
 */
export async function setMode(req, res, next) {
  try {
    const adminId = req.user.id;
    const { mode } = req.body;
    
    const validModes = ["safe", "normal", "aggressive", "maintenance"];
    if (!mode || !validModes.includes(mode)) {
      return sendError(
        res,
        `Invalid mode. Valid options: ${validModes.join(", ")}`,
        400,
        "INVALID_MODE"
      );
    }
    
    const result = await copilotService.setMode(adminId, mode);
    
    if (!result.success) {
      return sendError(res, result.message, 400, result.code);
    }
    
    return sendSuccess(res, { mode: result.mode }, `Mode set to "${mode}"`);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/copilot/alerts
 * Get system alerts
 */
export async function getAlerts(req, res, next) {
  try {
    const { status, severity, limit = 50 } = req.query;
    
    const alerts = await copilotService.getAlerts({
      status,
      severity,
      limit: parseInt(limit),
    });
    
    return sendSuccess(res, { alerts });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/copilot/alerts/:id/acknowledge
 * Acknowledge an alert
 */
export async function acknowledgeAlert(req, res, next) {
  try {
    const adminId = req.user.id;
    const { id } = req.params;
    const { notes } = req.body;
    
    const result = await copilotService.acknowledgeAlert(id, adminId, notes);
    
    if (!result.success) {
      if (result.code === "NOT_FOUND") {
        return sendNotFound(res, result.message);
      }
      return sendError(res, result.message, 400, result.code);
    }
    
    return sendSuccess(res, { alert: result.alert }, "Alert acknowledged");
  } catch (error) {
    next(error);
  }
}

export default {
  getStatus,
  getEvents,
  processIntent,
  setMode,
  getAlerts,
  acknowledgeAlert,
};


