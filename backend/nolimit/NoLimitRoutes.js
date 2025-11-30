import express from 'express';
import {
  submitMessage,
  getAllMessages,
} from './NoLimitController.js';

const router = express.Router();

router.post('/messages', submitMessage);       // POST fan message
router.get('/messages', getAllMessages);       // GET all messages

export default router;
