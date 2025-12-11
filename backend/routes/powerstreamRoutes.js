// backend/routes/powerstreamRoutes.js
// PowerStream Films API
import express from "express";
import Film from "../models/Film.js";

const router = express.Router();

// ============================================
// GET /api/powerstream/films
// Returns all films from the films collection
// ============================================
router.get("/films", async (req, res) => {
  try {
    const { page = 1, limit = 50, category, sort = "-createdAt" } = req.query;

    // Build filter
    const filter = { isPublished: true };
    if (category && category !== "all") {
      filter.category = category;
    }

    // Query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const films = await Film.find(filter)
      .select("title description videoUrl posterUrl duration createdAt category genre tags views")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Map to standard response format
    const mappedFilms = films.map(film => ({
      _id: film._id,
      title: film.title,
      description: film.description,
      url: film.videoUrl,
      thumbnail: film.posterUrl,
      duration: film.duration || 0,
      createdAt: film.createdAt,
      category: film.category,
      genre: film.genre,
      tags: film.tags,
      views: film.views,
    }));

    // Get total count for pagination
    const total = await Film.countDocuments(filter);

    return res.json({
      ok: true,
      films: mappedFilms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("[PowerStream] Films error:", err.message);
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
});

// ============================================
// GET /api/powerstream/films/:id
// Returns a single film by ID
// ============================================
router.get("/films/:id", async (req, res) => {
  try {
    const film = await Film.findById(req.params.id).lean();

    if (!film) {
      return res.status(404).json({
        ok: false,
        error: "Film not found",
      });
    }

    return res.json({
      ok: true,
      film: {
        _id: film._id,
        title: film.title,
        description: film.description,
        url: film.videoUrl,
        thumbnail: film.posterUrl,
        duration: film.duration || 0,
        createdAt: film.createdAt,
        category: film.category,
        genre: film.genre,
        tags: film.tags,
        views: film.views,
        trailerUrl: film.trailerUrl,
        monetization: film.monetization,
      },
    });
  } catch (err) {
    console.error("[PowerStream] Film error:", err.message);
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
});

// ============================================
// GET /api/powerstream/films/trending
// Returns trending films (sorted by views)
// ============================================
router.get("/trending", async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const films = await Film.find({ isPublished: true })
      .select("title description videoUrl posterUrl duration createdAt views")
      .sort({ views: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    const mappedFilms = films.map(film => ({
      _id: film._id,
      title: film.title,
      description: film.description,
      url: film.videoUrl,
      thumbnail: film.posterUrl,
      duration: film.duration || 0,
      createdAt: film.createdAt,
      views: film.views,
    }));

    return res.json({
      ok: true,
      films: mappedFilms,
    });
  } catch (err) {
    console.error("[PowerStream] Trending error:", err.message);
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
});

// ============================================
// GET /api/powerstream/categories
// Returns distinct categories
// ============================================
router.get("/categories", async (req, res) => {
  try {
    const categories = await Film.distinct("category", { isPublished: true });

    return res.json({
      ok: true,
      categories: categories.filter(Boolean),
    });
  } catch (err) {
    console.error("[PowerStream] Categories error:", err.message);
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
});

// ============================================
// POST /api/powerstream/films/:id/view
// Increment view count
// ============================================
router.post("/films/:id/view", async (req, res) => {
  try {
    const film = await Film.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!film) {
      return res.status(404).json({
        ok: false,
        error: "Film not found",
      });
    }

    return res.json({
      ok: true,
      views: film.views,
    });
  } catch (err) {
    console.error("[PowerStream] View error:", err.message);
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
});

export default router;


