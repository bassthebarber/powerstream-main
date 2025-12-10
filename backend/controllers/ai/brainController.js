// backend/controllers/ai/brainController.js
// Brain system controller per Overlord Spec
import { sendSuccess, sendError } from "../../utils/response.js";
import brainService from "../../services/ai/brain.service.js";
import eventBus from "../../utils/eventBus.js";

/**
 * GET /api/brain/status
 * Get Brain system status
 */
export async function getStatus(req, res, next) {
  try {
    const status = await brainService.getStatus();
    return sendSuccess(res, { status });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/brain/command
 * Execute a Brain command
 */
export async function executeCommand(req, res, next) {
  try {
    const adminId = req.user.id;
    const { command, params } = req.body;
    
    if (!command) {
      return sendError(res, "Command is required", 400, "MISSING_COMMAND");
    }
    
    const result = await brainService.executeCommand(adminId, command, params);
    
    // Emit event for Copilot to monitor
    eventBus.emit("BRAIN_COMMAND_EXECUTED", {
      adminId,
      command,
      result,
    });
    
    if (!result.success) {
      return sendError(res, result.message, 400, result.code);
    }
    
    return sendSuccess(res, result.data, `Command "${command}" executed`);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/brain/history
 * Get command execution history
 */
export async function getCommandHistory(req, res, next) {
  try {
    const { limit = 50, skip = 0 } = req.query;
    
    const history = await brainService.getCommandHistory({
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
    
    return sendSuccess(res, { history });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/brain/diagnostics
 * Run system diagnostics
 */
export async function runDiagnostics(req, res, next) {
  try {
    const adminId = req.user.id;
    const { subsystems } = req.body;
    
    const diagnostics = await brainService.runDiagnostics(adminId, subsystems);
    
    return sendSuccess(res, { diagnostics });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/brain/repair/:subsystem
 * Repair a specific subsystem
 */
export async function repairSubsystem(req, res, next) {
  try {
    const adminId = req.user.id;
    const { subsystem } = req.params;
    const { force } = req.body;
    
    const result = await brainService.repairSubsystem(adminId, subsystem, { force });
    
    eventBus.emit("BRAIN_REPAIR_EXECUTED", {
      adminId,
      subsystem,
      result,
    });
    
    if (!result.success) {
      return sendError(res, result.message, 400, result.code);
    }
    
    return sendSuccess(res, result.data, `Subsystem "${subsystem}" repair initiated`);
  } catch (error) {
    next(error);
  }
}

export default {
  getStatus,
  executeCommand,
  getCommandHistory,
  runDiagnostics,
  repairSubsystem,
};


