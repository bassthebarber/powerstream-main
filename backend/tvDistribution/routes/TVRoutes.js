// backend/tvDistribution/routes/tvRoutes.js
const express = require("express");
const router = express.Router();
const tvController = require("../controllers/TVController");

router.get("/roku/feed", tvController.rokuFeed);
router.get("/fire/config", tvController.fireFeed);
router.get("/apple/feed", tvController.appleFeed);

module.exports = router;
