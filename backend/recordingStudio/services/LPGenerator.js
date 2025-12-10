// /backend/recordingStudio/services/LPGenerator.js
export const generateLP = (artistName, songCount = 7) => {
  const tracks = Array.from({ length: songCount }, (_, i) => ({
    title: `Track ${i + 1}`,
    beat: `AI-generated beat #${i + 1}`,
  }));
  return {
    albumTitle: `${artistName}'s Debut LP`,
    tracks,
  };
};
