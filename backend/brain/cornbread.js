// /backend/brain/cornbread.js
import { checkStreamHealth } from "./defenseCore.js";
import { pingDatabase } from "./recoveryDaemon.js";

export async function systemHeartbeat() {
  try {
    await pingDatabase();
    await checkStreamHealth();
    console.log("🔥 Cornbread check: Brain is still hot and crispy.");
  } catch (error) {
    console.error("🚨 Cornbread Error: System may be cold or stale", error);
  }
}

// Run every 30 seconds
setInterval(systemHeartbeat, 30000);
