// backend/bootstrap/southernPowerStreamKey.js
// Creates the unified Southern Power stream key for Marcus + Gangsta

import StreamKey from "../models/StreamKey.js";

// The unified stream key for Southern Power
const SOUTHERN_POWER_KEY = "SPS-NLG-UNIFIED-SOUTHERN-POWER-01-X9G7L2";

// RTMP endpoint
const RTMP_ENDPOINT = process.env.SPS_SOUTHERN_POWER_RTMP || "rtmp://localhost:1935/southernpower";

/**
 * Ensures the Southern Power unified stream key exists
 * This key is shared between Marcus & Gangsta for unified streaming
 */
export async function ensureSouthernPowerStreamKey() {
  try {
    // Check if key already exists
    let streamKey = await StreamKey.findOne({ key: SOUTHERN_POWER_KEY });

    if (!streamKey) {
      // Create the unified key
      streamKey = await StreamKey.create({
        label: "Southern Power Unified Stream Key",
        key: SOUTHERN_POWER_KEY,
        channelName: "Southern Power",
        allowedUsers: [], // Will be populated when users are known
        rtmpEndpoint: RTMP_ENDPOINT,
        platforms: {
          facebook: {
            enabled: true,
            rtmpUrl: process.env.FACEBOOK_RTMP_URL || "",
            streamKey: process.env.FACEBOOK_STREAM_KEY || "",
          },
          instagram: {
            enabled: true,
            rtmpUrl: process.env.INSTAGRAM_RTMP_URL || "",
            streamKey: process.env.INSTAGRAM_STREAM_KEY || "",
          },
          youtube: {
            enabled: true,
            rtmpUrl: process.env.YOUTUBE_RTMP_URL || "",
            streamKey: process.env.YOUTUBE_STREAM_KEY || "",
          },
          tiktok: {
            enabled: false,
            rtmpUrl: process.env.TIKTOK_RTMP_URL || "",
            streamKey: process.env.TIKTOK_STREAM_KEY || "",
          },
          twitch: {
            enabled: false,
            rtmpUrl: process.env.TWITCH_RTMP_URL || "",
            streamKey: process.env.TWITCH_STREAM_KEY || "",
          },
        },
        isActive: true,
      });

      console.log("✅ [SouthernPower] Created unified stream key:", SOUTHERN_POWER_KEY);
      console.log("   RTMP Endpoint:", RTMP_ENDPOINT);
    } else {
      console.log("✅ [SouthernPower] Unified stream key already exists");
    }

    return streamKey;
  } catch (err) {
    console.error("❌ [SouthernPower] Failed to ensure stream key:", err.message);
    return null;
  }
}

/**
 * Add a user to the allowed users list for Southern Power
 */
export async function addUserToSouthernPower(userId) {
  try {
    const streamKey = await StreamKey.findOne({ key: SOUTHERN_POWER_KEY });
    if (!streamKey) {
      console.warn("[SouthernPower] Stream key not found");
      return null;
    }

    if (!streamKey.allowedUsers.includes(userId)) {
      streamKey.allowedUsers.push(userId);
      await streamKey.save();
      console.log(`✅ [SouthernPower] Added user ${userId} to allowed users`);
    }

    return streamKey;
  } catch (err) {
    console.error("[SouthernPower] Failed to add user:", err.message);
    return null;
  }
}

/**
 * Get the Southern Power stream key
 */
export async function getSouthernPowerKey() {
  return await StreamKey.findOne({ key: SOUTHERN_POWER_KEY, isActive: true });
}

export default {
  ensureSouthernPowerStreamKey,
  addUserToSouthernPower,
  getSouthernPowerKey,
  SOUTHERN_POWER_KEY,
};

