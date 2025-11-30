// BeatGeneratorAI.js
const generateBeat = (genre = "trap") => {
  return {
    beatURL: `https://beats.nolimiteasthouston.com/generated/${genre}_${Date.now()}.mp3`,
    price: 9.99,
    genre
  };
};

module.exports = generateBeat;
