// backend/services/MultistreamProcessManager.js
// Production-ready FFmpeg process management for multistream fan-out
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import MultistreamSession from "../models/MultistreamSession.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Active processes in memory
const activeProcesses = new Map(); // sessionId -> ProcessInfo

/**
 * ProcessInfo structure:
 * {
 *   process: ChildProcess,
 *   sessionId: string,
 *   pid: number,
 *   startedAt: Date,
 *   endpoints: Array<Object>,
 *   recordingPath: string | null,
 *   status: 'starting' | 'active' | 'stopping' | 'stopped' | 'error',
 *   logs: Array<{timestamp, level, message}>
 * }
 */

/**
 * Get FFmpeg path (use ffmpeg-static if available, otherwise system ffmpeg)
 */
async function getFFmpegPath() {
  try {
    const ffmpegStatic = await import("ffmpeg-static");
    if (ffmpegStatic?.default) {
      return ffmpegStatic.default;
    }
  } catch (err) {
    console.warn("[MultistreamProcessManager] ffmpeg-static not available, using system ffmpeg");
  }
  return process.env.FFMPEG_PATH || "ffmpeg";
}

/**
 * Build FFmpeg command for RTMP fan-out with optional recording
 * @param {string} inputUrl - Input RTMP URL (from NodeMediaServer)
 * @param {Array<Object>} endpoints - Array of RTMPEndpoint objects
 * @param {Object} options - { recordingPath, ffmpegPath }
 * @returns {Object} FFmpeg command and args
 */
function buildFFmpegCommand(inputUrl, endpoints, options = {}) {
  const { recordingPath, ffmpegPath } = options;
  const args = [
    "-i",
    inputUrl, // Input stream from NodeMediaServer
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-tune",
    "zerolatency",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-f",
    "flv",
  ];

  // Add output for each RTMP endpoint
  endpoints.forEach((endpoint) => {
    const fullUrl = endpoint.getFullRTMPUrl();
    args.push(fullUrl);
  });

  // Add recording output if enabled
  if (recordingPath) {
    args.push(
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-c:a",
      "aac",
      "-f",
      "mp4",
      "-movflags",
      "frag_keyframe+empty_moov",
      recordingPath
    );
  }

  return { command: ffmpegPath, args };
}

/**
 * Start a multistream process with full lifecycle management
 * @param {Object} params - { sessionId, inputRtmpUrl, endpoints, userId, stationId, recordingEnabled }
 * @returns {Promise<Object>} Process info
 */
