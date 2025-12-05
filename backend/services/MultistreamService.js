// backend/services/MultistreamService.js
// RTMP Fan-out Service using MultistreamProcessManager
import MultistreamProcessManager from "./MultistreamProcessManager.js";
import RTMPEndpoint from "../models/RTMPEndpoint.js";
import MultistreamProfile from "../models/MultistreamProfile.js";

/**
 * Start multistream fan-out (using MultistreamProcessManager)
 * @param {string} sessionId - Stream session ID
 * @param {string} inputRtmpUrl - Input RTMP URL (e.g., rtmp://localhost:1935/live/streamKey)
 * @param {string} userId - User ID
 * @param {Object} options - { stationId, profileId, recordingEnabled, selectedEndpoints }
 * @returns {Promise<Object>} Stream info with status
 */
export async function startMultistream(sessionId, inputRtmpUrl, userId, options = {}) {
  try {
    const { stationId, profileId, recordingEnabled, selectedEndpoints } = options;

    let endpoints = [];

    // If profileId is provided, use endpoints from profile
    if (profileId) {
      const profile = await MultistreamProfile.findById(profileId);
      if (!profile || profile.userId.toString() !== userId.toString()) {
        return {
          success: false,
          message: "Profile not found or access denied",
          endpoints: [],
        };
      }
      endpoints = await RTMPEndpoint.find({
        _id: { $in: profile.endpointIds },
        isActive: true,
      });
    } else if (selectedEndpoints && selectedEndpoints.length > 0) {
      // Use selected endpoints
      endpoints = await RTMPEndpoint.find({
        _id: { $in: selectedEndpoints },
        userId,
        isActive: true,
      });
    } else {
      // Get all active RTMP endpoints for this user (and optionally station)
      const query = {
        userId,
        isActive: true,
      };
      if (stationId) {
        query.$or = [
          { stationId: stationId },
          { stationId: null }, // Global endpoints
        ];
      }
      endpoints = await RTMPEndpoint.find(query);
    }

    if (endpoints.length === 0) {
      console.log(`[Multistream] No RTMP endpoints configured for user ${userId}`);
      return {
        success: false,
        message: "No RTMP endpoints configured",
        endpoints: [],
      };
    }

    // Filter out Instagram/TikTok if bridge-proxy not configured
    const validEndpoints = endpoints.filter((ep) => {
      if (ep.needsBridgeProxy() && !ep.bridgeProxyUrl) {
        console.warn(
          `[Multistream] Skipping ${ep.platform} endpoint ${ep.name} - bridge-proxy URL not configured`
        );
        return false;
      }
      return true;
    });

    if (validEndpoints.length === 0) {
      return {
        success: false,
        message: "No valid RTMP endpoints available",
        endpoints: [],
      };
    }

    // Start process using MultistreamProcessManager
    const result = await MultistreamProcessManager.startProcess({
      sessionId,
      inputRtmpUrl,
      endpoints: validEndpoints,
      userId,
      stationId,
      recordingEnabled: recordingEnabled || process.env.ENABLE_RECORDING === "true",
    });

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      sessionId,
      endpoints: result.processInfo.endpoints,
      message: `Multistream started to ${validEndpoints.length} platforms`,
      recordingPath: result.processInfo.recordingPath,
    };
  } catch (error) {
    console.error("[Multistream] Error starting multistream:", error);
    return {
      success: false,
      message: error.message,
      endpoints: [],
    };
  }
}

/**
 * Stop multistream fan-out (using MultistreamProcessManager)
 * @param {string} sessionId - Stream session ID
 */
export async function stopMultistream(sessionId) {
  return await MultistreamProcessManager.stopProcess(sessionId);
}

/**
 * Get status of active multistream (using MultistreamProcessManager)
 * @param {string} sessionId - Stream session ID
 */
export function getMultistreamStatus(sessionId) {
  return MultistreamProcessManager.getProcessStatus(sessionId);
}

/**
 * Get all active multistream sessions (using MultistreamProcessManager)
 */
export function getAllActiveMultistreams() {
  return MultistreamProcessManager.getAllProcesses();
}

export default {
  startMultistream,
  stopMultistream,
  getMultistreamStatus,
  getAllActiveMultistreams,
};
