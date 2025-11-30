// backend/routes/autoResponseRoutes.js
import { Router } from "express";
const router = Router();
import autoResponseController from "../controllers/autoResponseController.js";

router.post('/add', autoResponseController.addResponse);
router.get('/all', autoResponseController.getAutoResponses);

export default router;
