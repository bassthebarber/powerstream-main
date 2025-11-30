// backend/ai/studio/jobs/JobWorker.js
import { Worker } from "bullmq";
import IORedis from "ioredis";
import mongoose from "mongoose";
import { processAudioJob } from "../AudioModelController.js";
import StudioJob from "../models/StudioJobModel.js";

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const worker = new Worker(
  "studio-jobs",
  async (job) => {
    const { track } = job.data;
    console.log(`🎶 Worker processing ${job.name} for ${track}`);

    const record = await StudioJob.findOneAndUpdate(
      { jobId: job.id },
      { status: "processing" },
      { new: true }
    );

    await processAudioJob(job.name, track, async (progress) => {
      await StudioJob.findOneAndUpdate(
        { jobId: job.id },
        { progress },
        { new: true }
      );
    });

    await StudioJob.findOneAndUpdate(
      { jobId: job.id },
      { status: "completed", progress: 100 },
      { new: true }
    );

    console.log(`✅ ${job.name} complete for ${track}`);
  },
  { connection }
);

worker.on("completed", (job) =>
  console.log(`🎉 Job ${job.id} (${job.name}) completed successfully.`)
);

worker.on("failed", (job, err) =>
  console.error(`❌ Job ${job.id} failed: ${err.message}`)
);
