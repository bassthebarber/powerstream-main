// Backend/routes/studioRoutes.js


import express from 'express';
import {
activateAIStudio,
runMixingSequence,
exportFinalProject,
} from '../recordingStudio/controllers/studioController.js';


const router = express.Router();


router.post('/activate', activateAIStudio);
router.post('/sequence', runMixingSequence);
router.post('/export', exportFinalProject);


export default router;