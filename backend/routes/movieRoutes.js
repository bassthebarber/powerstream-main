import express from "express";
import Movie from "../models/Movie.js";
import MoviePurchase from "../models/MoviePurchase.js";

const router = express.Router();

// Create movie (used by UploadMovie.jsx)
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      genres = [],
      thumbnail,
      videoUrl,
      trailerUrl,
      featured = false,
      isPaid = false,
      price = 0,
    } = req.body;

    if (!title || !thumbnail || !videoUrl) {
      return res.status(400).json({
        ok: false,
        message: "title, thumbnail and videoUrl are required.",
      });
    }

    const movie = await Movie.create({
      title,
      description,
      category,
      genres,
      thumbnail,
      videoUrl,
      trailerUrl,
      featured,
      isPaid,
      price,
      owner: req.user?._id || null,
    });

    return res.status(201).json({ ok: true, movie });
  } catch (err) {
    console.error("[Movies] Create error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to create movie." });
  }
});

// All movies (optional ?category=Movies)
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { status: "published" };
    if (category && category !== "All") {
      filter.category = category;
    }
    const movies = await Movie.find(filter)
      .sort({ createdAt: -1 })
      .limit(200);
    return res.json({ ok: true, movies });
  } catch (err) {
    console.error("[Movies] List error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to load movies." });
  }
});

// Distinct categories
router.get("/categories", async (_req, res) => {
  try {
    const categories = await Movie.distinct("category", {
      status: "published",
    });
    return res.json({ ok: true, categories });
  } catch (err) {
    console.error("[Movies] Categories error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to load categories." });
  }
});

// Trending list (sorted by views + recency)
router.get("/trending", async (_req, res) => {
  try {
    const movies = await Movie.find({ status: "published" })
      .sort({ views: -1, createdAt: -1 })
      .limit(20);
    return res.json({ ok: true, movies });
  } catch (err) {
    console.error("[Movies] Trending error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to load trending titles." });
  }
});

// Featured movie
router.get("/featured", async (_req, res) => {
  try {
    const movie = await Movie.findOne({ featured: true, status: "published" })
      .sort({ createdAt: -1 });
    return res.json({ ok: true, movie });
  } catch (err) {
    console.error("[Movies] Featured error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to load featured movie." });
  }
});

// Single movie
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ ok: false, message: "Movie not found" });
    }
    return res.json({ ok: true, movie });
  } catch (err) {
    console.error("[Movies] Get error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to load movie." });
  }
});

// Increment views (for trending)
router.post("/:id/view", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    return res.json({ ok: true, movie });
  } catch (err) {
    console.error("[Movies] View error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to bump views." });
  }
});

// Simple like counter
router.post("/:id/like", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    return res.json({ ok: true, movie });
  } catch (err) {
    console.error("[Movies] Like error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to like title." });
  }
});

// Basic pay-per-view purchase (no real money yet)
router.post("/:id/purchase", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ ok: false, message: "Movie not found" });
    }

    let purchase = null;
    try {
      purchase = await MoviePurchase.create({
        user: req.user?._id || null,
        movie: movie._id,
        pricePaid: movie.price || 0,
        currency: "USD",
        paymentProvider: "demo",
        transactionId: `demo-${Date.now()}`,
      });
    } catch (err) {
      // if already exists, just load it
      purchase = await MoviePurchase.findOne({
        user: req.user?._id || null,
        movie: movie._id,
      });
    }

    return res.json({
      ok: true,
      message: "Ticket unlocked for this device (demo mode).",
      purchase,
    });
  } catch (err) {
    console.error("[Movies] Purchase error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to purchase movie." });
  }
});

// Delete a movie
router.delete("/:id", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ ok: false, message: "Movie not found" });
    }
    
    // Also delete any purchases for this movie
    await MoviePurchase.deleteMany({ movie: req.params.id });
    
    return res.json({ 
      ok: true, 
      message: "Movie deleted successfully",
      deletedMovie: { _id: movie._id, title: movie.title }
    });
  } catch (err) {
    console.error("[Movies] Delete error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to delete movie." });
  }
});

// Update a movie
router.patch("/:id", async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates._id; // Don't allow changing the ID
    
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    
    if (!movie) {
      return res.status(404).json({ ok: false, message: "Movie not found" });
    }
    
    return res.json({ ok: true, movie });
  } catch (err) {
    console.error("[Movies] Update error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to update movie." });
  }
});

export default router;
