// backend/groupCall.routes.js

import { Router } from 'express';
// import * as groupCallController from './controllers/groupCall.controller.js';

const router = Router();

// Placeholder handlers until controller is available
const placeholder = (req, res) => res.json({ message: 'Group call endpoint placeholder' });

// Start a group call
router.post('/start', placeholder);

// End a group call
router.post('/end/:callId', placeholder);

// Get all group calls by user
router.get('/user/:userId', placeholder);

export default router;
