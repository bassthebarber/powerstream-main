// frontend/src/api/brainApi.js
// Brain Mode API - Voice/Command processing
import httpClient from './httpClient.js';
import { ENDPOINTS } from '../config/apiConfig.js';

/**
 * Brain Mode API
 * Handles voice commands, navigation, and automation
 */
export const brainApi = {
  /**
   * Process a voice or text command
   * @param {string} command - The command text
   * @param {object} context - Optional context (current page, selected items, etc.)
   */
  async processCommand(command, context = {}) {
    const response = await httpClient.post(ENDPOINTS.BRAIN.COMMAND, {
      command,
      context,
    });
    return response.data;
  },
  
  /**
   * Process a navigation command
   * @param {string} command - Navigation command (e.g., "go to feed")
   */
  async processNavigation(command) {
    const response = await httpClient.post(ENDPOINTS.BRAIN.NAVIGATE, {
      command,
    });
    return response.data;
  },
  
  /**
   * Execute an automation action
   * @param {string} action - Action name
   * @param {object} params - Action parameters
   */
  async executeAction(action, params = {}) {
    const response = await httpClient.post(ENDPOINTS.BRAIN.ACTION, {
      action,
      params,
    });
    return response.data;
  },
  
  /**
   * Get available intents/commands
   */
  async getAvailableIntents() {
    const response = await httpClient.get(ENDPOINTS.BRAIN.INTENTS);
    return response.data.intents;
  },
  
  /**
   * Get command history
   * @param {number} limit - Number of items to return
   */
  async getHistory(limit = 50) {
    const response = await httpClient.get(`${ENDPOINTS.BRAIN.COMMAND}/history`, {
      params: { limit },
    });
    return response.data.history;
  },
  
  /**
   * Submit feedback on a command result
   * @param {string} commandId - The command ID
   * @param {object} feedback - Feedback data
   */
  async submitFeedback(commandId, feedback) {
    const response = await httpClient.post(`${ENDPOINTS.BRAIN.COMMAND}/feedback`, {
      commandId,
      ...feedback,
    });
    return response.data;
  },
};

export default brainApi;



