// /backend/AI/BlackOps/BlackOpsOverride.js
const EventBus = require('../../system-core/EventBus');

class BlackOpsOverride {
    static executeOverride(targetSystem, reason) {
        console.warn(`⚠️ [BlackOpsOverride] Forcing override on ${targetSystem}: ${reason}`);
        EventBus.emit(`${targetSystem}:override`, { reason });
    }
}

module.exports = BlackOpsOverride;
