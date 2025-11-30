// Simple job record for build tasks, etc.
import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },         // e.g. "build powerfeed"
    payload: { type: mongoose.Schema.Types.Mixed }, // anything you pass in
    status: {
      type: String,
      enum: ['queued', 'running', 'done', 'failed'],
      default: 'queued'
    },
    result: { type: mongoose.Schema.Types.Mixed }   // optional output/error
  },
  { timestamps: true }
);

export default mongoose.model('Job', JobSchema);
