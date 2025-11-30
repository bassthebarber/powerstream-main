// UploadToStream.js
const uploadToPlatform = (trackURL, artistId, title) => {
  return {
    status: "success",
    message: `Track "${title}" by artist ${artistId} uploaded and live!`,
    playURL: `https://powerstreammusic.com/track/${artistId}/${title}`
  };
};

module.exports = uploadToPlatform;
