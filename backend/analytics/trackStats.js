// backend/analytics/trackStats.js

const trackStats = (trackPlays) => {
  return trackPlays.reduce((acc, play) => {
    const { trackId } = play;
    acc[trackId] = acc[trackId] ? acc[trackId] + 1 : 1;
    return acc;
  }, {});
};

export default trackStats;
