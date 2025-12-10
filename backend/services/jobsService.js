import Job from "../models/JobModel.js";

export async function createJob(type, scope) {
  const job = await Job.create({ type, scope, status: "pending" });
  return job;
}

export async function updateJob(jobId, updates) {
  return Job.findByIdAndUpdate(jobId, updates, { new: true });
}

export async function addJobLog(jobId, msg) {
  return Job.findByIdAndUpdate(
    jobId,
    { $push: { logs: { msg, ts: new Date() } } },
    { new: true }
  );
}

export async function getJob(jobId) {
  return Job.findById(jobId);
}
