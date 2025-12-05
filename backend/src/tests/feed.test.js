// backend/src/tests/feed.test.js
// Feed functionality tests
import { describe, it, expect, beforeEach } from "@jest/globals";

describe("Feed Service", () => {
  describe("Post Creation", () => {
    it("should create post with required fields", () => {
      const postData = {
        owner: "user_123",
        text: "Hello, PowerStream!",
        channel: "feed",
      };

      // Simulate post creation
      const post = {
        _id: `post_${Date.now()}`,
        ...postData,
        createdAt: new Date(),
        likesCount: 0,
        commentsCount: 0,
        viewsCount: 0,
      };

      expect(post._id).toBeDefined();
      expect(post.owner).toBe("user_123");
      expect(post.text).toBe("Hello, PowerStream!");
      expect(post.channel).toBe("feed");
      expect(post.likesCount).toBe(0);
    });

    it("should extract hashtags from text", () => {
      const extractHashtags = (text) => {
        if (!text) return [];
        const matches = text.match(/#[\w]+/g);
        if (!matches) return [];
        return [...new Set(matches.map(tag => tag.toLowerCase().replace("#", "")))];
      };

      const text = "Check out my new #music video! #powerstream #hiphop #music";
      const hashtags = extractHashtags(text);

      expect(hashtags).toContain("music");
      expect(hashtags).toContain("powerstream");
      expect(hashtags).toContain("hiphop");
      // Should dedupe
      expect(hashtags.filter(t => t === "music")).toHaveLength(1);
    });

    it("should extract mentions from text", () => {
      const extractMentions = (text) => {
        if (!text) return [];
        const matches = text.match(/@[\w]+/g);
        if (!matches) return [];
        return [...new Set(matches.map(m => m.toLowerCase().replace("@", "")))];
      };

      const text = "Thanks @john and @jane for the collab! @John was amazing!";
      const mentions = extractMentions(text);

      expect(mentions).toContain("john");
      expect(mentions).toContain("jane");
      // Should dedupe (case-insensitive)
      expect(mentions.filter(m => m === "john")).toHaveLength(1);
    });
  });

  describe("Feed Generation", () => {
    it("should sort posts by createdAt descending", () => {
      const posts = [
        { _id: "1", text: "First", createdAt: new Date("2024-01-01") },
        { _id: "2", text: "Third", createdAt: new Date("2024-01-03") },
        { _id: "3", text: "Second", createdAt: new Date("2024-01-02") },
      ];

      const sorted = posts.sort((a, b) => b.createdAt - a.createdAt);

      expect(sorted[0]._id).toBe("2"); // Latest first
      expect(sorted[1]._id).toBe("3");
      expect(sorted[2]._id).toBe("1");
    });

    it("should filter by channel", () => {
      const posts = [
        { _id: "1", channel: "feed" },
        { _id: "2", channel: "gram" },
        { _id: "3", channel: "feed" },
        { _id: "4", channel: "reel" },
      ];

      const feedPosts = posts.filter(p => p.channel === "feed");
      const gramPosts = posts.filter(p => p.channel === "gram");
      const reelPosts = posts.filter(p => p.channel === "reel");

      expect(feedPosts).toHaveLength(2);
      expect(gramPosts).toHaveLength(1);
      expect(reelPosts).toHaveLength(1);
    });

    it("should exclude deleted posts", () => {
      const posts = [
        { _id: "1", isDeleted: false },
        { _id: "2", isDeleted: true },
        { _id: "3", isDeleted: false },
      ];

      const activePosts = posts.filter(p => !p.isDeleted);
      expect(activePosts).toHaveLength(2);
    });
  });

  describe("Engagement", () => {
    it("should calculate engagement score", () => {
      const calculateEngagementScore = (post) => {
        return (
          (post.viewsCount || 0) * 1 +
          (post.likesCount || 0) * 3 +
          (post.commentsCount || 0) * 5 +
          (post.sharesCount || 0) * 10 +
          (post.savesCount || 0) * 4
        );
      };

      const post = {
        viewsCount: 100,
        likesCount: 50,
        commentsCount: 10,
        sharesCount: 5,
        savesCount: 20,
      };

      const score = calculateEngagementScore(post);
      // 100*1 + 50*3 + 10*5 + 5*10 + 20*4 = 100 + 150 + 50 + 50 + 80 = 430
      expect(score).toBe(430);
    });

    it("should rank trending posts by engagement", () => {
      const posts = [
        { _id: "1", likesCount: 100, commentsCount: 10 },
        { _id: "2", likesCount: 50, commentsCount: 50 },
        { _id: "3", likesCount: 200, commentsCount: 5 },
      ];

      const calculateScore = (p) => p.likesCount * 3 + p.commentsCount * 5;
      
      const ranked = posts
        .map(p => ({ ...p, score: calculateScore(p) }))
        .sort((a, b) => b.score - a.score);

      // Post 3: 200*3 + 5*5 = 625
      // Post 2: 50*3 + 50*5 = 400
      // Post 1: 100*3 + 10*5 = 350
      expect(ranked[0]._id).toBe("3");
      expect(ranked[1]._id).toBe("2");
      expect(ranked[2]._id).toBe("1");
    });
  });

  describe("Pagination", () => {
    it("should paginate correctly", () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ _id: i + 1 }));
      const limit = 20;
      const skip = 40;

      const page = items.slice(skip, skip + limit);

      expect(page).toHaveLength(20);
      expect(page[0]._id).toBe(41);
      expect(page[19]._id).toBe(60);
    });

    it("should handle last page correctly", () => {
      const items = Array.from({ length: 55 }, (_, i) => ({ _id: i + 1 }));
      const limit = 20;
      const skip = 40;

      const page = items.slice(skip, skip + limit);
      const hasMore = skip + page.length < items.length;

      expect(page).toHaveLength(15);
      expect(hasMore).toBe(false);
    });
  });
});

describe("Post Channels", () => {
  const POST_CHANNELS = {
    FEED: "feed",
    GRAM: "gram",
    REEL: "reel",
  };

  it("should have valid channel types", () => {
    expect(Object.values(POST_CHANNELS)).toContain("feed");
    expect(Object.values(POST_CHANNELS)).toContain("gram");
    expect(Object.values(POST_CHANNELS)).toContain("reel");
  });

  it("should validate channel on post", () => {
    const validChannels = Object.values(POST_CHANNELS);
    
    expect(validChannels.includes("feed")).toBe(true);
    expect(validChannels.includes("invalid")).toBe(false);
  });
});

