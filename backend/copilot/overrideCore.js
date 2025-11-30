// backend/copilot/overrideCore.js

const logUplink = require('../logs/logUplink');
const overrideHandler = require('./overrideHandler');
const openaiBridge = require('./openaiBridge');
const systemOverride = require('../utils/systemOverride');

const overrideCore = {
  /**
   * Main entry point for Copilot override command.
   * @param {string} command - Voice or manual override input
   * @param {object} context - Optional context (user, station, source)
   */
  async execute(command, context = {}) {
    logUplink('OverrideCore', 'info', `Received override command: "${command}"`, context);

    // Normalize command input
    const cleanCommand = command.trim().toLowerCase();

    // Check for known hardcoded override triggers
    const handled = await overrideHandler.route(cleanCommand, context);
    if (handled.success) {
      logUplink('OverrideCore', 'info', `Override handled by overrideHandler`, { result: handled });
      return handled;
    }

    // Fallback: Ask OpenAI what to do with the command
    try {
      const aiResponse = await openaiBridge.askOverride(cleanCommand, context);
      logUplink('OverrideCore', 'debug', 'OpenAI fallback result', aiResponse);

      if (aiResponse?.action) {
        const execResult = await systemOverride.perform(aiResponse.action, context);
        return { success: true, result: execResult };
      } else {
        return { success: false, message: 'Unrecognized override command.' };
      }
    } catch (err) {
      logUplink('OverrideCore', 'error', 'Failed to process override', { error: err.message });
      return { success: false, error: err.message };
    }
  },
};

module.exports = overrideCore;
