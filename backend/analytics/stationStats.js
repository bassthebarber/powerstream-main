// backend/analyticsEngine/stationStats.js
const stationStats = (viewData) => {
  return viewData.reduce((acc, entry) => {
    const { station } = entry;
    acc[station] = acc[station] ? acc[station] + 1 : 1;
    return acc;
  }, {});
};

module.exports = stationStats;
