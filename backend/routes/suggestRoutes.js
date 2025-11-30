// backend/aiSuggest/routes/suggestRoutes.js
const express = require("express");
const router = express.Router();
const suggestController = require("../aiSuggest/suggestController");

router.post("/autotune", suggestController.autoTune);
router.post("/genre", suggestController.classifyGenre);
router.post("/caption", suggestController.captionWriter);

module.exports = router;
