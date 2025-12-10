// frontend/src/components/tv/stations/NoLimitForeverTV/NLFFilmWatchPage.jsx
// No Limit Forever TV - Film Watch Page

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./NoLimitForeverTV.css";

// Force localhost in development to avoid CORS issues with production API
const API_BASE = import.meta.env.MODE === "development" 
  ? "http://localhost:5001" 
  : (import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001");

export default function NLFFilmWatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  const [film, setFilm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (id) {
      loadFilm();
    }
  }, [id]);

  async function loadFilm() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/nlf/films/${id}`);
      const json = await res.json();
      
      if (!json.success) throw new Error(json.error || "Failed to load film");
      setFilm(json.film);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRate(rating) {
    try {
      const res = await fetch(`${API_BASE}/api/nlf/films/${id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      const json = await res.json();
      
      if (json.success) {
        setUserRating(rating);
        setFilm(prev => ({
          ...prev,
          rating: json.rating,
          ratingCount: json.ratingCount,
        }));
      }
    } catch (err) {
      console.error("Rating failed:", err);
    }
  }

  const handleBack = () => {
    navigate("/network/no-limit-forever");
  };

  if (loading) {
    return (
      <div className="nlf-watch-page loading">
        <div className="nlf-spinner" />
        <span>Loading film…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nlf-watch-page error">
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <h2>Error Loading Film</h2>
          <p>{error}</p>
          <button onClick={handleBack}>← Back to Catalog</button>
        </div>
      </div>
    );
  }

  if (!film) {
    return (
      <div className="nlf-watch-page error">
        <div className="error-content">
          <span className="error-icon">🎬</span>
          <h2>Film Not Found</h2>
          <button onClick={handleBack}>← Back to Catalog</button>
        </div>
      </div>
    );
  }

  return (
    <div className="nlf-watch-page">
      {/* Back Button */}
      <button className="nlf-back-btn" onClick={handleBack}>
        ← Back to No Limit Forever TV
      </button>

      {/* Video Player */}
      <div className="nlf-watch-video">
        <video
          ref={videoRef}
          src={film.filmUrl}
          controls
          autoPlay
          poster={film.backdropUrl || film.posterUrl}
        />
      </div>

      {/* Film Details */}
      <div className="nlf-watch-details">
        <div className="nlf-watch-header">
          <div className="nlf-watch-title-section">
            <h1>{film.title}</h1>
            <div className="nlf-watch-meta">
              <span className="category">{film.category?.replace("_", " ").toUpperCase()}</span>
              {film.year && <span className="year">{film.year}</span>}
              {film.runtimeMinutes > 0 && (
                <span className="runtime">
                  {Math.floor(film.runtimeMinutes / 60)}h {film.runtimeMinutes % 60}m
                </span>
              )}
              <span className="views">👁 {film.views?.toLocaleString()} views</span>
            </div>
          </div>

          {/* Rating */}
          <div className="nlf-watch-rating">
            <div className="rating-display">
              <span className="rating-value">⭐ {film.rating?.toFixed(1) || "—"}</span>
              <span className="rating-count">({film.ratingCount || 0} ratings)</span>
            </div>
            <div className="rating-input">
              <span className="rate-label">Rate:</span>
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`star ${star <= (hoverRating || userRating) ? "filled" : ""}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRate(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        {film.description && (
          <div className="nlf-watch-description">
            <p>{film.description}</p>
          </div>
        )}

        {/* Credits */}
        <div className="nlf-watch-credits">
          {film.director && (
            <div className="credit">
              <span className="credit-label">Director:</span>
              <span className="credit-value">{film.director}</span>
            </div>
          )}
          {film.cast && film.cast.length > 0 && (
            <div className="credit">
              <span className="credit-label">Cast:</span>
              <span className="credit-value">{film.cast.join(", ")}</span>
            </div>
          )}
          {film.producer && (
            <div className="credit">
              <span className="credit-label">Producer:</span>
              <span className="credit-value">{film.producer}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {film.tags && film.tags.length > 0 && (
          <div className="nlf-watch-tags">
            {film.tags.map((tag, idx) => (
              <span key={idx} className="tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

