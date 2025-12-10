// frontend/src/powerstream-tv/pages/TVWatch.jsx
// PowerStream TV Watch Page

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/TVWatch.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

export default function TVWatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFilm();
  }, [id]);

  const loadFilm = async () => {
    try {
      setLoading(true);
      setError("");

      // Increment view count
      fetch(`${API_BASE}/api/powerstream/film/${id}/view`, { method: "POST" });

      const res = await fetch(`${API_BASE}/api/powerstream/film/${id}`);
      const data = await res.json();

      if ((data.ok || data.success) && data.film) {
        setFilm(data.film);
      } else {
        setError(data.error || "Film not found");
      }
    } catch (err) {
      console.error("[TVWatch] Error:", err);
      setError("Failed to load film");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="tv-watch-wrapper">
        <div className="tv-watch-loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !film) {
    return (
      <div className="tv-watch-wrapper">
        <div className="tv-watch-error">
          <h2>⚠️ {error || "Film not found"}</h2>
          <button onClick={() => navigate("/powerstream")}>← Back to TV</button>
        </div>
      </div>
    );
  }

  const videoUrl = film.filmUrl || film.videoUrl || film.url;

  return (
    <div className="tv-watch-wrapper">
      <button className="back-btn" onClick={() => navigate("/powerstream")}>
        ← Back
      </button>

      <div className="video-container">
        {videoUrl ? (
          <video
            controls
            autoPlay
            poster={film.posterUrl || film.thumbnailUrl}
            className="video-player"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="no-video">
            <span>🎬</span>
            <p>Video not available</p>
          </div>
        )}
      </div>

      <div className="film-details">
        <h1>{film.title}</h1>
        <div className="film-meta">
          {film.genre && <span className="genre-tag">{film.genre}</span>}
          {film.category && <span className="category-tag">{film.category}</span>}
          {film.views > 0 && <span className="views">{film.views} views</span>}
        </div>
        {film.description && <p className="description">{film.description}</p>}
      </div>
    </div>
  );
}

