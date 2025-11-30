// backend/InfinityCore/VoiceCommandProcessor.js

const { exec } = require("child_process");
const circuit = require("../core/MainCircuitBoard");
const log = require("../utils/systemLogger");

const voiceCommandMap = {
  "open dashboard": () => circuit.activateDashboard(),
  "shutdown system": () => circuit.safeShutdown(),
  "restart stream": () => circuit.restartStreamService(),
  "show crash log": () => circuit.displayCrashLogs(),
  "trigger override": () => circuit.manualOverride(),
  "connect cloud": () => circuit.connectCloudinary(),
  "check uptime": () => circuit.runUptimeScan(),
  "scan system": () => circuit.deepSystemScan(),
  "run defense": () => circuit.activateFailSafe(),
};

module.exports = function processVoiceCommand(transcript) {
  const command = transcript.toLowerCase().trim();
  log.info(`🎤 Voice Input Received: ${command}`);

  const action = voiceCommandMap[command];

  if (action) {
    log.info(`✅ Executing Command: ${command}`);
    action();
    return { success: true, message: `Executed: ${command}` };
  } else {
    log.warn(`❌ Unknown Command: ${command}`);
    return { success: false, message: "Command not recognized." };
  }
};
