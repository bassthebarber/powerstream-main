// backend/AI/overrideEngine.js

import EventBus from '../system-core/EventBus.js';

class OverrideEngine {
  static engage(target, reason) {
    console.warn(`⚠️ [OverrideEngine] Engaging override on ${target} due to: ${reason}`);
    EventBus.emit(`${target}:override`, { reason });
  }
}

export default OverrideEngine;
