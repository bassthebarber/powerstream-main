// backend/AI/intentProcessor.js

import EventBus from '../system-core/EventBus.js';

class IntentProcessor {
  static process(intent) {
    console.log(`🎯 [IntentProcessor] Processing intent: ${intent.type}`);
    EventBus.emit(`intent:${intent.type}`, intent.payload || {});
  }
}

export default IntentProcessor;
