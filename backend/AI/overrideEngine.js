// /backend/AI/OverrideEngine.js
const EventBus = require('../system-core/EventBus');

class OverrideEngine {
    static engage(target, reason) {
        console.warn(`⚠️ [OverrideEngine] Engaging override on ${target} due to: ${reason}`);
        EventBus.emit(`${target}:override`, { reason });
    }
}

module.exports = OverrideEngine;
