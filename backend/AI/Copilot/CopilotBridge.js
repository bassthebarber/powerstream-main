// backend/AI/Copilot/CopilotBridge.js

import EventBus from '../../system-core/EventBus.js';
import MainCircuitBoard from '../../system-core/MainCircuitBoard.js';

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

const copilotBridge = new CopilotBridge();
export default copilotBridge;
