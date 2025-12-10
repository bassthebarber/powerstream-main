// backend/tvDistribution/FireTVConfig.js

export const buildFireConfig = (contentList) => {
  return {
    appTitle: "PowerStream TV",
    language: "en",
    content: contentList.map((item) => ({
      id: item._id,
      title: item.title,
      summary: item.description,
      videoUrl: item.streamURL,
      imageUrl: item.thumbnailURL,
      tags: [item.category],
    })),
  };
};

export default buildFireConfig;
