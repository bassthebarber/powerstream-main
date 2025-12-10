// backend/routes/adminRoutes.js
import { Router } from "express";
const router = Router();

router.get('/', (_req, res) => {
  res.json({ message: 'Admin route working.' });
});

export default router;
