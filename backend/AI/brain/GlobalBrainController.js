// backend/ai/brain/GlobalBrainController.js
// Global Brain Controller per Overlord Spec
// This is the central control point for Brain system operations
import { logger } from "../../utils/logger.js";
import eventBus, { EVENTS } from "../../utils/eventBus.js";
import BrainCommandPack from "./BrainCommandPack.js";
import BrainRepairEngine from "./BrainRepairEngine.js";

class GlobalBrainController {
  constructor() {
    this.isActive = true;
    this.mode = "normal"; // 'normal', 'maintenance', 'repair', 'emergency'
    this.commandPack = new BrainCommandPack();
    this.repairEngine = new BrainRepairEngine();
    this.startTime = new Date();
    
    // Listen for system events
    this.setupEventListeners();
    
    logger.info("GlobalBrainController initialized");
  }
  
  /**
   * Setup event listeners for automated responses
   */
  setupEventListeners() {
    // Listen for errors and trigger auto-repair if needed
    eventBus.on(EVENTS.ERROR_OCCURRED, async (data) => {
      if (this.mode === "maintenance") return;
      
      logger.warn("Brain detected error:", data);
      await this.handleError(data);
    });
    
    // Listen for health check requests
    eventBus.on(EVENTS.HEALTH_CHECK, async () => {
      await this.runHealthCheck();
    });
    
    // Listen for system startup
    eventBus.on(EVENTS.SYSTEM_STARTUP, () => {
      logger.startup("Brain activated on system startup");
      this.runStartupDiagnostics();
    });
  }
  
  /**
   * Get current brain status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      mode: this.mode,
      uptime: Date.now() - this.startTime.getTime(),
      startTime: this.startTime,
      availableCommands: this.commandPack.getAvailableCommands(),
      lastDiagnostics: this.repairEngine.getLastDiagnostics(),
    };
  }
  
  /**
   * Execute a brain command
   */
  async executeCommand(command, params = {}, adminId = null) {
    logger.info(`Brain executing command: ${command}`, { params, adminId });
    
    if (!this.isActive) {
      return {
        success: false,
        message: "Brain is not active",
        code: "BRAIN_INACTIVE",
      };
    }
    
    try {
      const result = await this.commandPack.execute(command, params);
      
      eventBus.emit(EVENTS.BRAIN_COMMAND_EXECUTED, {
        command,
        params,
        adminId,
        result,
      });
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      logger.error(`Brain command failed: ${command}`, error);
      return {
        success: false,
        message: error.message,
        code: "COMMAND_FAILED",
      };
    }
  }
  
  /**
   * Handle detected errors
   */
  async handleError(errorData) {
    const { severity, subsystem, error } = errorData;
    
    if (severity === "critical") {
      logger.error(`Critical error in ${subsystem}, initiating repair`);
      await this.repairEngine.repairSubsystem(subsystem);
    }
  }
  
  /**
   * Run health check
   */
  async runHealthCheck() {
    logger.info("Brain running health check");
    
    const diagnostics = await this.repairEngine.runDiagnostics();
    
    return {
      healthy: diagnostics.healthy,
      subsystems: diagnostics.subsystems,
      timestamp: new Date(),
    };
  }
  
  /**
   * Run startup diagnostics
   */
  async runStartupDiagnostics() {
    logger.info("Brain running startup diagnostics");
    
    await this.repairEngine.runDiagnostics();
    
    // Check critical subsystems
    const criticalSystems = ["database", "auth", "routes"];
    for (const system of criticalSystems) {
      const status = await this.repairEngine.checkSubsystem(system);
      if (!status.healthy) {
        logger.warn(`Startup: ${system} unhealthy, attempting repair`);
        await this.repairEngine.repairSubsystem(system);
      }
    }
  }
  
  /**
   * Set brain mode
   */
  setMode(mode) {
    const validModes = ["normal", "maintenance", "repair", "emergency"];
    if (!validModes.includes(mode)) {
      throw new Error(`Invalid mode: ${mode}`);
    }
    
    const previousMode = this.mode;
    this.mode = mode;
    
    logger.info(`Brain mode changed: ${previousMode} -> ${mode}`);
    
    return { previousMode, currentMode: mode };
  }
  
  /**
   * Activate brain
   */
  activate() {
    this.isActive = true;
    logger.info("Brain activated");
  }
  
  /**
   * Deactivate brain
   */
  deactivate() {
    this.isActive = false;
    logger.info("Brain deactivated");
  }
}

// Singleton instance
const globalBrain = new GlobalBrainController();

export default globalBrain;
export { GlobalBrainController };


