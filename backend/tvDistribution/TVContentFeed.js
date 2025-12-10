// backend/tvDistribution/TVContentFeed.js

export const getTVContentFeed = (contentList) => {
  return contentList.map((item) => ({
    id: item._id,
    title: item.title,
    description: item.description,
    thumbnail: item.thumbnailURL,
    streamUrl: item.streamURL,
    category: item.category || "Uncategorized",
    date: item.createdAt,
  }));
};

export default getTVContentFeed;
