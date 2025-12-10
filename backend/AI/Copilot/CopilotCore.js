// backend/ai/copilot/CopilotCore.js
// Core Copilot system per Overlord Spec
import { logger } from "../../utils/logger.js";
import eventBus, { EVENTS } from "../../utils/eventBus.js";
import HookPoints from "./HookPoints.js";
import PumpPacks from "./PumpPacks.js";

/**
 * CopilotCore handles system-level events and automated decisions.
 * It monitors the system and takes actions based on configured modes.
 */
class CopilotCore {
  constructor() {
    this.isActive = true;
    this.mode = "normal"; // 'safe', 'normal', 'aggressive', 'maintenance'
    this.hookPoints = new HookPoints(this);
    this.pumpPacks = new PumpPacks();
    
    // Alerts and events
    this.alerts = [];
    this.events = [];
    this.maxEvents = 1000;
    this.maxAlerts = 500;
    
    // Statistics
    this.stats = {
      eventsProcessed: 0,
      alertsGenerated: 0,
      autoActions: 0,
      startTime: new Date(),
    };
    
    // Initialize
    this.setupEventListeners();
    
    logger.info("CopilotCore initialized");
  }
  
  /**
   * Setup event listeners for all system events
   */
  setupEventListeners() {
    // User events
    eventBus.on(EVENTS.USER_REGISTERED, (data) => 
      this.handleEvent("user_registered", data)
    );
    eventBus.on(EVENTS.USER_LOGIN, (data) => 
      this.handleEvent("user_login", data)
    );
    
    // Content events
    eventBus.on(EVENTS.POST_CREATED, (data) => 
      this.handleEvent("post_created", data)
    );
    
    // Streaming events
    eventBus.on(EVENTS.STREAM_STARTED, (data) => 
      this.handleEvent("stream_started", data)
    );
    eventBus.on(EVENTS.STREAM_ERROR, (data) => 
      this.handleEvent("stream_error", data)
    );
    
    // Station events
    eventBus.on(EVENTS.STATION_OFFLINE, (data) => 
      this.handleEvent("station_offline", data)
    );
    
    // Monetization events
    eventBus.on(EVENTS.COINS_SENT, (data) => 
      this.handleEvent("coins_sent", data)
    );
    eventBus.on(EVENTS.WITHDRAWAL_REQUESTED, (data) => 
      this.handleEvent("withdrawal_requested", data)
    );
    
    // Brain events
    eventBus.on(EVENTS.BRAIN_COMMAND_EXECUTED, (data) => 
      this.handleEvent("brain_command", data)
    );
    
    // Error events
    eventBus.on(EVENTS.ERROR_OCCURRED, (data) => 
      this.handleEvent("error", data)
    );
  }
  
  /**
   * Handle an incoming event
   */
  async handleEvent(type, data) {
    if (!this.isActive) return;
    if (this.mode === "maintenance") return;
    
    this.stats.eventsProcessed++;
    
    // Log event
    this.logEvent(type, data);
    
    // Get hook handler
    const hookResult = await this.hookPoints.execute(type, data);
    
    // Check if we need to create an alert
    if (hookResult.alert) {
      this.createAlert(hookResult.severity || "low", hookResult.alert, data);
    }
    
    // Check if auto-action is needed
    if (hookResult.action && this.shouldAutoApprove()) {
      await this.executeAutoAction(hookResult.action, data);
    }
    
    return hookResult;
  }
  
  /**
   * Log an event
   */
  logEvent(type, data) {
    const event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: new Date(),
      mode: this.mode,
    };
    
    this.events.unshift(event);
    
    // Trim events
    if (this.events.length > this.maxEvents) {
      this.events.pop();
    }
  }
  
  /**
   * Create an alert
   */
  createAlert(severity, message, data = {}) {
    const alert = {
      id: `alt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      severity, // 'low', 'medium', 'high', 'critical'
      message,
      data,
      status: "active",
      createdAt: new Date(),
    };
    
    this.alerts.unshift(alert);
    this.stats.alertsGenerated++;
    
    // Trim alerts
    if (this.alerts.length > this.maxAlerts) {
      this.alerts.pop();
    }
    
    // Emit alert event
    eventBus.emit(EVENTS.COPILOT_ALERT, alert);
    
    logger.warn(`Copilot Alert [${severity}]: ${message}`);
    
    return alert;
  }
  
  /**
   * Check if auto-approval is enabled based on current mode
   */
  shouldAutoApprove() {
    const config = this.pumpPacks.getConfig(this.mode);
    return config.autoApprove;
  }
  
  /**
   * Execute an automated action
   */
  async executeAutoAction(action, data) {
    logger.info(`Copilot auto-action: ${action.type}`, data);
    this.stats.autoActions++;
    
    try {
      switch (action.type) {
        case "notify_admin":
          // Would send notification
          break;
        case "trigger_repair":
          eventBus.emit("BRAIN_REPAIR", action.params);
          break;
        case "suspend_user":
          // Would call user service
          break;
        case "pause_stream":
          // Would call stream service
          break;
        default:
          logger.warn(`Unknown auto-action type: ${action.type}`);
      }
    } catch (error) {
      logger.error(`Auto-action failed: ${action.type}`, error);
    }
  }
  
  /**
   * Get current status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      mode: this.mode,
      modeConfig: this.pumpPacks.getConfig(this.mode),
      stats: this.stats,
      activeAlerts: this.alerts.filter(a => a.status === "active").length,
      uptime: Date.now() - this.stats.startTime.getTime(),
    };
  }
  
  /**
   * Get events
   */
  getEvents(options = {}) {
    const { type, limit = 50, skip = 0 } = options;
    
    let filtered = this.events;
    if (type) {
      filtered = this.events.filter(e => e.type === type);
    }
    
    return filtered.slice(skip, skip + limit);
  }
  
  /**
   * Get alerts
   */
  getAlerts(options = {}) {
    const { status, severity, limit = 50 } = options;
    
    let filtered = this.alerts;
    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }
    if (severity) {
      filtered = filtered.filter(a => a.severity === severity);
    }
    
    return filtered.slice(0, limit);
  }
  
  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId, adminId, notes = null) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) {
      return { success: false, message: "Alert not found" };
    }
    
    alert.status = "acknowledged";
    alert.acknowledgedBy = adminId;
    alert.acknowledgedAt = new Date();
    alert.notes = notes;
    
    return { success: true, alert };
  }
  
  /**
   * Set operating mode
   */
  setMode(mode, adminId = null) {
    const validModes = ["safe", "normal", "aggressive", "maintenance"];
    if (!validModes.includes(mode)) {
      throw new Error(`Invalid mode: ${mode}`);
    }
    
    const previousMode = this.mode;
    this.mode = mode;
    
    this.logEvent("mode_changed", { from: previousMode, to: mode, adminId });
    eventBus.emit(EVENTS.COPILOT_MODE_CHANGED, { from: previousMode, to: mode });
    
    logger.info(`Copilot mode changed: ${previousMode} -> ${mode}`);
    
    return { previousMode, currentMode: mode };
  }
  
  /**
   * Activate Copilot
   */
  activate() {
    this.isActive = true;
    logger.info("Copilot activated");
  }
  
  /**
   * Deactivate Copilot
   */
  deactivate() {
    this.isActive = false;
    logger.info("Copilot deactivated");
  }
}

// Singleton instance
const copilotCore = new CopilotCore();

export default copilotCore;
export { CopilotCore };
