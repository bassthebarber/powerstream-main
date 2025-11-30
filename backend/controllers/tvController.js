// backend/tvDistribution/controllers/tvController.js
const getTVContentFeed = require("../tvDistribution/TVContentFeed");
const buildRokuManifest = require("../tvDistribution/RokuManifestBuilder");
const buildFireConfig = require("../tvDistribution/FireTVConfig");
const buildAppleFeed = require("../tvDistribution/AppleTVFeedFormatter");

// Simulate content pull from DB
const sampleContent = require("../data/sampleTVContent.json");

module.exports = {
  rokuFeed: (req, res) => {
    const feed = buildRokuManifest(sampleContent);
    res.json(feed);
  },
  fireFeed: (req, res) => {
    const feed = buildFireConfig(sampleContent);
    res.json(feed);
  },
  appleFeed: (req, res) => {
    const feed = buildAppleFeed(sampleContent);
    res.json(feed);
  },
};
