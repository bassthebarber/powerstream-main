// backend/services/aiCopilotService.js
import CopilotTask from "../models/copilotTask.js";
import logUplink from "../logs/logUplink.js";
import overrideCore from "../copilot/overrideCore.js";

/**
 * Executes a Copilot command from voice, typed input, or admin trigger
 * @param {string} command - The command to process
 * @param {object} context - Context (userId, source, stationId, etc.)
 * @returns {Promise<object>} - Result of execution
 */
export async function executeCopilotCommand(command, context = {}) {
  try {
    logUplink('AICopilotService', 'info', `Executing Copilot command: "${command}"`, context);

    const task = new CopilotTask({
      command,
      triggeredBy: context.userId || 'system',
      source: context.source || 'unknown',
      status: 'processing',
    });
    await task.save();

    // Run command through override core
    const result = await overrideCore.execute(command, context);

    task.status = result.success ? 'completed' : 'failed';
    task.result = result;
    await task.save();

    logUplink('AICopilotService', 'debug', `Copilot result: ${JSON.stringify(result)}`);

    return {
      success: result.success,
      message: result.message || 'Copilot task finished',
      taskId: task._id,
      result: result.result || null,
    };
  } catch (err) {
    logUplink('AICopilotService', 'error', 'Copilot execution failed', { error: err.message });

    return {
      success: false,
      message: 'AI Copilot failed to execute command',
      error: err.message,
    };
  }
}

/**
 * Logs Copilot activity to history for audit
 * @param {string} userId
 * @param {string} command
 * @param {string} outcome
 */
export async function logCopilotHistory(userId, command, outcome) {
  const entry = new CopilotTask({
    command,
    triggeredBy: userId,
    status: 'manual-log',
    result: outcome,
  });

  await entry.save();
  logUplink('AICopilotService', 'info', 'Manual copilot log entry saved', { userId, command });
}

export default {
  executeCopilotCommand,
  logCopilotHistory,
};
