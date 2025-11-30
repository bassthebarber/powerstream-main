// AITrackMastering.js
const masterAudioTrack = (rawTrackPath) => {
  return `/mastered/${rawTrackPath.replace("recording_", "mastered_")}`;
};

module.exports = masterAudioTrack;
