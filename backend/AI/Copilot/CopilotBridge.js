// /backend/AI/Copilot/CopilotBridge.js
const EventBus = require('../../system-core/EventBus');
const MainCircuitBoard = require('../../system-core/MainCircuitBoard');

class CopilotBridge {
  constructor() {
    this.isConnected = false;
  }

  init() {
    console.log("🔌 [CopilotBridge] Linking Copilot to MainCircuitBoard...");
    this.isConnected = true;

    // Listen for frontend commands and route to Copilot
    EventBus.on('frontend:command', (cmd) => {
      console.log(`🎯 [CopilotBridge] Received frontend command: ${cmd.type}`);
      MainCircuitBoard.sendCommand(cmd.type, cmd.payload);
    });

    // Listen for AI self-decisions and send to main brain
    EventBus.on('copilot:decision', (decision) => {
      console.log(`🧠 [CopilotBridge] Copilot decision → MainCircuitBoard: ${decision.command}`);
      MainCircuitBoard.sendCommand(decision.command, decision.payload);
    });

    console.log("✅ [CopilotBridge] Copilot connected to MainCircuitBoard.");
  }
}

module.exports = new CopilotBridge();
