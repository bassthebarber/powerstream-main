// /backend/AI/IntentProcessor.js
const EventBus = require('../system-core/EventBus');

class IntentProcessor {
    static process(intent) {
        console.log(`🎯 [IntentProcessor] Processing intent: ${intent.type}`);
        EventBus.emit(`intent:${intent.type}`, intent.payload || {});
    }
}

module.exports = IntentProcessor;
