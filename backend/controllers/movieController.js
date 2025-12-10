import Movie from "../models/Movie.js";

export const uploadMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFeatured = async (req, res) => {
  try {
    const featured = await Movie.findOne({ featured: true }).sort({
      createdAt: -1,
    });
    res.json(featured);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: "Movie not found" });
  }
};


