// backend/aiSuggest/suggestController.js

import applyAutoTune from "./autotuneEngine.js";
import classifyGenre from "./GenreClassifier.js";
import generateCaption from "./captionWriter.js";

export const autoTune = (req, res) => {
  const path = applyAutoTune(req.body.audioPath);
  res.json({ tuned: path });
};

export const classifyGenreHandler = (req, res) => {
  const tags = classifyGenre(req.body.lyrics);
  res.json({ genreTags: tags });
};

export const captionWriter = (req, res) => {
  const caption = generateCaption(req.body.lyrics);
  res.json({ caption });
};

export default {
  autoTune,
  classifyGenre: classifyGenreHandler,
  captionWriter,
};
