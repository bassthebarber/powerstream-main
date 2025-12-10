// backend/InfinityCore/VoiceCommandProcessor.js

// import { exec } from "child_process";
// import circuit from "../core/MainCircuitBoard.js";
// import log from "../utils/systemLogger.js";

const log = {
  info: (msg) => console.log(msg),
  warn: (msg) => console.warn(msg),
};

const circuit = {
  activateDashboard: () => console.log("Dashboard activated"),
  safeShutdown: () => console.log("Safe shutdown initiated"),
  restartStreamService: () => console.log("Stream service restarted"),
  displayCrashLogs: () => console.log("Crash logs displayed"),
  manualOverride: () => console.log("Manual override activated"),
  connectCloudinary: () => console.log("Cloudinary connected"),
  runUptimeScan: () => console.log("Uptime scan running"),
  deepSystemScan: () => console.log("Deep system scan running"),
  activateFailSafe: () => console.log("Failsafe activated"),
};

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

function processVoiceCommand(transcript) {
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
}

export default processVoiceCommand;
