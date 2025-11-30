/**
 * PowerStream AI Bootloader
 * Wires Infinity, Matrix, Sovereign, Copilot, and BlackOps into the AI Brain.
 */

const MainCircuitBoard = require("../MainCircuitBoard");
const brainMemory = require("./brainMemory");
const brainStateMonitor = require("./brainStateMonitor");
const cognitiveMap = require("./cognitiveMap");

const infinityCore = require("../Infinity-Core/infinityCore");
const matrixCore = require("../Matrix/matrixCore");
const sovereignMode = require("../Sovereign/sovereignMode");
const copilotCore = require("../Copilot/copilotCore");
const blackOps = require("../BlackOps/blackOpsCore");

module.exports = {
    async start() {
        console.log("🚀 [Bootloader] Initializing PowerStream AI Brain...");

        // 1. Store Boot Time
        brainMemory.store("boot_time", new Date().toISOString());

        // 2. Start Brain State Monitor
        brainStateMonitor.start();

        // 3. Initialize Main Circuit Board
        MainCircuitBoard.init();

        // 4. Load Core AI Modules
        await infinityCore.init();
        await matrixCore.init();
        await sovereignMode.init();
        await copilotCore.init();
        await blackOps.init();

        // 5. Map Initial Commands
        brainMemory.store("cognitive_map", cognitiveMap);

        // 6. Announce Readiness
        console.log("✅ [Bootloader] PowerStream AI Brain is fully online and aware.");
    }
};
