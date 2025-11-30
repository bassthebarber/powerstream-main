/**
 * InfinityCore.js
 * Core AI logic module for PowerStream Infinity System
 */

const { logStartupEvent } = require('../utils/logger');
const handleAICommand = require('../services/logicEngine');
const copilot = require('../services/copilotService');
const override = require('../services/overrideEngine');

const InfinityCore = {
  /**
   * Initialize the Infinity AI Core
   */
  async init() {
    try {
      logStartupEvent('InfinityCore', 'AI system booting up...');
      await copilot.wake();
      await override.activate();
      console.log('[🧠 InfinityCore] Initialization complete.');
    } catch (error) {
      console.error('[❌ InfinityCore] Initialization failed:', error.message);
    }
  },

  /**
   * Process a voice command through Infinity Logic
   * @param {string} transcript - Spoken command
   * @param {object} context - Session or user context
   * @returns {Promise<object>}
   */
  async processCommand(transcript, context = {}) {
    try {
      const result = await handleAICommand(transcript, context);
      return result;
    } catch (err) {
      console.error('[❌ InfinityCore] Failed to process command:', err.message);
      return { error: err.message };
    }
  }
};

module.exports = InfinityCore;
