// ✅ AI TV Recommendation Engine (backend/tvDistribution/tvRecommenderAI.js)


const getRecommendations = (userHistory) => {
// Basic mock logic, should be replaced with AI model or ML algorithm
const genresWatched = userHistory.map(h => h.genre);
const mostWatched = genresWatched.sort((a, b) =>
genresWatched.filter(g => g === a).length - genresWatched.filter(g => g === b).length
).pop();


return [`Top pick from ${mostWatched}`, `More ${mostWatched} shows`, 'Trending Now'];
};


module.exports = { getRecommendations };