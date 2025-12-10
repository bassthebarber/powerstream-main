// backend/AI/BlackOps/BlackOpsOverride.js

import EventBus from '../../system-core/EventBus.js';

class BlackOpsOverride {
  static executeOverride(targetSystem, reason) {
    console.warn(`⚠️ [BlackOpsOverride] Forcing override on ${targetSystem}: ${reason}`);
    EventBus.emit(`${targetSystem}:override`, { reason });
  }
}

export default BlackOpsOverride;
