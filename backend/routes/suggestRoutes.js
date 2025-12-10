// backend/routes/suggestRoutes.js
import express from "express";
import suggestController from "../aiSuggest/suggestController.js";

const router = express.Router();

router.post("/autotune", suggestController.autoTune);
router.post("/genre", suggestController.classifyGenre);
router.post("/caption", suggestController.captionWriter);

export default router;
