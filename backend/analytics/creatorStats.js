// backend/analyticsEngine/creatorStats.js
const creatorStats = (plays) => {
  return plays.reduce((acc, entry) => {
    const { creatorId } = entry;
    acc[creatorId] = acc[creatorId] || { streams: 0, tips: 0, revenue: 0 };
    acc[creatorId].streams += 1;
    acc[creatorId].tips += entry.tip || 0;
    acc[creatorId].revenue += entry.revenue || 0;
    return acc;
  }, {});
};

module.exports = creatorStats;
