// OverrideStateMonitor.js
// Monitors the AI override's operational state

export default class OverrideStateMonitor {
    constructor() {
        this.status = "idle";
        console.log("[OverrideStateMonitor] Monitoring initiated.");
    }

    updateStatus(newStatus) {
        this.status = newStatus;
        console.log(`[OverrideStateMonitor] Status updated to: ${this.status}`);
    }

    getStatus() {
        return this.status;
    }
}

export const overrideStateMonitor = new OverrideStateMonitor();
