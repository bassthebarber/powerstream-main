// OverrideAIHandler.js
// Central AI override command handler

export default class OverrideAIHandler {
    constructor() {
        this.commandQueue = [];
        console.log("[OverrideAIHandler] Initialized.");
    }

    receiveCommand(cmd) {
        console.log(`[OverrideAIHandler] Received command: ${cmd}`);
        this.commandQueue.push(cmd);
        this.executeNext();
    }

    executeNext() {
        if (this.commandQueue.length > 0) {
            const cmd = this.commandQueue.shift();
            console.log(`[OverrideAIHandler] Executing command: ${cmd}`);
            // Insert AI command execution logic
        }
    }
}

export const overrideAIHandler = new OverrideAIHandler();
