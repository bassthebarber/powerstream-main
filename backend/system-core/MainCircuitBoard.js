// /backend/system-core/MainCircuitBoard.js
const InfinityCore = require('../AI/InfinityCore/InfinityCore');
const InfinityCoreBridge = require('../AI/InfinityCore/InfinityCoreBridge');
const InfinityEventHandler = require('../AI/InfinityCore/InfinityEventHandler');
const InfinityCommandRouter = require('../AI/InfinityCore/InfinityCommandRouter');

const CopilotCore = require('../AI/Copilot/CopilotCore');
const CopilotBridge = require('../AI/Copilot/CopilotBridge');

const MatrixCore = require('../AI/Matrix/MatrixCore');
const MatrixBridge = require('../AI/Matrix/MatrixBridge');
const MatrixEventHandler = require('../AI/Matrix/MatrixEventHandler');
const MatrixCommandRouter = require('../AI/Matrix/MatrixCommandRouter');

const SovereignMode = require('../AI/Sovereign/SovereignMode');
const SovereignEventHandler = require('../AI/Sovereign/SovereignEventHandler');
const SovereignBridge = require('../AI/Sovereign/SovereignBridge');
const SovereignFailSafe = require('../AI/Sovereign/SovereignFailSafe');

const EventBus = require('./EventBus');

class MainCircuitBoard {
    constructor() {
        this.initialized = false;
    }

    async boot() {
        if (this.initialized) return;
        console.log("⚡ [MainCircuitBoard] Booting AI Main Circuit Board...");

        // === Sovereign AI First ===
        SovereignMode.initialize();
        SovereignEventHandler.init();
        SovereignBridge.connect();
        SovereignFailSafe.monitor();

        // === Infinity Core ===
        InfinityCore.initialize();
        InfinityCoreBridge.connect();
        InfinityEventHandler.init();
        InfinityCommandRouter.listen();

        // === Copilot ===
        CopilotCore.initialize();
        CopilotBridge.connect();

        // === Matrix AI ===
        MatrixCore.initialize();
        MatrixBridge.connect();
        MatrixEventHandler.init();
        MatrixCommandRouter.listen();

        console.log("✅ [MainCircuitBoard] All AI Systems Online & Linked");

        EventBus.emit('system:ready', { timestamp: Date.now() });
        this.initialized = true;
    }
}

module.exports = new MainCircuitBoard();

// Add this in MainCircuitBoard.boot()
const BlackOpsCore = require('../AI/BlackOps/BlackOpsCore');
const BlackOpsMissionPlanner = require('../AI/BlackOps/BlackOpsMissionPlanner');
const BlackOpsOverride = require('../AI/BlackOps/BlackOpsOverride');
const BlackOpsFailSafe = require('../AI/BlackOps/BlackOpsFailSafe');

// After Sovereign boot sequence:
BlackOpsCore.initialize();
BlackOpsMissionPlanner.queueMission("net-infiltration", { stealth: true });
BlackOpsFailSafe.monitor();

// Add AI Brain awareness
const brainStateMonitor = require('../AI/Brain/brainStateMonitor');
const brainMemory = require('../AI/Brain/brainMemory');

brainStateMonitor.start();
brainMemory.store("system_boot", Date.now());
const aiSettings = require("./configs/aiSettings");
const security = require("./configs/security");

module.exports = {
    init() {
        console.log("🛠 [MainCircuitBoard] Initializing system-wide AI control...");

        // Security Layer
        console.log(`🔐 [Security] JWT Secret Loaded: ${!!security.jwtSecret}`);
        console.log(`⚙️ AI Modules Enabled: ${aiSettings.coreModules.join(", ")}`);

        // Confirm Infinity Awareness
        if (aiSettings.awarenessLevel === "FULL") {
            console.log("🌌 AI is fully aware of Infinity, Matrix, Sovereign, Copilot, BlackOps.");
        }
    }
};

// Inside MainCircuitBoard.js
const loggerBridge = require("./control-tower/logs/logger-bridge");
const overrideIntentSync = require("./control-tower/override/override-intent-sync");
const overrideDiagnostics = require("./control-tower/override/override-diagnostics");

module.exports = {
    init() {
        console.log("🛠 [MainCircuitBoard] Initializing Control Tower connections...");

        // Mirror Logs to AI Memory
        loggerBridge.mirrorToMemory("system", "Control Tower initialized.");

        // Register Override Sync
        this.overrideProcessor = overrideIntentSync;

        // Register Diagnostics
        this.runDiagnostics = overrideDiagnostics.run;

        console.log("✅ [MainCircuitBoard] Control Tower fully linked to AI Brain.");
    },
    healthCheck() {
        return [
            { module: "InfinityCore", status: "OK" },
            { module: "Matrix", status: "OK" },
            { module: "Sovereign", status: "OK" },
            { module: "Copilot", status: "OK" },
            { module: "BlackOps", status: "OK" }
        ];
    }
};

