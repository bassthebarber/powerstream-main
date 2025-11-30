// backend/control-tower/override/override-diagnostics.js
const MainCircuitBoard = require("../../MainCircuitBoard");

module.exports = {
    run() {
        console.log("🩺 [OverrideDiagnostics] Running AI system health scan...");
        const report = MainCircuitBoard.healthCheck();
        console.table(report);
        return report;
    }
};
