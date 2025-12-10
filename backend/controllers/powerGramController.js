// backend/controllers/powerGramController.js
import GramPost from "../models/GramPost.js";

export async function getGrams(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const grams = await GramPost.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      ok: true,
      grams,
      page,
      hasMore: grams.length === limit,
    });
  } catch (err) {
    console.error("Error fetching grams:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch grams" });
  }
}

export async function createGram(req, res) {
  try {
    // Use authenticated user from middleware, fallback to body for backwards compatibility
    const userId = req.user?.id || req.body.userId;
    const username = req.user?.name || req.body.username || "guest";

    if (!userId) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const { imageUrl, mediaUrl, caption, tags, hashtags, location, mediaType } = req.body;
    
    // Accept either imageUrl or mediaUrl for flexibility
    const finalImageUrl = imageUrl || mediaUrl;
    
    if (!finalImageUrl) {
      return res.status(400).json({ ok: false, message: "imageUrl or mediaUrl is required" });
    }

    // Parse hashtags from string if provided
    let parsedTags = tags || [];
    if (typeof hashtags === "string" && hashtags.trim()) {
      parsedTags = hashtags.split(/\s+/).filter(t => t.startsWith("#")).map(t => t.replace("#", ""));
    }

    const gram = await GramPost.create({
      userId: String(userId),
      username,
      imageUrl: finalImageUrl,
      mediaUrl: finalImageUrl,
      mediaType: mediaType || "image",
      caption: caption || "",
      tags: parsedTags,
      location: location || "",
      likes: [],
      comments: [],
    });

    res.status(201).json({ ok: true, gram });
  } catch (err) {
    console.error("Error creating gram:", err);
    res.status(500).json({ ok: false, message: "Failed to create gram" });
  }
}

export async function likeGram(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const existing = await GramPost.findOne({ _id: id, likes: userId }).lean();

    let liked;
    if (existing) {
      // Already liked → remove like
      await GramPost.updateOne({ _id: id }, { $pull: { likes: userId } });
      liked = false;
    } else {
      // Not liked → add like
      await GramPost.updateOne({ _id: id }, { $addToSet: { likes: userId } });
      liked = true;
    }

    const updated = await GramPost.findById(id).select("likes").lean();
    const likesCount = Array.isArray(updated?.likes) ? updated.likes.length : 0;

    return res.json({ ok: true, liked, likesCount });
  } catch (err) {
    console.error("Error liking gram:", err);
    res.status(500).json({ ok: false, message: "Failed to like gram" });
  }
}

export async function getGramComments(req, res) {
  try {
    const { id } = req.params;
    const gram = await GramPost.findById(id).select("comments").lean();
    if (!gram) {
      return res.status(404).json({ ok: false, message: "Gram not found" });
    }
    const comments = Array.isArray(gram.comments) ? gram.comments : [];
    return res.json({ ok: true, comments });
  } catch (err) {
    console.error("Error fetching gram comments:", err);
    return res.status(500).json({ ok: false, message: "Failed to fetch comments" });
  }
}

export async function commentOnGram(req, res) {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user?.id;
    const authorName = req.user?.name || req.user?.username || "Guest";

    if (!userId) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ ok: false, message: "Comment text is required" });
    }

    const gram = await GramPost.findById(id);
    if (!gram) {
      return res.status(404).json({ ok: false, message: "Gram not found" });
    }

    gram.comments.push({
      userId: String(userId),
      text: text.trim(),
      authorName,
    });
    await gram.save();

    const updated = await GramPost.findById(id).select("comments").lean();
    const comments = Array.isArray(updated?.comments) ? updated.comments : [];

    return res.json({ ok: true, comments });
  } catch (err) {
    console.error("Error commenting on gram:", err);
    res.status(500).json({ ok: false, message: "Failed to comment on gram" });
  }
}
