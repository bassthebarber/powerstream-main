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
    const { userId, username, text, mediaUrl, mediaType } = req.body;

    if (!userId) {
      return res.status(400).json({ ok: false, message: "userId required" });
    }

    const post = await SocialPost.create({
      userId,
      username: username || "guest",
      text: text || "",
      mediaUrl: mediaUrl || "",
      mediaType: mediaType || "none",
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
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ ok: false, message: "userId required" });
    }

    const post = await SocialPost.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, message: "Post not found" });
    }

    const liked = post.likes.includes(userId);
    if (liked) {
      post.likes = post.likes.filter((id) => id !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ ok: true, post, liked: !liked });
  } catch (err) {
    console.error("Error reacting to post:", err);
    res.status(500).json({ ok: false, message: "Failed to react to post" });
  }
}

export async function commentOnPost(req, res) {
  try {
    const { id } = req.params;
    const { userId, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ ok: false, message: "userId and text required" });
    }

    const post = await SocialPost.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, message: "Post not found" });
    }

    post.comments.push({ userId, text });
    await post.save();

    res.json({ ok: true, post });
  } catch (err) {
    console.error("Error commenting on post:", err);
    res.status(500).json({ ok: false, message: "Failed to comment on post" });
  }
}




