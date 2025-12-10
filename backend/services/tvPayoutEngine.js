// backend/services/tvPayoutEngine.js
// Universal TV Payout Engine - Flexible split logic for all stations

import TVRoyalty from "../models/TVRoyalty.js";

// === CONFIGURATION ===
const CONFIG = {
  PAYOUT_PER_VIEW: parseFloat(process.env.TV_PAYOUT_PER_VIEW) || 0.25, // $0.25 per view
  MIN_WATCH_DURATION_FOR_QUALIFIED: 30, // seconds
  PLATFORM_MASTER_USER_ID: process.env.SPS_MASTER_USER_ID || null, // Marcus / SPS wallet
};

// === DEFAULT PAYOUT SETTINGS ===
// Used when station doesn't have custom settings
const DEFAULT_PAYOUT_SETTINGS = {
  payoutMode: "PLATFORM_ONLY",
  platformCutPercentage: 100,
  stationOwnerCutPercentage: 0,
  artistCutPercentage: 0,
  managerCutPercentage: 0,
  platformAccountId: CONFIG.PLATFORM_MASTER_USER_ID,
  stationOwnerId: null,
};

/**
 * Create a royalty entry for a view
 * 
 * @param {Object} params
 * @param {Object} params.station - Station document (with payoutSettings)
 * @param {Object} params.video - Video document (with artistUserId, managerUserId)
 * @param {String} params.viewerUserId - Optional viewer user ID
 * @param {Number} params.watchDuration - Watch duration in seconds
 * @param {Object} params.metadata - Optional metadata (ip, userAgent, country, deviceType)
 * @returns {Object} { royalty, video } - Created royalty and updated video
 */
export async function createRoyalty({ 
  station, 
  video, 
  viewerUserId = null,
  watchDuration = 0,
  metadata = {},
}) {
  // Get payout settings from station or use defaults
  const payoutSettings = station.payoutSettings || DEFAULT_PAYOUT_SETTINGS;
  const payoutMode = payoutSettings.payoutMode || "PLATFORM_ONLY";
  
  // Calculate per-view amount
  const perViewAmount = CONFIG.PAYOUT_PER_VIEW;
  
  // Initialize cuts
  let platformCut = 0;
  let stationOwnerCut = 0;
  let artistCut = 0;
  let managerCut = 0;
  
  // Calculate cuts based on payout mode
  switch (payoutMode) {
    case "PLATFORM_ONLY":
      // 100% goes to SPS platform
      platformCut = perViewAmount;
      break;
      
    case "STATION_OWNER_SPLIT":
      // Split between platform and station owner
      platformCut = perViewAmount * ((payoutSettings.platformCutPercentage || 70) / 100);
      stationOwnerCut = perViewAmount * ((payoutSettings.stationOwnerCutPercentage || 30) / 100);
      break;
      
    case "ARTIST_WITH_MANAGER":
      // Full split including artist and manager (e.g., No Limit Gangsta)
      // Example default: 40% platform, 10% station, 40% artist, 10% manager
      platformCut = perViewAmount * ((payoutSettings.platformCutPercentage || 40) / 100);
      stationOwnerCut = perViewAmount * ((payoutSettings.stationOwnerCutPercentage || 10) / 100);
      artistCut = perViewAmount * ((payoutSettings.artistCutPercentage || 40) / 100);
      managerCut = perViewAmount * ((payoutSettings.managerCutPercentage || 10) / 100);
      break;
      
    default:
      // Fallback to platform only
      platformCut = perViewAmount;
  }
  
  // Determine if this is a qualified view (>30 seconds)
  const qualifiedView = watchDuration >= CONFIG.MIN_WATCH_DURATION_FOR_QUALIFIED;
  
  // Create the royalty document
  const royalty = await TVRoyalty.create({
    stationId: station._id,
    stationType: detectStationType(station),
    videoId: video._id,
    videoType: detectVideoType(video),
    viewerUserId: viewerUserId || null,
    
    payoutMode,
    
    // Recipients
    platformAccountId: payoutSettings.platformAccountId || CONFIG.PLATFORM_MASTER_USER_ID,
    stationOwnerId: payoutSettings.stationOwnerId || station.ownerUserId || null,
    artistUserId: video.artistUserId || null,
    managerUserId: video.managerUserId || null,
    
    // Amounts
    perViewAmount,
    platformCut,
    stationOwnerCut,
    artistCut,
    managerCut,
    
    // Percentages (for reference)
    platformCutPercentage: payoutSettings.platformCutPercentage || 100,
    stationOwnerCutPercentage: payoutSettings.stationOwnerCutPercentage || 0,
    artistCutPercentage: payoutSettings.artistCutPercentage || 0,
    managerCutPercentage: payoutSettings.managerCutPercentage || 0,
    
    // Status
    status: "pending",
    type: "view",
    
    // Metadata
    watchDuration,
    qualifiedView,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
    country: metadata.country,
    deviceType: metadata.deviceType,
  });
  
  // Update video stats
  video.views = (video.views || 0) + 1;
  video.totalEarnings = (video.totalEarnings || 0) + perViewAmount;
  await video.save();
  
  // Log for debugging
  console.log(`[TVPayoutEngine] View recorded for video "${video.title || video._id}"`);
  console.log(`[TVPayoutEngine] Mode: ${payoutMode} | Total: $${perViewAmount.toFixed(4)}`);
  console.log(`[TVPayoutEngine] Splits: Platform $${platformCut.toFixed(4)}, Station $${stationOwnerCut.toFixed(4)}, Artist $${artistCut.toFixed(4)}, Manager $${managerCut.toFixed(4)}`);
  
  return { royalty, video };
}

