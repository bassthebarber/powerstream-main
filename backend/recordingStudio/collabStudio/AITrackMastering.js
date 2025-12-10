// AITrackMastering.js
const masterAudioTrack = (rawTrackPath) => {
  return `/mastered/${rawTrackPath.replace("recording_", "mastered_")}`;
};

export default masterAudioTrack;
