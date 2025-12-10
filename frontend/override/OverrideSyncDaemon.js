// OverrideSyncDaemon.js
// Keeps override state synced across sessions

export default class OverrideSyncDaemon {
    constructor() {
        this.state = {};
        console.log("[OverrideSyncDaemon] Sync Daemon initialized.");
    }

    syncState(newState) {
        this.state = { ...this.state, ...newState };
        console.log("[OverrideSyncDaemon] State synced:", this.state);
    }

    getState() {
        return this.state;
    }
}

export const overrideSyncDaemon = new OverrideSyncDaemon();
