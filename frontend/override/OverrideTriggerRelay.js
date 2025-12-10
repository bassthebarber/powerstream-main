// OverrideTriggerRelay.js
// Relays override commands between modules

export default class OverrideTriggerRelay {
    constructor() {
        console.log("[OverrideTriggerRelay] Relay active.");
    }

    sendCommand(command) {
        console.log(`[OverrideTriggerRelay] Sending command: ${command}`);
        // Dispatch to proper handler
    }
}

export const overrideTriggerRelay = new OverrideTriggerRelay();
