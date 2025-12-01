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
    const { userId, username, imageUrl, caption, tags } = req.body;

    if (!userId || !imageUrl) {
      return res.status(400).json({ ok: false, message: "userId and imageUrl required" });
    }

    const gram = await GramPost.create({
      userId,
      username: username || "guest",
      imageUrl,
      caption: caption || "",
      tags: tags || [],
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
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ ok: false, message: "userId required" });
    }

    const gram = await GramPost.findById(id);
    if (!gram) {
      return res.status(404).json({ ok: false, message: "Gram not found" });
    }

    const liked = gram.likes.includes(userId);
    if (liked) {
      gram.likes = gram.likes.filter((id) => id !== userId);
    } else {
      gram.likes.push(userId);
    }

    await gram.save();
    res.json({ ok: true, gram, liked: !liked });
  } catch (err) {
    console.error("Error liking gram:", err);
    res.status(500).json({ ok: false, message: "Failed to like gram" });
  }
}

export async function commentOnGram(req, res) {
  try {
    const { id } = req.params;
    const { userId, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ ok: false, message: "userId and text required" });
    }

    const gram = await GramPost.findById(id);
    if (!gram) {
      return res.status(404).json({ ok: false, message: "Gram not found" });
    }

    gram.comments.push({ userId, text });
    await gram.save();

    res.json({ ok: true, gram });
  } catch (err) {
    console.error("Error commenting on gram:", err);
    res.status(500).json({ ok: false, message: "Failed to comment on gram" });
  }
}
