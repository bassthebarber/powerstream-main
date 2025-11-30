// backend/routes/copilotRoutes.js
import { Router } from 'express';
// import { handlePrompt, listTasks } from '../controllers/aiCopilotController.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'copilot' });
});

// Example endpoints (uncomment & implement controllers as needed)
// router.post('/prompt', handlePrompt);
// router.get('/tasks', listTasks);

export default router;
