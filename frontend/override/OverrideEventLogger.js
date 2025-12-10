// OverrideEventLogger.js
// Logs override events for diagnostics

export default class OverrideEventLogger {
    constructor() {
        this.logs = [];
        console.log("[OverrideEventLogger] Logging system ready.");
    }

    log(event) {
        const timestamp = new Date().toISOString();
        const entry = `[${timestamp}] ${event}`;
        this.logs.push(entry);
        console.log("[OverrideEventLogger]", entry);
    }

    getLogs() {
        return this.logs;
    }
}

export const overrideEventLogger = new OverrideEventLogger();
