// backend/controllers/powerStreamTVController.js
import Film from "../models/Film.js";

export async function getTitles(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { category, genre, search } = req.query;

    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (genre) filter.genre = genre;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const titles = await Film.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      ok: true,
      titles,
      page,
      hasMore: titles.length === limit,
    });
  } catch (err) {
    console.error("Error fetching titles:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch titles" });
  }
}

export async function getTitleById(req, res) {
  try {
    const { id } = req.params;
    const title = await Film.findById(id).lean();

    if (!title) {
      return res.status(404).json({ ok: false, message: "Title not found" });
    }

    res.json({ ok: true, title });
  } catch (err) {
    console.error("Error fetching title:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch title" });
  }
}

export async function createTitle(req, res) {
  try {
    const {
      title,
      description,
      posterUrl,
      bannerUrl,
      category,
      genre,
      tags,
      duration,
      videoUrl,
      hlsUrl,
      trailerUrl,
      ownerId,
      type,
      monetization,
    } = req.body;

    if (!title || !ownerId) {
      return res.status(400).json({ ok: false, message: "title and ownerId required" });
    }

    const film = await Film.create({
      title,
      description,
      posterUrl,
      bannerUrl,
      category,
      genre: genre || [],
      tags: tags || [],
      duration,
      videoUrl,
      hlsUrl,
      trailerUrl,
      ownerId,
      type: type || "film",
      monetization: monetization || { type: "free", priceCoins: 0, priceUSD: 0 },
    });

    res.status(201).json({ ok: true, film });
  } catch (err) {
    console.error("Error creating title:", err);
    res.status(500).json({ ok: false, message: "Failed to create title" });
  }
}

export async function unlockTitle(req, res) {
  try {
    const { id } = req.params;
    const { userId, paymentMethod, paymentData } = req.body;

    if (!userId) {
      return res.status(400).json({ ok: false, message: "userId required" });
    }

    const film = await Film.findById(id);
    if (!film) {
      return res.status(404).json({ ok: false, message: "Title not found" });
    }

    // TODO: Integrate with existing monetization system (coins, Stripe, PayPal)
    // For now, just return success if free
    if (film.monetization.type === "free") {
      return res.json({ ok: true, unlocked: true, film });
    }

    // TODO: Process payment and grant access
    res.json({ ok: true, unlocked: true, film, message: "Payment processed" });
  } catch (err) {
    console.error("Error unlocking title:", err);
    res.status(500).json({ ok: false, message: "Failed to unlock title" });
  }
}






