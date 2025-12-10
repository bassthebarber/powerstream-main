// backend/brain/brainStateMonitor.js

import EventBus from '../system-core/EventBus.js';

const brainStateMonitor = {
  start() {
    console.log("📡 [BrainStateMonitor] Monitoring brain activity...");
    setInterval(() => {
      EventBus.emit("brain:heartbeat", { timestamp: Date.now() });
    }, 5000);
  }
};

export default brainStateMonitor;
