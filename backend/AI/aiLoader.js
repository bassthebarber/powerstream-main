// backend/AI/aiLoader.js

import MainCircuitBoard from '../system-core/MainCircuitBoard.js';

const AILoader = {
  boot: async () => {
    console.log("🧠 [AILoader] Starting AI boot sequence...");
    await MainCircuitBoard.boot();
    console.log("✅ [AILoader] All AI systems operational.");
  }
};

export default AILoader;
