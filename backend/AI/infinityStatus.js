// backend/AI/infinityStatus.js

import InfinityCore from './InfinityCore/InfinityCore.js';

class InfinityStatus {
  static getStatus() {
    return {
      active: InfinityCore.isActive(),
      timestamp: Date.now()
    };
  }
}

export default InfinityStatus;
