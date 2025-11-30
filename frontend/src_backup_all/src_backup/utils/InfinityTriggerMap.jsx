// frontend/src/utils/infinity/InfinityTriggerMap.js
// Maps backend Infinity Core triggers to frontend actions

import AiCommandRouter from "../../copilot/control-tower/AiCommandRouter";
import SovereignCommandMap from "./SovereignCommandMap";

const InfinityTriggerMap = (trigger, actions = {}) => {
  if (!trigger || typeof trigger !== "string") {
    console.warn("InfinityTriggerMap: No valid trigger received.");
    return;
  }

  const normalized = trigger.toUpperCase().trim();

  // Handle Sovereign (high-security) triggers
  if (SovereignCommandMap[normalized]) {
    console.log(`Executing Sovereign Trigger: ${normalized}`);
    const sovereignAction = SovereignCommandMap[normalized];
    if (sovereignAction().requiresAuth) {
      // You could prompt for a password/voice auth here
      console.warn("Sovereign action requires authentication.");
    }
    return sovereignAction();
  }

  // Handle AI Command triggers (general commands)
  switch (normalized) {
    case "ENABLE_OVERRIDE":
      actions.enableOverride && actions.enableOverride();
      break;

    case "DISABLE_OVERRIDE":
      actions.disableOverride && actions.disableOverride();
      break;

    case "START_STREAM":
      actions.startLiveStream && actions.startLiveStream();
      break;

    case "STOP_STREAM":
      actions.stopLiveStream && actions.stopLiveStream();
      break;

    case "OPEN_POWERFEED":
      AiCommandRouter("open powerfeed", actions);
      break;

    case "OPEN_POWERLINE":
      AiCommandRouter("open powerline", actions);
      break;

    default:
      console.warn(`InfinityTriggerMap: Unrecognized trigger "${trigger}"`);
      break;
  }
};

export default InfinityTriggerMap;


