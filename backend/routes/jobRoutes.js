import { Router } from 'express';
import Job from '../models/JobModel.js';

const router = Router();

// list recent jobs
router.get('/', async (_req, res) => {
  const jobs = await Job.find().sort('-createdAt').limit(50);
  res.json(jobs);
});

// create a job
router.post('/', async (req, res) => {
  const job = await Job.create({
    type: req.body.type || 'custom',
    payload: req.body.payload || {},
  });
  res.status(201).json(job);
});

// get one job
router.get('/:id', async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ error: 'Not found' });
  res.json(job);
});

export default router;
