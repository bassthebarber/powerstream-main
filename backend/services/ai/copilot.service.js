// backend/services/ai/copilot.service.js
// Copilot system service per Overlord Spec
import { logger } from "../../utils/logger.js";
import eventBus from "../../utils/eventBus.js";

// Copilot operating modes
const COPILOT_MODES = {
  safe: {
    description: "Minimal automated actions, requires approval",
    autoApprove: false,
    alertThreshold: "low",
  },
  normal: {
    description: "Standard operation with moderate automation",
    autoApprove: true,
    alertThreshold: "medium",
  },
  aggressive: {
    description: "Maximum automation, auto-repair enabled",
    autoApprove: true,
    alertThreshold: "high",
  },
  maintenance: {
    description: "Maintenance mode, reduced operations",
    autoApprove: false,
    alertThreshold: "critical",
  },
};

// Current state
let currentMode = "normal";
const events = [];
const alerts = [];

// Intent handlers
const INTENT_HANDLERS = {
  navigate: async (userId, params) => {
    return { action: "navigate", destination: params.destination };
  },
  search: async (userId, params) => {
    return { action: "search", query: params.query, results: [] };
  },
  create: async (userId, params) => {
    return { action: "create", entityType: params.type };
  },
  help: async (userId, params) => {
    return {
      action: "help",
      suggestions: [
        "Try saying 'Navigate to PowerFeed'",
        "Ask me to 'Search for music'",
        "Request to 'Create a new post'",
      ],
    };
  },
};

// Hook point handlers (called when events occur)
const hookHandlers = {
  onUserSignup: async (data) => {
    logEvent("user_signup", data);
    return { welcomed: true };
  },
  onStreamStart: async (data) => {
    logEvent("stream_start", data);
    return { monitored: true };
  },
  onLargeTransaction: async (data) => {
    if (data.amount > 1000) {
      createAlert("high", "Large transaction detected", data);
    }
    logEvent("large_transaction", data);
  },
  onStationOffline: async (data) => {
    createAlert("critical", "TV station went offline", data);
    logEvent("station_offline", data);
  },
};

// Helper to log events
function logEvent(type, data) {
  const event = {
    id: Date.now().toString(),
    type,
    data,
    timestamp: new Date(),
    mode: currentMode,
  };
  events.unshift(event);
  if (events.length > 1000) events.pop();
}

// Helper to create alerts
function createAlert(severity, message, data = {}) {
  const alert = {
    id: Date.now().toString(),
    severity,
    message,
    data,
    status: "active",
    createdAt: new Date(),
  };
  alerts.unshift(alert);
  
  eventBus.emit("COPILOT_ALERT", alert);
  logger.warn(`Copilot Alert [${severity}]: ${message}`);
}

const copilotService = {
  /**
   * Get Copilot status
   */
  async getStatus() {
    return {
      operational: true,
      mode: currentMode,
      modeConfig: COPILOT_MODES[currentMode],
      eventCount: events.length,
      activeAlerts: alerts.filter(a => a.status === "active").length,
      availableIntents: Object.keys(INTENT_HANDLERS),
    };
  },

  /**
   * Get recent events
   */
  async getEvents(options = {}) {
    const { limit = 50, skip = 0, type } = options;
    
    let filtered = events;
    if (type) {
      filtered = events.filter(e => e.type === type);
    }
    
    return filtered.slice(skip, skip + limit);
  },

  /**
   * Process an intent
   */
  async processIntent(userId, intent, options = {}) {
    const { context, params } = options;
    
    logger.info(`Copilot processing intent "${intent}" for user ${userId}`);
    
    const handler = INTENT_HANDLERS[intent];
    if (!handler) {
      return {
        success: false,
        message: `Unknown intent: ${intent}`,
        code: "UNKNOWN_INTENT",
      };
    }
    
    try {
      const result = await handler(userId, params || {});
      
      logEvent("intent_processed", {
        userId,
        intent,
        params,
        result,
      });
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      logger.error(`Intent processing failed:`, error);
      return {
        success: false,
        message: error.message,
        code: "INTENT_FAILED",
      };
    }
  },

  /**
   * Set operating mode
   */
  async setMode(adminId, mode) {
    if (!COPILOT_MODES[mode]) {
      return {
        success: false,
        message: "Invalid mode",
        code: "INVALID_MODE",
      };
    }
    
    const previousMode = currentMode;
    currentMode = mode;
    
    logEvent("mode_changed", {
      adminId,
      from: previousMode,
      to: mode,
    });
    
    eventBus.emit("COPILOT_MODE_CHANGED", { from: previousMode, to: mode });
    logger.info(`Copilot mode changed from ${previousMode} to ${mode}`);
    
    return {
      success: true,
      mode,
    };
  },

  /**
   * Get alerts
   */
  async getAlerts(options = {}) {
    const { status, severity, limit = 50 } = options;
    
    let filtered = alerts;
    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }
    if (severity) {
      filtered = filtered.filter(a => a.severity === severity);
    }
    
    return filtered.slice(0, limit);
  },

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId, adminId, notes) {
    const alert = alerts.find(a => a.id === alertId);
    
    if (!alert) {
      return {
        success: false,
        message: "Alert not found",
        code: "NOT_FOUND",
      };
    }
    
    alert.status = "acknowledged";
    alert.acknowledgedBy = adminId;
    alert.acknowledgedAt = new Date();
    alert.notes = notes;
    
    logEvent("alert_acknowledged", { alertId, adminId });
    
    return {
      success: true,
      alert,
    };
  },

  /**
   * Trigger a hook (called internally when events occur)
   */
  async triggerHook(hookName, data) {
    const handler = hookHandlers[hookName];
    if (handler) {
      try {
        return await handler(data);
      } catch (error) {
        logger.error(`Hook ${hookName} failed:`, error);
      }
    }
  },
};

// Listen for system events
eventBus.on("USER_REGISTERED", (data) => copilotService.triggerHook("onUserSignup", data));
eventBus.on("STREAM_STARTED", (data) => copilotService.triggerHook("onStreamStart", data));
eventBus.on("COINS_SENT", (data) => copilotService.triggerHook("onLargeTransaction", data));
eventBus.on("STATION_OFFLINE", (data) => copilotService.triggerHook("onStationOffline", data));

export default copilotService;