/**
 * Get payout summary for a station
 */
export async function getStationPayoutSummary(stationId, startDate = null, endDate = null) {
  return await TVRoyalty.getStationEarnings(stationId, startDate, endDate);
}

/**
 * Get payout summary for a user (artist or manager)
 */
export async function getUserPayoutSummary(userId, role = "artist") {
  return await TVRoyalty.getUserEarnings(userId, role);
}

/**
 * Get payout summary for a video
 */
export async function getVideoPayoutSummary(videoId) {
  return await TVRoyalty.getVideoEarnings(videoId);
}

/**
 * Update station payout settings
 */
export function buildPayoutSettings({
  payoutMode = "PLATFORM_ONLY",
  platformCutPercentage = 100,
  stationOwnerCutPercentage = 0,
  artistCutPercentage = 0,
  managerCutPercentage = 0,
  platformAccountId = null,
  stationOwnerId = null,
}) {
  // Validate percentages sum to 100
  const total = platformCutPercentage + stationOwnerCutPercentage + artistCutPercentage + managerCutPercentage;
  if (total !== 100) {
    console.warn(`[TVPayoutEngine] Warning: Percentages sum to ${total}%, not 100%`);
  }
  
  return {
    payoutMode,
    platformCutPercentage,
    stationOwnerCutPercentage,
    artistCutPercentage,
    managerCutPercentage,
    platformAccountId: platformAccountId || CONFIG.PLATFORM_MASTER_USER_ID,
    stationOwnerId,
  };
}

// === HELPER FUNCTIONS ===

function detectStationType(station) {
  // Detect based on model name or schema
  if (station.constructor?.modelName === "NLFTV") return "NLFTV";
  if (station.constructor?.modelName === "ChurchStation") return "ChurchStation";
  if (station.constructor?.modelName === "SchoolStation") return "SchoolStation";
  return "Station";
}

function detectVideoType(video) {
  if (video.constructor?.modelName === "NLFVideo") return "NLFVideo";
  if (video.constructor?.modelName === "Film") return "Film";
  return "Video";
}

// === EXPORTS ===
export default {
  createRoyalty,
  getStationPayoutSummary,
  getUserPayoutSummary,
  getVideoPayoutSummary,
  buildPayoutSettings,
  CONFIG,
  DEFAULT_PAYOUT_SETTINGS,
};



