// backend/ai/studio/StudioEngine.js
import { addJob } from "./jobs/JobQueue.js";
import StudioJob from "./models/StudioJobModel.js";

let ioInstance = null;

export function initStudioEngine(io) {
  ioInstance = io;
  console.log("🎛️ Studio Engine initialized with Redis + SocketIO");
}

export async function handleMix(filename) {
  await createJob("mix", filename);
}

export async function handleMaster(filename) {
  await createJob("master", filename);
}

async function createJob(type, filename) {
  const jobId = await addJob(type, filename);
  await StudioJob.create({ jobId, type, track: filename });

  if (ioInstance)
    ioInstance.emit("studioProgress", {
      status: "queued",
      progress: 0,
      track: filename,
    });
}
