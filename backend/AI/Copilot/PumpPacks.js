// backend/ai/copilot/PumpPacks.js
// Configuration packs for different Copilot modes per Overlord Spec

/**
 * PumpPacks defines how Copilot behaves under different operating modes.
 * Each mode has specific configurations for automation and alerting.
 */
class PumpPacks {
  constructor() {
    this.packs = this.definePacks();
  }
  
  /**
   * Define all mode configurations
   */
  definePacks() {
    return {
      // Safe Mode - Minimal automation, maximum oversight
      safe: {
        name: "Safe Mode",
        description: "Minimal automated actions, requires admin approval for all operations",
        autoApprove: false,
        alertThreshold: "low",
        features: {
          autoRepair: false,
          autoSuspend: false,
          autoNotify: true,
          monitoring: "passive",
        },
        alerts: {
          minSeverity: "low",
          aggregateWindow: 0, // Send all alerts immediately
          channels: ["dashboard", "email"],
        },
        actions: {
          allowedAuto: ["notify_admin"],
          requireApproval: ["trigger_repair", "suspend_user", "pause_stream"],
        },
      },
      
      // Normal Mode - Balanced automation
      normal: {
        name: "Normal Mode",
        description: "Standard operation with moderate automation",
        autoApprove: true,
        alertThreshold: "medium",
        features: {
          autoRepair: true,
          autoSuspend: false,
          autoNotify: true,
          monitoring: "active",
        },
        alerts: {
          minSeverity: "medium",
          aggregateWindow: 5 * 60 * 1000, // 5 minutes
          channels: ["dashboard"],
        },
        actions: {
          allowedAuto: ["notify_admin", "trigger_repair"],
          requireApproval: ["suspend_user", "pause_stream"],
        },
      },
      
      // Aggressive Mode - Maximum automation
      aggressive: {
        name: "Aggressive Mode",
        description: "Maximum automation, auto-repair enabled, proactive actions",
        autoApprove: true,
        alertThreshold: "high",
        features: {
          autoRepair: true,
          autoSuspend: true,
          autoNotify: true,
          monitoring: "proactive",
        },
        alerts: {
          minSeverity: "high",
          aggregateWindow: 15 * 60 * 1000, // 15 minutes
          channels: ["dashboard"],
        },
        actions: {
          allowedAuto: ["notify_admin", "trigger_repair", "suspend_user", "pause_stream"],
          requireApproval: [],
        },
      },
      
      // Maintenance Mode - Reduced operations
      maintenance: {
        name: "Maintenance Mode",
        description: "Reduced operations, only critical alerts",
        autoApprove: false,
        alertThreshold: "critical",
        features: {
          autoRepair: false,
          autoSuspend: false,
          autoNotify: true,
          monitoring: "minimal",
        },
        alerts: {
          minSeverity: "critical",
          aggregateWindow: 0,
          channels: ["dashboard", "email", "sms"],
        },
        actions: {
          allowedAuto: ["notify_admin"],
          requireApproval: ["trigger_repair", "suspend_user", "pause_stream"],
        },
      },
    };
  }
  
  /**
   * Get configuration for a mode
   */
  getConfig(mode) {
    return this.packs[mode] || this.packs.normal;
  }
  
  /**
   * Get all available modes
   */
  getAvailableModes() {
    return Object.entries(this.packs).map(([key, pack]) => ({
      id: key,
      name: pack.name,
      description: pack.description,
    }));
  }
  
  /**
   * Check if an action is auto-approved for a mode
   */
  isActionAutoApproved(mode, actionType) {
    const config = this.getConfig(mode);
    return config.actions.allowedAuto.includes(actionType);
  }
  
  /**
   * Check if an action requires approval for a mode
   */
  actionRequiresApproval(mode, actionType) {
    const config = this.getConfig(mode);
    return config.actions.requireApproval.includes(actionType);
  }
  
  /**
   * Check if a severity level meets the threshold for a mode
   */
  meetsSeverityThreshold(mode, severity) {
    const severityLevels = ["low", "medium", "high", "critical"];
    const config = this.getConfig(mode);
    
    const thresholdIndex = severityLevels.indexOf(config.alertThreshold);
    const severityIndex = severityLevels.indexOf(severity);
    
    return severityIndex >= thresholdIndex;
  }
}

export default PumpPacks;


