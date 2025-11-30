const express = require('express');
const router = express.Router();
const groupCallController = require('../controllers/groupCall.controller');

// Start a group call
router.post('/start', groupCallController.startGroupCall);

// End a group call
router.post('/end/:callId', groupCallController.endGroupCall);

// Get all group calls by user
router.get('/user/:userId', groupCallController.getUserGroupCalls);

module.exports = router;
