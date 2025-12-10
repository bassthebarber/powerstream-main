import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import { useNavigate } from "react-router-dom";
import "./netflix.css";

export default function NetflixHome() {
  const [featured, setFeatured] = useState(null);
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/movies/featured").then((r) => setFeatured(r.data)).catch(() => {});
    api.get("/movies").then((r) => setMovies(r.data || [])).catch(() => {});
  }, []);

  return (
    <div className="netflix-container">
      {featured && (
        <div className="featured-banner" style={{ backgroundImage: `url(${featured.thumbnail})` }}>
          <div className="featured-overlay" />
          <div className="featured-info">
            <h1>{featured.title}</h1>
            <p>{featured.description}</p>
            <button 
              className="watch-btn"
              onClick={() => navigate(`/tv/movie/${featured._id}`)}
            >
              ▶ Watch Now
            </button>
          </div>
        </div>
      )}

      {!featured && (
        <div className="featured-banner featured-placeholder">
          <div className="featured-info">
            <h1>PowerStream TV</h1>
            <p>Stream movies, shows, and exclusive content from the Southern Power Syndicate.</p>
            <button 
              className="watch-btn"
              onClick={() => navigate("/tv/upload")}
            >
              🎬 Upload First Movie
            </button>
          </div>
        </div>
      )}

      <div className="tv-header-actions">
        <button 
          className="upload-nav-btn"
          onClick={() => navigate("/tv/upload")}
        >
          ⬆ Upload Movie
        </button>
      </div>

      <h2 className="section-title">🎬 New Releases</h2>
      <div className="movie-row">
        {movies.length === 0 ? (
          <p className="empty-message">No movies yet. Upload your first movie!</p>
        ) : (
          movies.map((m) => (
            <div 
              key={m._id} 
              className="movie-card"
              onClick={() => navigate(`/tv/movie/${m._id}`)}
            >
              <img src={m.thumbnail} alt={m.title} />
              <p>{m.title}</p>
            </div>
          ))
        )}
      </div>

      <h2 className="section-title">🔥 Trending</h2>
      <div className="movie-row">
        {movies.filter(m => m.views > 0).slice(0, 10).map((m) => (
          <div 
            key={m._id} 
            className="movie-card"
            onClick={() => navigate(`/tv/movie/${m._id}`)}
          >
            <img src={m.thumbnail} alt={m.title} />
            <p>{m.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

