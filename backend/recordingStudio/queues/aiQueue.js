// backend/queues/aiQueue.js
import { Queue } from "bullmq";
import { redisUrl } from "../utils/redis.js";

export const AI_QUEUE_NAME = "aiTask";

export const aiQueue = new Queue(AI_QUEUE_NAME, {
  connection: { url: redisUrl },
  defaultJobOptions: { removeOnComplete: true, attempts: 1 }
});
