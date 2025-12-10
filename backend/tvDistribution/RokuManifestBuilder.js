// backend/tvDistribution/RokuManifestBuilder.js

export const buildRokuManifest = (contentList) => {
  return {
    providerName: "PowerStream",
    lastUpdated: new Date().toISOString(),
    language: "en",
    categories: [
      {
        name: "PowerTV",
        playlist: contentList.map((item) => ({
          id: item._id,
          title: item.title,
          content: {
            videos: [{ url: item.streamURL }],
          },
          thumbnails: {
            default: { url: item.thumbnailURL },
          },
        })),
      },
    ],
  };
};

export default buildRokuManifest;
