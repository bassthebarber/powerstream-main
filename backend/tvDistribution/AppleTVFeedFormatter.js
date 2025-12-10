// backend/tvDistribution/AppleTVFeedFormatter.js

export const buildAppleFeed = (contentList) => {
  return {
    app: "PowerStream",
    updated: new Date().toISOString(),
    items: contentList.map((item) => ({
      id: item._id,
      name: item.title,
      description: item.description,
      artwork: item.thumbnailURL,
      url: item.streamURL,
    })),
  };
};

export default buildAppleFeed;
