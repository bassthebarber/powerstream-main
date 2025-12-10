// backend/TokenDistributor.js

const distributeTokens = (trackId, splits) => {
  return {
    track: trackId,
    status: "initiated",
    platform: splits.platform,
    artist: splits.artist,
    timestamp: Date.now()
  };
};

export default distributeTokens;
