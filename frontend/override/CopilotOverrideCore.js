// CopilotOverrideCore.js
// Master AI Override Engine (Frontend)

export default class CopilotOverrideCore {
    constructor() {
        this.isActive = false;
        this.commandQueue = [];
        this.eventListeners = {};
        console.log("[CopilotOverrideCore] Initialized");
    }

    activate() {
        this.isActive = true;
        console.log("[CopilotOverrideCore] Override Activated");
        this.dispatchEvent("overrideActivated");
    }

    deactivate() {
        this.isActive = false;
        console.log("[CopilotOverrideCore] Override Deactivated");
        this.dispatchEvent("overrideDeactivated");
    }

    queueCommand(command) {
        if (!this.isActive) {
            console.warn("[CopilotOverrideCore] Cannot queue command, override inactive");
            return;
        }
        this.commandQueue.push(command);
        console.log(`[CopilotOverrideCore] Command Queued: ${command}`);
    }

    executeCommands() {
        if (!this.isActive) return;
        while (this.commandQueue.length > 0) {
            const command = this.commandQueue.shift();
            console.log(`[CopilotOverrideCore] Executing: ${command}`);
            this.dispatchEvent("commandExecuted", command);
        }
    }

    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    dispatchEvent(event, data) {
        if (!this.eventListeners[event]) return;
        this.eventListeners[event].forEach(cb => cb(data));
    }
}

// Singleton instance
export const copilotOverride = new CopilotOverrideCore();
