// backend/services/MultiPlatformRelay.js
// Multi-Platform Relay Service - Pushes stream to Facebook, YouTube, Instagram, etc.

import StreamKey from "../models/StreamKey.js";

/**
 * Get the relay configuration for Southern Power unified streaming
 * 
 * @param {string} streamKeyValue - The stream key string
 * @returns {Object|null} Relay configuration or null if invalid
 */
export async function getSouthernPowerRelayConfig(streamKeyValue) {
  try {
    const record = await StreamKey.findOne({ 
      key: streamKeyValue, 
      isActive: true 
    }).lean();

    if (!record) {
      console.warn("[SouthernPowerRelay] Invalid or inactive stream key:", streamKeyValue);
      return null;
    }

    const { platforms, channelName, rtmpEndpoint } = record;

    return {
      channelName,
      rtmpEndpoint,
      platforms: {
        facebook: {
          enabled: platforms.facebook?.enabled || false,
          rtmpUrl: process.env.FACEBOOK_RTMP_URL || platforms.facebook?.rtmpUrl || "",
          streamKey: process.env.FACEBOOK_STREAM_KEY || platforms.facebook?.streamKey || "",
        },
        instagram: {
          enabled: platforms.instagram?.enabled || false,
          rtmpUrl: process.env.INSTAGRAM_RTMP_URL || platforms.instagram?.rtmpUrl || "",
          streamKey: process.env.INSTAGRAM_STREAM_KEY || platforms.instagram?.streamKey || "",
        },
        youtube: {
          enabled: platforms.youtube?.enabled || false,
          rtmpUrl: process.env.YOUTUBE_RTMP_URL || platforms.youtube?.rtmpUrl || "",
          streamKey: process.env.YOUTUBE_STREAM_KEY || platforms.youtube?.streamKey || "",
        },
        tiktok: {
          enabled: platforms.tiktok?.enabled || false,
          rtmpUrl: process.env.TIKTOK_RTMP_URL || platforms.tiktok?.rtmpUrl || "",
          streamKey: process.env.TIKTOK_STREAM_KEY || platforms.tiktok?.streamKey || "",
        },
        twitch: {
          enabled: platforms.twitch?.enabled || false,
          rtmpUrl: process.env.TWITCH_RTMP_URL || platforms.twitch?.rtmpUrl || "",
          streamKey: process.env.TWITCH_STREAM_KEY || platforms.twitch?.streamKey || "",
        },
      },
    };
  } catch (err) {
    console.error("[SouthernPowerRelay] Error getting relay config:", err.message);
    return null;
  }
}

/**
 * Get enabled relay destinations
 * Returns array of { platform, rtmpUrl, streamKey } for all enabled platforms
 */
export async function getEnabledRelayDestinations(streamKeyValue) {
  const config = await getSouthernPowerRelayConfig(streamKeyValue);
  if (!config) return [];

  const destinations = [];
  
  for (const [platform, settings] of Object.entries(config.platforms)) {
    if (settings.enabled && settings.rtmpUrl && settings.streamKey) {
      destinations.push({
        platform,
        rtmpUrl: settings.rtmpUrl,
        streamKey: settings.streamKey,
        fullUrl: `${settings.rtmpUrl}${settings.streamKey}`,
      });
    }
  }

  return destinations;
}

/**
 * Build FFmpeg relay command for a destination
 * 
 * @param {string} inputUrl - Input RTMP URL (your server)
 * @param {Object} destination - { rtmpUrl, streamKey }
 * @returns {string} FFmpeg command
 */
export function buildRelayCommand(inputUrl, destination) {
  const outputUrl = `${destination.rtmpUrl}${destination.streamKey}`;
  
  // FFmpeg command for relaying RTMP stream
  return `ffmpeg -i "${inputUrl}" -c copy -f flv "${outputUrl}"`;
}

/**
 * Start relay to all enabled platforms
 * NOTE: This is a stub - actual implementation requires spawning ffmpeg processes
 * 
 * @param {string} streamKeyValue - The stream key
 * @param {string} inputUrl - Input RTMP URL
 */
export async function startMultiPlatformRelay(streamKeyValue, inputUrl) {
  const destinations = await getEnabledRelayDestinations(streamKeyValue);
  
  console.log(`[SouthernPowerRelay] Starting relay from ${inputUrl}`);
  console.log(`[SouthernPowerRelay] Enabled destinations: ${destinations.length}`);
  
  const relayCommands = [];
  
  for (const dest of destinations) {
    const command = buildRelayCommand(inputUrl, dest);
    relayCommands.push({
      platform: dest.platform,
      command,
      status: "pending",
    });
    console.log(`[SouthernPowerRelay] ${dest.platform}: ${dest.rtmpUrl}`);
  }
  
  // TODO: Actually spawn ffmpeg processes here
  // This would involve child_process.spawn() for each destination
  
  return {
    success: true,
    inputUrl,
    destinations: destinations.map(d => d.platform),
    relayCommands,
  };
}

/**
 * Stop all relay processes
 * NOTE: Stub - would kill all ffmpeg child processes
 */
export async function stopMultiPlatformRelay() {
  console.log("[SouthernPowerRelay] Stopping all relay processes");
  // TODO: Kill all ffmpeg child processes
  return { success: true };
}

/**
 * Update platform configuration
 */
export async function updatePlatformConfig(streamKeyValue, platform, config) {
  try {
    const streamKey = await StreamKey.findOne({ key: streamKeyValue });
    if (!streamKey) {
      return { success: false, error: "Stream key not found" };
    }

    if (streamKey.platforms[platform]) {
      Object.assign(streamKey.platforms[platform], config);
      await streamKey.save();
      console.log(`[SouthernPowerRelay] Updated ${platform} config`);
      return { success: true, platforms: streamKey.platforms };
    }

    return { success: false, error: `Unknown platform: ${platform}` };
  } catch (err) {
    console.error("[SouthernPowerRelay] Error updating platform:", err.message);
    return { success: false, error: err.message };
  }
}

export default {
  getSouthernPowerRelayConfig,
  getEnabledRelayDestinations,
  buildRelayCommand,
  startMultiPlatformRelay,
  stopMultiPlatformRelay,
  updatePlatformConfig,
};


