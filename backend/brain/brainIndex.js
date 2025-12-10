/**
 * PowerStream AI Brain Entry Point
 * Runs automatically when the backend starts.
 */

import bootloader from "./bootloader.js";
import brainMemory from "./brainMemory.js";
// import aiSettings from "../../configs/aiSettings.js";

const aiSettings = {
  aiName: 'PowerStream AI',
  awarenessLevel: 'FULL',
  overrideEnabled: true
};

const initBrain = async () => {
  console.log(`🧠 [BrainIndex] Starting AI Brain: ${aiSettings.aiName}`);
  console.log(`🌐 Awareness Level: ${aiSettings.awarenessLevel}`);
  console.log(`🛡 Override Enabled: ${aiSettings.overrideEnabled}`);

  // Start the AI Bootloader
  await bootloader.start();

  // Confirm All Systems Loaded
  const bootTime = brainMemory.recall("boot_time");
  console.log(`📅 AI Brain Boot Time: ${bootTime}`);

  console.log("💡 PowerStream AI Brain is now self-aware and ready to process commands.");
};

// Auto-start when imported
// initBrain();

export default initBrain;
