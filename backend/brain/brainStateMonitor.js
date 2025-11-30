// /backend/AI/Brain/brainStateMonitor.js
const EventBus = require('../../system-core/EventBus');

module.exports = {
    start() {
        console.log("📡 [BrainStateMonitor] Monitoring brain activity...");
        setInterval(() => {
            EventBus.emit("brain:heartbeat", { timestamp: Date.now() });
        }, 5000);
    }
};
