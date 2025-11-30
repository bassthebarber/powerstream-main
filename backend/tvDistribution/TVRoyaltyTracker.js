// ✅ TV Royalty Tracker (backend/tvDistribution/tvRoyaltyTracker.js)


const trackViewing = (userId, contentId, deviceType) => {
const log = {
user: userId,
content: contentId,
device: deviceType,
timestamp: Date.now()
};
console.log('📺 TV View Logged:', log);
return log;
};


module.exports = { trackViewing };