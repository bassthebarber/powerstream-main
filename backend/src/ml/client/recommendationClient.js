// backend/src/ml/client/recommendationClient.js
// Node.js client for ML microservice
import env from "../../config/env.js";
import { logger } from "../../config/logger.js";

const ML_SERVICE_URL = env.ML_SERVICE_URL || "http://localhost:5200";
const TIMEOUT_MS = 5000;

/**
 * ML Service client for recommendations
 */
const recommendationClient = {
  /**
   * Check if ML service is available
   */
  async isAvailable() {
    try {
      const response = await fetch(`${ML_SERVICE_URL}/health`, {
        method: "GET",
        timeout: 2000,
      });
      return response.ok;
    } catch {
      return false;
    }
  },
  
  /**
   * Rank content for a user's feed
   */
  async rankContent(userId, contentIds = [], options = {}) {
    try {
      const response = await fetch(`${ML_SERVICE_URL}/rank`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          content_ids: contentIds,
          limit: options.limit || 20,
          offset: options.offset || 0,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      
      if (!response.ok) {
        throw new Error(`ML service returned ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      logger.error("ML rankContent failed:", err.message);
      return null;
    }
  },
  
  /**
   * Find similar content
   */
  async findSimilar(contentId, contentType = "post", limit = 10) {
    try {
      const response = await fetch(`${ML_SERVICE_URL}/similar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_id: contentId,
          content_type: contentType,
          limit,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      
      if (!response.ok) {
        throw new Error(`ML service returned ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      logger.error("ML findSimilar failed:", err.message);
      return null;
    }
  },
  
  /**
   * Analyze user preferences
   */
  async analyzePreferences(userId, activity = []) {
    try {
      const response = await fetch(`${ML_SERVICE_URL}/user/preferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          activity,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      
      if (!response.ok) {
        throw new Error(`ML service returned ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      logger.error("ML analyzePreferences failed:", err.message);
      return null;
    }
  },
  
  /**
   * Moderate content
   */
  async moderateContent(contentType, content) {
    try {
      const response = await fetch(`${ML_SERVICE_URL}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: contentType,
          content,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      
      if (!response.ok) {
        throw new Error(`ML service returned ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      logger.error("ML moderateContent failed:", err.message);
      // Default to safe if service unavailable
      return { safe: true, action: "approve", error: err.message };
    }
  },
};

export default recommendationClient;



