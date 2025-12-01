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
    const { userId, username, videoUrl, hlsUrl, caption, soundReference, tags } = req.body;

    if (!userId || !videoUrl) {
      return res.status(400).json({ ok: false, message: "userId and videoUrl required" });
    }

    const reel = await Reel.create({
      userId,
      username: username || "guest",
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
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ ok: false, message: "userId required" });
    }

    const reel = await Reel.findById(id);
    if (!reel) {
      return res.status(404).json({ ok: false, message: "Reel not found" });
    }

    const liked = reel.likes.includes(userId);
    if (liked) {
      reel.likes = reel.likes.filter((id) => id !== userId);
    } else {
      reel.likes.push(userId);
    }

    await reel.save();
    res.json({ ok: true, reel, liked: !liked });
  } catch (err) {
    console.error("Error liking reel:", err);
    res.status(500).json({ ok: false, message: "Failed to like reel" });
  }
}

export async function commentOnReel(req, res) {
  try {
    const { id } = req.params;
    const { userId, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ ok: false, message: "userId and text required" });
    }

    const reel = await Reel.findById(id);
    if (!reel) {
      return res.status(404).json({ ok: false, message: "Reel not found" });
    }

    reel.comments.push({ userId, text });
    await reel.save();

    res.json({ ok: true, reel });
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