export async function startProcess(params) {
  const { sessionId, inputRtmpUrl, endpoints, userId, stationId, recordingEnabled } = params;

  // Check if process already exists
  if (activeProcesses.has(sessionId)) {
    const existing = activeProcesses.get(sessionId);
    if (existing.status === "active" || existing.status === "starting") {
      return {
        success: false,
        message: "Process already active for this session",
        processInfo: existing,
      };
    }
  }

  // Prepare recording path if enabled
  let recordingPath = null;
  if (recordingEnabled && process.env.ENABLE_RECORDING === "true") {
    const recordingsDir = path.join(__dirname, "../../recordings");
    await fs.mkdir(recordingsDir, { recursive: true });
    recordingPath = path.join(recordingsDir, `${sessionId}.mp4`);
  }

  // Get FFmpeg path
  const ffmpegPath = await getFFmpegPath();

  // Build command
  const { command, args } = buildFFmpegCommand(inputRtmpUrl, endpoints, {
    recordingPath,
    ffmpegPath,
  });

  console.log(`[MultistreamProcessManager] Starting process for session ${sessionId}`);
  console.log(`[MultistreamProcessManager] Input: ${inputRtmpUrl}`);
  console.log(`[MultistreamProcessManager] Outputs: ${endpoints.length} endpoints`);
  if (recordingPath) {
    console.log(`[MultistreamProcessManager] Recording to: ${recordingPath}`);
  }

  // Spawn FFmpeg process
  const ffmpegProcess = spawn(command, args, {
    stdio: ["ignore", "pipe", "pipe"],
    detached: false,
  });

  // Create process info
  const processInfo = {
    process: ffmpegProcess,
    sessionId,
    pid: ffmpegProcess.pid,
    startedAt: new Date(),
    endpoints: endpoints.map((ep) => ({
      endpointId: ep._id.toString(),
      platform: ep.platform,
      name: ep.name,
      status: "connecting",
      error: null,
    })),
    recordingPath,
    status: "starting",
    logs: [],
    userId,
    stationId,
  };

  // Store in memory
  activeProcesses.set(sessionId, processInfo);

  // Monitor process output
  let outputBuffer = "";
  ffmpegProcess.stdout.on("data", (data) => {
    const text = data.toString();
    outputBuffer += text;
    logProcess(sessionId, "info", text);
    parseFFmpegOutput(text, processInfo.endpoints);
  });

  ffmpegProcess.stderr.on("data", (data) => {
    const text = data.toString();
    logProcess(sessionId, "warn", text);
    parseFFmpegErrors(text, processInfo.endpoints);
  });

  // Handle process exit
  ffmpegProcess.on("exit", async (code, signal) => {
    console.log(`[MultistreamProcessManager] Process ${sessionId} exited: code=${code}, signal=${signal}`);
    logProcess(sessionId, "info", `Process exited: code=${code}, signal=${signal}`);

    processInfo.status = code === 0 ? "stopped" : "error";
    processInfo.endpoints.forEach((ep) => {
      if (ep.status === "connected") {
        ep.status = "disconnected";
      }
    });

    // Update database
    await updateSessionInDB(sessionId, {
      status: processInfo.status,
      stoppedAt: new Date(),
      exitCode: code,
      signal,
    });

    // Handle recording post-processing if exists
    if (recordingPath && code === 0) {
      await handleRecordingPostProcess(sessionId, recordingPath, stationId);
    }

    // Clean up after a delay (allow status queries)
    setTimeout(() => {
      activeProcesses.delete(sessionId);
    }, 60000); // Keep for 1 minute after exit
  });

  // Handle process errors
  ffmpegProcess.on("error", async (err) => {
    console.error(`[MultistreamProcessManager] Process ${sessionId} error:`, err);
    logProcess(sessionId, "error", `Process error: ${err.message}`);
    processInfo.status = "error";
    processInfo.endpoints.forEach((ep) => {
      ep.status = "error";
      ep.error = err.message;
    });

    await updateSessionInDB(sessionId, {
      status: "error",
      stoppedAt: new Date(),
      error: err.message,
    });

    activeProcesses.delete(sessionId);
  });

  // Wait a moment to check if process started successfully
  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (ffmpegProcess.killed || ffmpegProcess.exitCode !== null) {
    processInfo.status = "error";
    activeProcesses.delete(sessionId);
    return {
      success: false,
      message: "FFmpeg process failed to start",
      processInfo,
    };
  }

  // Mark as active
  processInfo.status = "active";

  // Create database session record
  await createSessionInDB({
    sessionId,
    userId,
    stationId,
    inputUrl: inputRtmpUrl,
    endpoints: processInfo.endpoints,
    recordingPath,
    status: "active",
    startedAt: processInfo.startedAt,
  });

  return {
    success: true,
    processInfo: {
      sessionId,
      pid: processInfo.pid,
      startedAt: processInfo.startedAt,
      endpoints: processInfo.endpoints,
      recordingPath,
      status: processInfo.status,
    },
  };
}

/**
 * Stop a multistream process cleanly
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Stop result
 */
export async function stopProcess(sessionId) {
  const processInfo = activeProcesses.get(sessionId);
  if (!processInfo) {
    return { success: false, message: "Process not found" };
  }

  if (processInfo.status === "stopping" || processInfo.status === "stopped") {
    return { success: false, message: "Process already stopping or stopped" };
  }

  console.log(`[MultistreamProcessManager] Stopping process ${sessionId}`);
  processInfo.status = "stopping";
  logProcess(sessionId, "info", "Stopping process...");

  try {
    // Send SIGTERM for graceful shutdown
    if (processInfo.process && !processInfo.process.killed) {
      processInfo.process.kill("SIGTERM");

      // Force kill after 5 seconds if still running
      const forceKillTimeout = setTimeout(() => {
        if (!processInfo.process.killed) {
          console.warn(`[MultistreamProcessManager] Force killing process ${sessionId}`);
          processInfo.process.kill("SIGKILL");
        }
      }, 5000);

      // Wait for process to exit
      await new Promise((resolve) => {
        processInfo.process.once("exit", () => {
          clearTimeout(forceKillTimeout);
          resolve();
        });
      });
    }

    // Update endpoint statuses
    processInfo.endpoints.forEach((ep) => {
      ep.status = "disconnected";
    });

    await updateSessionInDB(sessionId, {
      status: "stopped",
      stoppedAt: new Date(),
    });

    return { success: true, message: "Process stopped" };
  } catch (error) {
    console.error(`[MultistreamProcessManager] Error stopping process ${sessionId}:`, error);
    return { success: false, message: error.message };
  }
}

