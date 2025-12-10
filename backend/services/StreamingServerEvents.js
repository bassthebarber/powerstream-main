// backend/services/StreamingServerEvents.js
// Event handlers for NodeMediaServer publish/donePublish events
import MultistreamProcessManager from "./MultistreamProcessManager.js";
import MultistreamSession from "../models/MultistreamSession.js";

/**
 * Handle stream publish event
 * This is called when a stream starts publishing to NodeMediaServer
 */
export async function onPublish(id, streamPath, args) {
  const streamKey = streamPath.split("/").pop();
  console.log(`[StreamingServerEvents] Stream published: ${streamPath} (key: ${streamKey})`);

  // Find active multistream session for this stream key
  // The session should have been created when "Go Live" was clicked
  // We can match by streamKey or sessionId stored in metadata
  try {
    const session = await MultistreamSession.findOne({
      $or: [
        { inputUrl: { $regex: streamKey } },
        { sessionId: { $regex: streamKey } },
      ],
      status: { $in: ["starting", "active"] },
    }).sort({ startedAt: -1 });

    if (session) {
      console.log(`[StreamingServerEvents] Found session ${session.sessionId} for stream ${streamKey}`);
      // Session is already started, just log
    } else {
      console.log(`[StreamingServerEvents] No active session found for stream ${streamKey}`);
    }
  } catch (error) {
    console.error(`[StreamingServerEvents] Error handling publish:`, error);
  }
}

/**
 * Handle stream donePublish event
 * This is called when a stream stops publishing
 */
export async function onDonePublish(id, streamPath, args) {
  const streamKey = streamPath.split("/").pop();
  console.log(`[StreamingServerEvents] Stream ended: ${streamPath} (key: ${streamKey})`);

  // Find and stop any active multistream sessions for this stream
  try {
    const sessions = await MultistreamSession.find({
      $or: [
        { inputUrl: { $regex: streamKey } },
        { sessionId: { $regex: streamKey } },
      ],
      status: { $in: ["starting", "active"] },
    });

    for (const session of sessions) {
      console.log(`[StreamingServerEvents] Stopping session ${session.sessionId} due to stream end`);
      await MultistreamProcessManager.stopProcess(session.sessionId);
    }
  } catch (error) {
    console.error(`[StreamingServerEvents] Error handling donePublish:`, error);
  }
}

/**
 * Handle prePublish event (optional, for additional validation)
 */
export async function onPrePublish(id, streamPath, args) {
  // Additional validation can be added here
  // For now, StreamingServer.js handles the basic key check
}





