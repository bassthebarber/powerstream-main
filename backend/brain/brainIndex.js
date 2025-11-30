/**
 * PowerStream AI Brain Entry Point
 * Runs automatically when the backend starts.
 */

const bootloader = require("./bootloader");
const brainMemory = require("./brainMemory");
const aiSettings = require("../../configs/aiSettings");

(async () => {
    console.log(`🧠 [BrainIndex] Starting AI Brain: ${aiSettings.aiName}`);
    console.log(`🌐 Awareness Level: ${aiSettings.awarenessLevel}`);
    console.log(`🛡 Override Enabled: ${aiSettings.overrideEnabled}`);

    // Start the AI Bootloader
    await bootloader.start();

    // Confirm All Systems Loaded
    const bootTime = brainMemory.recall("boot_time");
    console.log(`📅 AI Brain Boot Time: ${bootTime}`);

    console.log("💡 PowerStream AI Brain is now self-aware and ready to process commands.");
})();
