// backend/routes/noLimitForeverFilmRoutes.js
// No Limit Forever TV - Films/Documentaries/Series API

import { Router } from "express";
import NoLimitForeverFilm from "../models/NoLimitForeverFilm.js";

const router = Router();

// Helper to enforce station scope
const STATION_SLUG = "no-limit-forever-tv";

// =====================================================
// POST /api/nlf/films - Create/upload film metadata
// =====================================================
router.post("/films", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      posterUrl,
      backdropUrl,
      trailerUrl,
      filmUrl,
      runtimeMinutes,
      releaseDate,
      year,
      season,
      episode,
      episodeTitle,
      director,
      cast,
      producer,
      tags,
      genres,
      status,
      isFeatured,
      isPremium,
      premiumPrice,
      qualities,
      subtitles,
    } = req.body;

    if (!title || !filmUrl) {
      return res.status(400).json({
        success: false,
        error: "title and filmUrl are required",
      });
    }

    const film = await NoLimitForeverFilm.create({
      title,
      description,
      category: category || "movie",
      posterUrl,
      backdropUrl,
      trailerUrl,
      filmUrl,
      runtimeMinutes: runtimeMinutes ? parseInt(runtimeMinutes) : 0,
      releaseDate,
      year: year || (releaseDate ? new Date(releaseDate).getFullYear() : null),
      season,
      episode,
      episodeTitle,
      director,
      cast: cast || [],
      producer,
      tags: tags || [],
      genres: genres || [],
      status: status || "published",
      isFeatured: isFeatured || false,
      isPremium: isPremium || false,
      premiumPrice,
      qualities: qualities || [],
      subtitles: subtitles || [],
      stationSlug: STATION_SLUG,
      createdBy: req.user?.id,
    });

    console.log(`[NLF Films] Created: "${title}" (${category || "movie"})`);

    res.json({ success: true, film });
  } catch (err) {
    console.error("[NLF Films] Create error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// GET /api/nlf/films - List films (optional category filter)
// =====================================================
router.get("/films", async (req, res) => {
  try {
    const { category, featured, status, search, limit = 50, skip = 0 } = req.query;
    const query = { stationSlug: STATION_SLUG };

    if (category && category !== "all") {
      query.category = category;
    }

    if (featured === "true") {
      query.isFeatured = true;
    }

    if (status) {
      query.status = status;
    } else {
      // Default to published only
      query.status = { $in: ["published", "featured"] };
    }

    if (search) {
      query.$text = { $search: search };
    }

    const films = await NoLimitForeverFilm.find(query)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();

    const total = await NoLimitForeverFilm.countDocuments(query);

    res.json({ 
      success: true, 
      films,
      total,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + films.length < total,
      },
    });
  } catch (err) {
    console.error("[NLF Films] List error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// GET /api/nlf/films/featured - Get featured films
// =====================================================
router.get("/films/featured", async (req, res) => {
  try {
    const films = await NoLimitForeverFilm.find({
      stationSlug: STATION_SLUG,
      isFeatured: true,
      status: { $in: ["published", "featured"] },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({ success: true, films });
  } catch (err) {
    console.error("[NLF Films] Featured error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// GET /api/nlf/films/popular - Get most viewed films
// =====================================================
router.get("/films/popular", async (req, res) => {
  try {
    const films = await NoLimitForeverFilm.find({
      stationSlug: STATION_SLUG,
      status: { $in: ["published", "featured"] },
    })
      .sort({ views: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, films });
  } catch (err) {
    console.error("[NLF Films] Popular error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// GET /api/nlf/films/:id - Get single film (increments views)
// =====================================================
router.get("/films/:id", async (req, res) => {
  try {
    const film = await NoLimitForeverFilm.findOneAndUpdate(
      { _id: req.params.id, stationSlug: STATION_SLUG },
      { $inc: { views: 1 } },
      { new: true }
    ).lean();

    if (!film) {
      return res.status(404).json({ success: false, error: "Film not found" });
    }

    res.json({ success: true, film });
  } catch (err) {
    console.error("[NLF Films] Get error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// PATCH /api/nlf/films/:id - Update film
// =====================================================
router.patch("/films/:id", async (req, res) => {
  try {
    const updates = req.body;
    
    // Don't allow changing stationSlug
    delete updates.stationSlug;

    const film = await NoLimitForeverFilm.findOneAndUpdate(
      { _id: req.params.id, stationSlug: STATION_SLUG },
      { $set: updates },
      { new: true }
    );

    if (!film) {
      return res.status(404).json({ success: false, error: "Film not found" });
    }

    console.log(`[NLF Films] Updated: "${film.title}"`);

    res.json({ success: true, film });
  } catch (err) {
    console.error("[NLF Films] Update error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// POST /api/nlf/films/:id/rate - Rate a film
// =====================================================
router.post("/films/:id/rate", async (req, res) => {
  try {
    const { rating } = req.body;

    if (rating === undefined || rating < 0 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        error: "rating must be between 0 and 5" 
      });
    }

    const film = await NoLimitForeverFilm.findOne({
      _id: req.params.id,
      stationSlug: STATION_SLUG,
    });

    if (!film) {
      return res.status(404).json({ success: false, error: "Film not found" });
    }

    const result = await film.addRating(rating);

    res.json({ 
      success: true, 
      rating: result.rating,
      ratingCount: result.ratingCount,
    });
  } catch (err) {
    console.error("[NLF Films] Rate error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// DELETE /api/nlf/films/:id - Delete film
// =====================================================
router.delete("/films/:id", async (req, res) => {
  try {
    const film = await NoLimitForeverFilm.findOneAndDelete({
      _id: req.params.id,
      stationSlug: STATION_SLUG,
    });

    if (!film) {
      return res.status(404).json({ success: false, error: "Film not found" });
    }

    console.log(`[NLF Films] Deleted: "${film.title}"`);

    res.json({ success: true });
  } catch (err) {
    console.error("[NLF Films] Delete error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// GET /api/nlf/films/category/:category - Get by category
// =====================================================
router.get("/category/:category", async (req, res) => {
  try {
    const films = await NoLimitForeverFilm.find({
      stationSlug: STATION_SLUG,
      category: req.params.category,
      status: { $in: ["published", "featured"] },
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, films, category: req.params.category });
  } catch (err) {
    console.error("[NLF Films] Category error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// GET /api/nlf/stats - Get station stats
// =====================================================
router.get("/stats", async (req, res) => {
  try {
    const totalFilms = await NoLimitForeverFilm.countDocuments({ stationSlug: STATION_SLUG });
    
    const byCategory = await NoLimitForeverFilm.aggregate([
      { $match: { stationSlug: STATION_SLUG } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const totalViews = await NoLimitForeverFilm.aggregate([
      { $match: { stationSlug: STATION_SLUG } },
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalFilms,
        totalViews: totalViews[0]?.total || 0,
        byCategory: byCategory.reduce((acc, c) => {
          acc[c._id] = c.count;
          return acc;
        }, {}),
      },
    });
  } catch (err) {
    console.error("[NLF Films] Stats error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;


