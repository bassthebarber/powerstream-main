import { Router } from "express";
const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Controller API is working' });
});

export default router;
