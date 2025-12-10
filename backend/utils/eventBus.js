// backend/utils/eventBus.js
// Internal event bus for system-wide events per Overlord Spec
import { EventEmitter } from "events";
import { logger } from "./logger.js";

class PowerStreamEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100); // Allow many listeners
    
    // Event history for debugging
    this.history = [];
    this.maxHistory = 1000;
    
    // Event statistics
    this.stats = {};
  }
  
  /**
   * Emit an event with logging
   */
  emit(eventName, data = {}) {
    const timestamp = new Date();
    
    // Log event
    logger.debug(`Event: ${eventName}`, { data });
    
    // Track in history
    this.history.unshift({
      event: eventName,
      data,
      timestamp,
    });
    
    // Trim history
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }
    
    // Update stats
    if (!this.stats[eventName]) {
      this.stats[eventName] = { count: 0, lastEmitted: null };
    }
    this.stats[eventName].count++;
    this.stats[eventName].lastEmitted = timestamp;
    
    // Emit the event
    return super.emit(eventName, data);
  }
  
  /**
   * Subscribe to an event with error handling
   */
  on(eventName, handler) {
    const safeHandler = async (data) => {
      try {
        await handler(data);
      } catch (error) {
        logger.error(`Event handler error for ${eventName}:`, error);
      }
    };
    
    return super.on(eventName, safeHandler);
  }
  
  /**
   * Get event history
   */
  getHistory(eventName = null, limit = 100) {
    let filtered = this.history;
    
    if (eventName) {
      filtered = this.history.filter(h => h.event === eventName);
    }
    
    return filtered.slice(0, limit);
  }
  
  /**
   * Get event statistics
   */
  getStats() {
    return { ...this.stats };
  }
  
  /**
   * Clear history
   */
  clearHistory() {
    this.history = [];
  }
}

// Singleton instance
const eventBus = new PowerStreamEventBus();

// Known event types (documentation)
export const EVENTS = {
  // User events
  USER_REGISTERED: "USER_REGISTERED",
  USER_LOGIN: "USER_LOGIN",
  USER_LOGOUT: "USER_LOGOUT",
  
  // Content events
  POST_CREATED: "POST_CREATED",
  POST_DELETED: "POST_DELETED",
  COMMENT_ADDED: "COMMENT_ADDED",
  
  // Streaming events
  STREAM_STARTED: "STREAM_STARTED",
  STREAM_ENDED: "STREAM_ENDED",
  STREAM_ERROR: "STREAM_ERROR",
  VIEWER_JOINED: "VIEWER_JOINED",
  VIEWER_LEFT: "VIEWER_LEFT",
  
  // TV/Station events
  STATION_ONLINE: "STATION_ONLINE",
  STATION_OFFLINE: "STATION_OFFLINE",
  SHOW_STARTED: "SHOW_STARTED",
  SHOW_ENDED: "SHOW_ENDED",
  
  // Chat events
  MESSAGE_SENT: "MESSAGE_SENT",
  MESSAGE_READ: "MESSAGE_READ",
  TYPING_START: "TYPING_START",
  TYPING_STOP: "TYPING_STOP",
  
  // Monetization events
  COINS_SENT: "COINS_SENT",
  COINS_RECEIVED: "COINS_RECEIVED",
  COINS_PURCHASED: "COINS_PURCHASED",
  WITHDRAWAL_REQUESTED: "WITHDRAWAL_REQUESTED",
  WITHDRAWAL_APPROVED: "WITHDRAWAL_APPROVED",
  SUBSCRIPTION_STARTED: "SUBSCRIPTION_STARTED",
  SUBSCRIPTION_CANCELLED: "SUBSCRIPTION_CANCELLED",
  
  // AI/Brain events
  BRAIN_COMMAND_EXECUTED: "BRAIN_COMMAND_EXECUTED",
  BRAIN_REPAIR_EXECUTED: "BRAIN_REPAIR_EXECUTED",
  BRAIN_REPAIR_COMPLETE: "BRAIN_REPAIR_COMPLETE",
  COPILOT_ALERT: "COPILOT_ALERT",
  COPILOT_MODE_CHANGED: "COPILOT_MODE_CHANGED",
  
  // System events
  SYSTEM_STARTUP: "SYSTEM_STARTUP",
  SYSTEM_SHUTDOWN: "SYSTEM_SHUTDOWN",
  HEALTH_CHECK: "HEALTH_CHECK",
  ERROR_OCCURRED: "ERROR_OCCURRED",
};

export default eventBus;



