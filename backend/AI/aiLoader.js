// /backend/AI/AILoader.js
const MainCircuitBoard = require('../system-core/MainCircuitBoard');

module.exports = {
    boot: async () => {
        console.log("🧠 [AILoader] Starting AI boot sequence...");
        await MainCircuitBoard.boot();
        console.log("✅ [AILoader] All AI systems operational.");
    }
};
