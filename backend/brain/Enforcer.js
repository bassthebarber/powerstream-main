// frontend/brain/Enforcer.js

import version from "@/config/version";
import brainFlags from "@/config/brainFlags";

const Enforcer = {
  enforceSystemControl() {
    console.log("🛡 Enforcer activated: God Mode override enforcing…");

    // Force brain flags ON
    if (!brainFlags.overrideUI) {
      console.warn("⚠️ overrideUI was OFF — forcing ON.");
      brainFlags.overrideUI = true;
    }

    if (!brainFlags.autoUpdateLayout) {
      console.warn("⚠️ autoUpdateLayout was OFF — forcing ON.");
      brainFlags.autoUpdateLayout = true;
    }

    // Patch missing version values
    if (!version.voiceMode || !version.aiCore) {
      console.error("🚨 Missing version config — injecting failsafe...");
      version.voiceMode = "5.0";
      version.aiCore = "GPT-4o";
      version.buildLabel = "PowerStream Q3-2025";
    }

    // Lock values
    Object.freeze(brainFlags);
    Object.freeze(version);

    console.log("✅ Enforcer has locked system config.");
  },
};

export default Enforcer;
