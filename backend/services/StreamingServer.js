// backend/services/StreamingServer.js
// TODO: Config normalized to env.js for consistency.
// Centralized NodeMediaServer management with event integration
import NodeMediaServer from "node-media-server";
import path from "path";
import { fileURLToPath } from "url";
import env from "../src/config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration from centralized env config
const RTMP_PORT = env.RTMP_PORT;
const HLS_HTTP_PORT = env.HLS_PORT;
const STREAM_APP = "live";
const STREAM_SECRET = env.RTMP_SECRET; // Optional publish key
const FFMPEG_PATH = "ffmpeg";

const config = {
  rtmp: {
    port: RTMP_PORT,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
    // Security: require key if STREAM_SECRET is set
    publish_auth: !!STREAM_SECRET,
  },
  http: {
    port: HLS_HTTP_PORT,
    allow_origin: "*",
    mediaroot: path.join(__dirname, "../media"),
  },
  trans: {
    ffmpeg: FFMPEG_PATH,
    tasks: [
      {
        app: STREAM_APP,
        hls: true,
        hlsFlags: "[hls_time=2:hls_list_size=3:hls_flags=delete_segments]",
        dash: false,
      },
    ],
  },
};

let nms = null;
let isRunning = false;

// Event handlers (will be set by callers)
let eventHandlers = {
  onPublish: null,
  onDonePublish: null,
  onPrePublish: null,
};

/**
 * Start NodeMediaServer
 * @param {Object} handlers - { onPublish, onDonePublish, onPrePublish }
 * @returns {Promise<NodeMediaServer>}
 */
export async function startStreamingServer(handlers = {}) {
  if (isRunning && nms) {
    console.warn("[StreamingServer] NodeMediaServer already running");
    return nms;
  }

  eventHandlers = { ...eventHandlers, ...handlers };

  nms = new NodeMediaServer(config);

  // Pre-publish: Check stream key
  nms.on("prePublish", (id, streamPath, args) => {
    const streamKey = streamPath.split("/").pop();
    console.log(`[StreamingServer] Pre-publish: ${streamPath} (key: ${streamKey})`);

    if (STREAM_SECRET && args.key !== STREAM_SECRET) {
      console.warn(`[StreamingServer] Rejecting publish (bad key): ${streamPath}`);
      const session = nms.getSession(id);
      if (session) session.reject();
      return;
    }

    // Call custom handler
    if (eventHandlers.onPrePublish) {
      eventHandlers.onPrePublish(id, streamPath, args);
    }
  });

  // Publish started
  nms.on("postPublish", (id, streamPath, args) => {
    const streamKey = streamPath.split("/").pop();
    console.log(`[StreamingServer] Publish started: ${streamPath} (key: ${streamKey})`);

    // Call custom handler
    if (eventHandlers.onPublish) {
      eventHandlers.onPublish(id, streamPath, args);
    }
  });

  // Publish ended
  nms.on("donePublish", (id, streamPath, args) => {
    const streamKey = streamPath.split("/").pop();
    console.log(`[StreamingServer] Publish ended: ${streamPath} (key: ${streamKey})`);

    // Call custom handler
    if (eventHandlers.onDonePublish) {
      eventHandlers.onDonePublish(id, streamPath, args);
    }
  });

  // Start server
  nms.run();
  isRunning = true;

  console.log(`[StreamingServer] NodeMediaServer started`);
  console.log(`[StreamingServer] RTMP: rtmp://localhost:${RTMP_PORT}/${STREAM_APP}/<streamKey>`);
  console.log(`[StreamingServer] HLS: http://localhost:${HLS_HTTP_PORT}/${STREAM_APP}/<streamKey>/index.m3u8`);

  return nms;
}

/**
 * Stop NodeMediaServer
 */
export function stopStreamingServer() {
  if (nms) {
    nms.stop();
    nms = null;
    isRunning = false;
    console.log("[StreamingServer] NodeMediaServer stopped");
  }
}

/**
 * Get NodeMediaServer instance
 */
export function getStreamingServer() {
  return nms;
}

/**
 * Get RTMP ingest URL for a stream key
 */
export function getRTMPIngestUrl(streamKey) {
  const host = env.STREAM_DOMAIN || "localhost";
  return `rtmp://${host}:${RTMP_PORT}/${STREAM_APP}/${streamKey}`;
}

/**
 * Get HLS playback URL for a stream key
 */
export function getHLSPlaybackUrl(streamKey) {
  const host = env.STREAM_DOMAIN || "localhost";
  return `http://${host}:${HLS_HTTP_PORT}/${STREAM_APP}/${streamKey}/index.m3u8`;
}

/**
 * Check if server is running
 */
export function isServerRunning() {
  return isRunning;
}

export default {
  startStreamingServer,
  stopStreamingServer,
  getStreamingServer,
  getRTMPIngestUrl,
  getHLSPlaybackUrl,
  isServerRunning,
  config: {
    RTMP_PORT,
    HLS_HTTP_PORT,
    STREAM_APP,
  },
};
