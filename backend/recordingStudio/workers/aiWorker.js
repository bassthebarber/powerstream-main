// backend/workers/aiWorker.js
import { Worker, QueueEvents } from "bullmq";
import { AI_QUEUE_NAME } from "../queues/aiQueue.js";
import { redisUrl } from "../utils/redis.js";

const queueEvents = new QueueEvents(AI_QUEUE_NAME, { connection: { url: redisUrl } });
queueEvents.on("completed", ({ jobId }) => console.log(`[AI Worker] completed job ${jobId}`));
queueEvents.on("failed", ({ jobId, failedReason }) =>
  console.error(`[AI Worker] failed job ${jobId}: ${failedReason}`)
);

const worker = new Worker(
  AI_QUEUE_NAME,
  async (job) => {
    const { type, payload } = job.data;
    console.log(`[AI Worker] processing ${type}`, payload);

    // TODO: call your engines (mixing/mastering/etc.)
    // simulate work:
    await new Promise((r) => setTimeout(r, 1500));

    return { ok: true, processedAt: Date.now() };
  },
  { connection: { url: redisUrl } }
);

worker.on("error", (e) => console.error("[AI Worker] error:", e));
