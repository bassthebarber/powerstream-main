// backend/voice/masterBuildCommand.js
import { createStation } from '../core/stationGenerator.js';
import { addRevenue } from '../core/revenueTracker.js';
import { grantStreamPermission } from '../core/stationPermissions.js';
import { exec } from 'child_process';

// Simulated instant empire builder command
export const runMasterBuild = async (voiceCommand, userId) => {
  try {
    if (!voiceCommand.toLowerCase().includes("build powerstream")) {
      return { success: false, message: "Invalid master build command" };
    }

    // 1. Create the Southern Power Syndicate hub
    const syndicate = await createStation({
      ownerId: userId,
      name: "Southern Power Syndicate",
      description: "The central hub for all SPS stations"
    });

    // 2. Create flagship stations
    await createStation({ ownerId: userId, name: "Texas Got Talent", description: "Talent competition hub" });
    await createStation({ ownerId: userId, name: "No Limit East Houston", description: "Music & entertainment" });
    await createStation({ ownerId: userId, name: "Civic Connect", description: "Local city and town TV" });

    // 3. Give owner streaming rights
    await grantStreamPermission(syndicate.station._id, userId);

    // 4. Trigger frontend auto‑build
    exec('npm run build', { cwd: process.cwd() });

    return {
      success: true,
      message: "🚀 Master build executed — Southern Power Syndicate empire created & ready."
    };
  } catch (err) {
    console.error("MasterBuild Error:", err);
    return { success: false, message: err.message };
  }
};
