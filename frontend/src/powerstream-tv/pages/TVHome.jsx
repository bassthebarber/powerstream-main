// frontend/src/powerstream-tv/pages/TVHome.jsx
// PowerStream TV Home Page

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/TVHome.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

export default function TVHome() {
  const navigate = useNavigate();
  const [films, setFilms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [filmsRes, categoriesRes, trendingRes] = await Promise.all([
        fetch(`${API_BASE}/api/powerstream/films`),
        fetch(`${API_BASE}/api/powerstream/categories`),
        fetch(`${API_BASE}/api/powerstream/trending`),
      ]);

      const filmsData = await filmsRes.json();
      const categoriesData = await categoriesRes.json();
      const trendingData = await trendingRes.json();

      if (filmsData.ok || filmsData.success) setFilms(filmsData.films || []);
      if (categoriesData.ok || categoriesData.success) setCategories(categoriesData.categories || []);
      if (trendingData.ok || trendingData.success) setTrending(trendingData.films || []);
    } catch (err) {
      console.error("[TVHome] Error:", err);
      setError("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleFilmClick = (film) => {
    navigate(`/powerstream/watch/${film._id}`);
  };

  const filteredFilms = selectedCategory === "all"
    ? films
    : films.filter(f => f.category === selectedCategory);

  // Group films by category for Netflix-style rows
  const filmsByCategory = films.reduce((acc, film) => {
    const cat = film.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(film);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="tv-wrapper">
        <div className="tv-loading">
          <div className="spinner"></div>
          <p>Loading PowerStream TV...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tv-wrapper">
      {/* Header */}
      <header className="tv-header">
        <h1 className="tv-logo">PowerStream TV</h1>
        <nav className="tv-nav">
          <button 
            className={selectedCategory === "all" ? "active" : ""}
            onClick={() => setSelectedCategory("all")}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={selectedCategory === cat ? "active" : ""}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </nav>
      </header>

      {error && <div className="tv-error">{error}</div>}

      {/* Hero Banner - Featured Film */}
      {trending.length > 0 && (
        <section className="tv-hero" onClick={() => handleFilmClick(trending[0])}>
          <div 
            className="hero-bg"
            style={{ backgroundImage: `url(${trending[0].posterUrl || trending[0].thumbnailUrl})` }}
          />
          <div className="hero-gradient" />
          <div className="hero-content">
            <h2>{trending[0].title}</h2>
            <p>{trending[0].description}</p>
            <div className="hero-meta">
              {trending[0].genre && <span className="genre-tag">{trending[0].genre}</span>}
              {trending[0].category && <span className="category-tag">{trending[0].category}</span>}
            </div>
            <button className="play-btn">▶ Play Now</button>
          </div>
        </section>
      )}

      {/* Trending Row */}
      {trending.length > 0 && (
        <section className="tv-section">
          <h2 className="section-title">🔥 Trending Now</h2>
          <div className="tv-row">
            {trending.map(film => (
              <div 
                key={film._id} 
                className="tv-card"
                onClick={() => handleFilmClick(film)}
              >
                <img 
                  src={film.posterUrl || film.thumbnailUrl || "/placeholder-poster.jpg"} 
                  alt={film.title} 
                  className="poster" 
                />
                <div className="tv-info">
                  <h3>{film.title}</h3>
                  <p>{film.genre}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Category Rows */}
      {selectedCategory === "all" ? (
        Object.entries(filmsByCategory).map(([category, categoryFilms]) => (
          <section key={category} className="tv-section">
            <h2 className="section-title">{category}</h2>
            <div className="tv-row">
              {categoryFilms.map(film => (
                <div 
                  key={film._id} 
                  className="tv-card"
                  onClick={() => handleFilmClick(film)}
                >
                  <img 
                    src={film.posterUrl || film.thumbnailUrl || "/placeholder-poster.jpg"} 
                    alt={film.title} 
                    className="poster" 
                  />
                  <div className="tv-info">
                    <h3>{film.title}</h3>
                    <p>{film.genre}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      ) : (
        <section className="tv-section">
          <h2 className="section-title">{selectedCategory}</h2>
          {filteredFilms.length === 0 ? (
            <div className="tv-empty">
              <span>📺</span>
              <p>No films in this category yet</p>
            </div>
          ) : (
            <div className="tv-grid">
              {filteredFilms.map(film => (
                <div 
                  key={film._id} 
                  className="tv-card"
                  onClick={() => handleFilmClick(film)}
                >
                  <img 
                    src={film.posterUrl || film.thumbnailUrl || "/placeholder-poster.jpg"} 
                    alt={film.title} 
                    className="poster" 
                  />
                  <div className="tv-info">
                    <h3>{film.title}</h3>
                    <p>{film.genre}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

