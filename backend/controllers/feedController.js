// backend/controllers/feedController.js
// DEPRECATED: This controller is part of the LEGACY architecture.
// Runtime traffic is being migrated to /backend/src/api/controllers/feed.controller.js
// Do NOT add new features here.
import { Post as FeedPost } from "../src/domain/models/index.js";

// GET /api/feed
// List posts (newest first)
export async function getFeed(req, res) {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const posts = await FeedPost.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json({ ok: true, posts });
  } catch (err) {
    console.error("Error fetching feed:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to fetch feed" });
  }
}

// POST /api/feed
// Create a post (text + optional image/media URL)
export async function createPost(req, res) {
  try {
    const userId = req.user?.id;
    const { authorName, content, image, mediaUrl, mediaType } = req.body || {};

    if (!content && !image && !mediaUrl) {
      return res
        .status(400)
        .json({ ok: false, message: "content or media is required" });
    }

    const post = await FeedPost.create({
      userId: userId || null, // Store creator's user ID for tipping
      authorName: authorName || req.user?.name || "Guest",
      content: content || "",
      image: image || "",
      mediaUrl: mediaUrl || image || "",
      mediaType: mediaType || "",
    });

    return res.status(201).json({ ok: true, post });
  } catch (err) {
    console.error("Error creating feed post:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to create post" });
  }
}

// POST /api/feed/:id/like
// Toggle like for current user
export async function toggleLike(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const existing = await FeedPost.findOne({ _id: id, likes: userId }).lean();

    let liked;
    if (existing) {
      // Already liked → remove like
      await FeedPost.updateOne({ _id: id }, { $pull: { likes: userId } });
      liked = false;
    } else {
      // Not liked → add like
      await FeedPost.updateOne({ _id: id }, { $addToSet: { likes: userId } });
      liked = true;
    }

    const updated = await FeedPost.findById(id).select("likes").lean();
    const likesCount = Array.isArray(updated?.likes) ? updated.likes.length : 0;

    return res.json({ ok: true, liked, likesCount });
  } catch (err) {
    console.error("Error toggling like:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to toggle like" });
  }
}

// GET /api/feed/:id/comments
export async function getComments(req, res) {
  try {
    const { id } = req.params;
    const post = await FeedPost.findById(id).select("comments").lean();
    if (!post) {
      return res.status(404).json({ ok: false, message: "Post not found" });
    }
    const comments = Array.isArray(post.comments) ? post.comments : [];
    return res.json({ ok: true, comments });
  } catch (err) {
    console.error("Error fetching comments:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to fetch comments" });
  }
}

// POST /api/feed/:id/comments
export async function addComment(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { text } = req.body || {};

    if (!userId) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ ok: false, message: "Comment text is required" });
    }

    const authorName = req.user.name || req.user.email || "User";
    const comment = {
      userId,
      authorName,
      text: text.trim(),
      createdAt: new Date(),
    };

    await FeedPost.updateOne(
      { _id: id },
      {
        $push: { comments: comment },
        $inc: { commentsCount: 1 },
      }
    );

    return res.status(201).json({ ok: true, comment });
  } catch (err) {
    console.error("Error adding comment:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to add comment" });
  }
}
