// backend/ai/copilot/HookPoints.js
// Hook points for key system flows per Overlord Spec
import { logger } from "../../utils/logger.js";

/**
 * HookPoints defines handlers for key system events.
 * Each hook can return alerts, actions, or both.
 */
class HookPoints {
  constructor(copilot) {
    this.copilot = copilot;
    this.hooks = this.defineHooks();
  }
  
  /**
   * Define all hook handlers
   */
  defineHooks() {
    return {
      // User registration hook
      user_registered: async (data) => {
        logger.debug("Hook: user_registered", data);
        
        return {
          handled: true,
          // Welcome email could be triggered here
        };
      },
      
      // User login hook
      user_login: async (data) => {
        logger.debug("Hook: user_login", data);
        
        // Could detect suspicious login patterns
        return { handled: true };
      },
      
      // Post creation hook
      post_created: async (data) => {
        logger.debug("Hook: post_created", data);
        
        // Could trigger content moderation
        return { handled: true };
      },
      
      // Stream started hook
      stream_started: async (data) => {
        logger.debug("Hook: stream_started", data);
        
        return {
          handled: true,
          // Could start quality monitoring
        };
      },
      
      // Stream error hook
      stream_error: async (data) => {
        logger.debug("Hook: stream_error", data);
        
        return {
          handled: true,
          severity: "high",
          alert: `Stream error: ${data.error || "Unknown error"}`,
          action: { type: "notify_admin", params: data },
        };
      },
      
      // Station offline hook
      station_offline: async (data) => {
        logger.debug("Hook: station_offline", data);
        
        return {
          handled: true,
          severity: "critical",
          alert: `Station ${data.stationId || "unknown"} went offline`,
          action: { type: "trigger_repair", params: { subsystem: "tv" } },
        };
      },
      
      // Coins sent hook
      coins_sent: async (data) => {
        logger.debug("Hook: coins_sent", data);
        
        // Detect large transactions
        if (data.amount && data.amount > 1000) {
          return {
            handled: true,
            severity: "medium",
            alert: `Large coin transfer: ${data.amount} coins`,
          };
        }
        
        return { handled: true };
      },
      
      // Withdrawal requested hook
      withdrawal_requested: async (data) => {
        logger.debug("Hook: withdrawal_requested", data);
        
        // Flag large withdrawals
        if (data.amount && data.amount > 5000) {
          return {
            handled: true,
            severity: "high",
            alert: `Large withdrawal request: ${data.amount} coins`,
          };
        }
        
        return { handled: true };
      },
      
      // Brain command hook
      brain_command: async (data) => {
        logger.debug("Hook: brain_command", data);
        
        // Log brain activity
        return { handled: true };
      },
      
      // Error hook
      error: async (data) => {
        logger.debug("Hook: error", data);
        
        const severity = data.severity || "medium";
        
        return {
          handled: true,
          severity,
          alert: `System error: ${data.message || "Unknown error"}`,
          action: severity === "critical" 
            ? { type: "trigger_repair", params: data }
            : null,
        };
      },
    };
  }
  
  /**
   * Execute a hook
   */
  async execute(type, data) {
    const hook = this.hooks[type];
    
    if (!hook) {
      logger.debug(`No hook defined for: ${type}`);
      return { handled: false };
    }
    
    try {
      return await hook(data);
    } catch (error) {
      logger.error(`Hook execution failed: ${type}`, error);
      return { handled: false, error: error.message };
    }
  }
  
  /**
   * Register a custom hook
   */
  registerHook(type, handler) {
    this.hooks[type] = handler;
  }
  
  /**
   * Get available hooks
   */
  getAvailableHooks() {
    return Object.keys(this.hooks);
  }
}

export default HookPoints;


