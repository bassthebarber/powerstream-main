// CopilotTowerOverrideCommandTriggerBoot.js
// Boot trigger for Copilot Override System

import { copilotOverride } from "./CopilotOverrideCore";

export default class CopilotTowerOverrideCommandTriggerBoot {
    constructor() {
        console.log("[TriggerBoot] Preparing Copilot Override Boot Sequence...");
    }

    boot() {
        console.log("[TriggerBoot] Initiating Copilot Override...");
        copilotOverride.activate();

        // Optional auto-start commands
        setTimeout(() => {
            copilotOverride.queueCommand("Initialize System Health Check");
            copilotOverride.queueCommand("Load AI Control Modules");
            copilotOverride.executeCommands();
        }, 1000);
    }
}

export const triggerBoot = new CopilotTowerOverrideCommandTriggerBoot();
