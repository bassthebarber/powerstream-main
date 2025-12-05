import Story from "../models/Story.js";

// POST /api/stories
export async function createStory(req, res) {
  try {
    const userId = req.user?.id;
    const { mediaUrl, mediaType, caption } = req.body || {};

    if (!userId) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }
    if (!mediaUrl || !mediaUrl.trim()) {
      return res.status(400).json({ ok: false, message: "mediaUrl is required" });
    }

    const story = await Story.create({
      userId,
      mediaUrl: mediaUrl.trim(),
      mediaType: mediaType || "image",
      caption: caption || "",
    });

    return res.status(201).json({ ok: true, story });
  } catch (err) {
    console.error("Error creating story:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to create story" });
  }
}

// GET /api/stories
// Return stories from last 24 hours
export async function listStories(req, res) {
  try {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const stories = await Story.find({ createdAt: { $gte: cutoff } })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ ok: true, stories });
  } catch (err) {
    console.error("Error listing stories:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to fetch stories" });
  }
}



