// backend/controllers/tvController.js
import getTVContentFeed from "../tvDistribution/TVContentFeed.js";
import buildRokuManifest from "../tvDistribution/RokuManifestBuilder.js";
import buildFireConfig from "../tvDistribution/FireTVConfig.js";
import buildAppleFeed from "../tvDistribution/AppleTVFeedFormatter.js";
import sampleContent from "../data/sampleTVContent.json" assert { type: "json" };

export default {
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
