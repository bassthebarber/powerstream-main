import express from 'express';
import Show from '../models/showModel.js';
const router = Router();

router.get('/', async (req, res) => {
  const { q } = req.query;
  const regex = new RegExp(q, 'i');
  const results = await Show.find({ title: regex }).limit(20);
  res.json(results);
});

export default router;
