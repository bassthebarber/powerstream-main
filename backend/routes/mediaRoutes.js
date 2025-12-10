import { Router } from "express";
const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Media API is working' });
});

export default router;
