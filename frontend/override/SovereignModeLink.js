// SovereignModeLink.js
// Sovereign control mode link

export default class SovereignModeLink {
    constructor() {
        this.isActive = false;
        console.log("[SovereignModeLink] Initialized.");
    }

    activate() {
        this.isActive = true;
        console.log("[SovereignModeLink] Sovereign mode activated.");
    }

    deactivate() {
        this.isActive = false;
        console.log("[SovereignModeLink] Sovereign mode deactivated.");
    }
}

export const sovereignModeLink = new SovereignModeLink();
