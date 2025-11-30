// backend/control-tower/override/sovereign-mode-link.js

import { handleSovereignKey } from "./sovereignKeyHandler.js";
import bootAISequence from "./brainBootloader.js";
import activateFailsafe from "./failsafeoverride.js";
import { activateDefenseCore } from "./defensecore.js";
import { overrideInfinityLink } from "./infinityOverride.js";

export function linkSovereignMode(user = "marcus") {
  console.log("🔗 Linking Sovereign Mode Systems...");

  const brain = bootAISequence();
  const failsafe = activateFailsafe();
  const sovereign = handleSovereignKey(user);
  const defense = activateDefenseCore();
  const override = overrideInfinityLink();

  return {
    brain,
    failsafe,
    sovereign,
    defense,
    override,
    status: "🛡 Sovereign Mode Linked and Stabilized ✅",
    timestamp: new Date().toISOString(),
  };
}
