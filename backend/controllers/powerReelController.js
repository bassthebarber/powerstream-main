// backend/controllers/powerReelController.js
import Reel from "../models/Reel.js";

export async function getReels(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const reels = await Reel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      ok: true,
      reels,
      page,
      hasMore: reels.length === limit,
    });
  } catch (err) {
    console.error("Error fetching reels:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch reels" });
  }
}

export async function createReel(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const { videoUrl, hlsUrl, caption, soundReference, tags } = req.body;
    const username = req.body.username || req.user?.name || req.user?.username || "Guest";

    if (!videoUrl) {
      return res.status(400).json({ ok: false, message: "videoUrl is required" });
    }

    const reel = await Reel.create({
      userId: String(userId),
      username,
      videoUrl,
      hlsUrl: hlsUrl || "",
      caption: caption || "",
      soundReference: soundReference || "",
      tags: tags || [],
    });

    res.status(201).json({ ok: true, reel });
  } catch (err) {
    console.error("Error creating reel:", err);
    res.status(500).json({ ok: false, message: "Failed to create reel" });
  }
}

export async function likeReel(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const existing = await Reel.findOne({ _id: id, likes: userId }).lean();

    let liked;
    if (existing) {
      // Already liked → remove like
      await Reel.updateOne({ _id: id }, { $pull: { likes: userId } });
      liked = false;
    } else {
      // Not liked → add like
      await Reel.updateOne({ _id: id }, { $addToSet: { likes: userId } });
      liked = true;
    }

    const updated = await Reel.findById(id).select("likes").lean();
    const likesCount = Array.isArray(updated?.likes) ? updated.likes.length : 0;

    return res.json({ ok: true, liked, likesCount });
  } catch (err) {
    console.error("Error liking reel:", err);
    res.status(500).json({ ok: false, message: "Failed to like reel" });
  }
}

export async function getReelComments(req, res) {
  try {
    const { id } = req.params;
    const reel = await Reel.findById(id).select("comments").lean();
    if (!reel) {
      return res.status(404).json({ ok: false, message: "Reel not found" });
    }
    const comments = Array.isArray(reel.comments) ? reel.comments : [];
    return res.json({ ok: true, comments });
  } catch (err) {
    console.error("Error fetching reel comments:", err);
    return res.status(500).json({ ok: false, message: "Failed to fetch comments" });
  }
}

export async function commentOnReel(req, res) {
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

    const reel = await Reel.findById(id);
    if (!reel) {
      return res.status(404).json({ ok: false, message: "Reel not found" });
    }

    reel.comments.push({
      userId: String(userId),
      text: text.trim(),
      authorName,
    });
    await reel.save();

    const updated = await Reel.findById(id).select("comments").lean();
    const comments = Array.isArray(updated?.comments) ? updated.comments : [];

    return res.json({ ok: true, comments });
  } catch (err) {
    console.error("Error commenting on reel:", err);
    res.status(500).json({ ok: false, message: "Failed to comment on reel" });
  }
}

export async function incrementView(req, res) {
  try {
    const { id } = req.params;
    const reel = await Reel.findById(id);
    if (!reel) {
      return res.status(404).json({ ok: false, message: "Reel not found" });
    }
    reel.views += 1;
    await reel.save();
    res.json({ ok: true, views: reel.views });
  } catch (err) {
    console.error("Error incrementing view:", err);
    res.status(500).json({ ok: false, message: "Failed to increment view" });
  }
}



