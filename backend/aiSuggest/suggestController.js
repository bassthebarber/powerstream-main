// backend/aiSuggest/controllers/suggestController.js
const applyAutoTune = require("./autotuneEngine");
const classifyGenre = require("./GenreClassifier");
const generateCaption = require("./captionWriter");

module.exports = {
  autoTune: (req, res) => {
    const path = applyAutoTune(req.body.audioPath);
    res.json({ tuned: path });
  },
  classifyGenre: (req, res) => {
    const tags = classifyGenre(req.body.lyrics);
    res.json({ genreTags: tags });
  },
  captionWriter: (req, res) => {
    const caption = generateCaption(req.body.lyrics);
    res.json({ caption });
  }
};
