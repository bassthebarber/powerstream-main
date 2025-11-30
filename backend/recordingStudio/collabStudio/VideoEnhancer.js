// VideoEnhancer.js
const enhanceVideo = (rawVideoPath) => {
  return rawVideoPath.replace("/raw/", "/enhanced/");
};

module.exports = enhanceVideo;
