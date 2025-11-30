// backend/ai/studio/jobs/JobQueue.js
import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
});

export const studioQueue = new Queue("studio-jobs", { connection });

export async function addJob(type, track) {
  const job = await studioQueue.add(type, { track }, { attempts: 3 });
  console.log(`📦 Job added: ${type} for ${track}`);
  return job.id;
}
