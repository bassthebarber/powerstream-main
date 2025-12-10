// backend/controllers/powerFeedController.js
import SocialPost from "../models/SocialPost.js";

export async function getPosts(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await SocialPost.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      ok: true,
      posts,
      page,
      hasMore: posts.length === limit,
    });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch posts" });
  }
}

export async function createPost(req, res) {
  try {
    // Use authenticated user from middleware, fallback to body for backwards compatibility
    const userId = req.user?.id || req.body.userId;
    const username = req.user?.name || req.body.username || "guest";

    if (!userId) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const { text, mediaUrl, mediaType } = req.body;

    const post = await SocialPost.create({
      userId: String(userId),
      username,
      text: text || "",
      mediaUrl: mediaUrl || "",
      mediaType: mediaType || "none",
      likes: [],
      comments: [],
    });

    res.status(201).json({ ok: true, post });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ ok: false, message: "Failed to create post" });
  }
}

export async function reactToPost(req, res) {
  try {
    const { id } = req.params;
    // Use authenticated user from middleware
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const post = await SocialPost.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, message: "Post not found" });
    }

    const userIdStr = String(userId);
    const liked = post.likes.some(likeId => String(likeId) === userIdStr);
    
    if (liked) {
      post.likes = post.likes.filter((likeId) => String(likeId) !== userIdStr);
    } else {
      post.likes.push(userIdStr);
    }

    await post.save();
    res.json({ ok: true, post, liked: !liked, likesCount: post.likes.length });
  } catch (err) {
    console.error("Error reacting to post:", err);
    res.status(500).json({ ok: false, message: "Failed to react to post" });
  }
}

export async function commentOnPost(req, res) {
  try {
    const { id } = req.params;
    const { text } = req.body;
    // Use authenticated user from middleware
    const userId = req.user?.id || req.body.userId;
    const authorName = req.user?.name || req.body.username || "Guest";

    if (!userId) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ ok: false, message: "Comment text is required" });
    }

    const post = await SocialPost.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, message: "Post not found" });
    }

    post.comments.push({ 
      userId: String(userId), 
      text: text.trim(),
      authorName,
      createdAt: new Date(),
    });
    await post.save();

    res.json({ ok: true, post, comments: post.comments });
  } catch (err) {
    console.error("Error commenting on post:", err);
    res.status(500).json({ ok: false, message: "Failed to comment on post" });
  }
}