/**
 * Get process status
 * @param {string} sessionId - Session ID
 * @returns {Object|null} Process info or null
 */
export function getProcessStatus(sessionId) {
  const processInfo = activeProcesses.get(sessionId);
  if (!processInfo) {
    return null;
  }

  return {
    sessionId,
    pid: processInfo.pid,
    status: processInfo.status,
    startedAt: processInfo.startedAt,
    uptime: Date.now() - processInfo.startedAt.getTime(),
    endpoints: processInfo.endpoints,
    recordingPath: processInfo.recordingPath,
    logs: processInfo.logs.slice(-50), // Last 50 log entries
  };
}

/**
 * Get all active processes
 * @returns {Array<Object>} Array of process info
 */
export function getAllProcesses() {
  return Array.from(activeProcesses.values()).map((info) => ({
    sessionId: info.sessionId,
    pid: info.pid,
    status: info.status,
    startedAt: info.startedAt,
    uptime: Date.now() - info.startedAt.getTime(),
    endpoints: info.endpoints,
    stationId: info.stationId,
  }));
}

/**
 * Log a message for a process
 */
function logProcess(sessionId, level, message) {
  const processInfo = activeProcesses.get(sessionId);
  if (!processInfo) return;

  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message: message.trim(),
  };

  processInfo.logs.push(logEntry);

  // Keep only last 1000 logs
  if (processInfo.logs.length > 1000) {
    processInfo.logs.shift();
  }

  // Also log to console with context
  const prefix = `[MultistreamProcessManager:${sessionId}]`;
  if (level === "error") {
    console.error(`${prefix} ${message}`);
  } else if (level === "warn") {
    console.warn(`${prefix} ${message}`);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

/**
 * Parse FFmpeg output to detect connection status
 */
function parseFFmpegOutput(output, endpointStatuses) {
  // Look for connection success indicators
  if (output.includes("Stream #0") && output.includes("->")) {
    endpointStatuses.forEach((status) => {
      if (status.status === "connecting") {
        status.status = "connected";
        status.error = null;
      }
    });
  }
}

/**
 * Parse FFmpeg errors to detect connection failures
 */
function parseFFmpegErrors(errorText, endpointStatuses) {
  // Check for RTMP connection errors
  if (
    errorText.includes("Connection refused") ||
    errorText.includes("Connection timed out") ||
    errorText.includes("Failed to connect")
  ) {
    endpointStatuses.forEach((status) => {
      if (status.status === "connecting") {
        status.status = "error";
        status.error = "Connection failed";
      }
    });
  }
}

/**
 * Create session record in database
 */
async function createSessionInDB(data) {
  try {
    const session = new MultistreamSession(data);
    await session.save();
  } catch (error) {
    console.error("[MultistreamProcessManager] Error creating session in DB:", error);
  }
}

/**
 * Update session record in database
 */
async function updateSessionInDB(sessionId, updates) {
  try {
    await MultistreamSession.findOneAndUpdate({ sessionId }, updates);
  } catch (error) {
    console.error("[MultistreamProcessManager] Error updating session in DB:", error);
  }
}

/**
 * Handle recording post-processing
 */
async function handleRecordingPostProcess(sessionId, recordingPath, stationId) {
  try {
    // Check if file exists and has content
    const stats = await fs.stat(recordingPath);
    if (stats.size === 0) {
      console.warn(`[MultistreamProcessManager] Recording ${sessionId} is empty, skipping`);
      await fs.unlink(recordingPath).catch(() => {});
      return;
    }

    console.log(`[MultistreamProcessManager] Recording ${sessionId} completed: ${stats.size} bytes`);

    // Mark as ready for VOD processing
    await updateSessionInDB(sessionId, {
      recordingReady: true,
      recordingSize: stats.size,
    });

    // Trigger VOD asset creation
    try {
      const VODService = await import("./VODService.js");
      const session = await MultistreamSession.findOne({ sessionId });
      if (session) {
        await VODService.processRecording(sessionId);
        console.log(`[MultistreamProcessManager] VOD asset created for session ${sessionId}`);
      }
    } catch (vodError) {
      console.error(`[MultistreamProcessManager] VOD processing error (non-fatal):`, vodError);
      // Don't fail the whole process if VOD creation fails
    }
  } catch (error) {
    console.error(`[MultistreamProcessManager] Error in recording post-process:`, error);
  }
}

export default {
  startProcess,
  stopProcess,
  getProcessStatus,
  getAllProcesses,
};

