// backend/aiSuggest/captionHookGenerator.js

const generateCaptions = (content) => {
  const title = `🔥 ${content.topic} | ${content.genre} Drop`;
  const hashtags = [`#${content.genre}`, '#PowerStream', '#NowPlaying', '#ViralTrack'];
  const hook = `What if this is the track that breaks the charts? 👀`;

  return {
    title,
    hashtags,
    hook,
  };
};

export default generateCaptions;
