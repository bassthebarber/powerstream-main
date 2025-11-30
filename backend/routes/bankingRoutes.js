import express from 'express';
import { processPayout, syncToBankLedger } from '../controllers/bankingController.js';


const router = express.Router();


router.post('/transfer', processPayout);
router.post('/sync-ledger', syncToBankLedger);


export default router;