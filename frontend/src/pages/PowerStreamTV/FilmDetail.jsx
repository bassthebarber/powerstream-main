// frontend/src/pages/PowerStreamTV/FilmDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./powerstreamTV.css";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001/api";

export default function FilmDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFilm() {
      try {
        setLoading(true);
        setError("");
        
        // Fetch from /api/powerstream/films/:id
        const res = await fetch(`${API_BASE}/powerstream/films/${id}`);
        const json = await res.json();
        
        if (json.ok && json.film) {
          setFilm(json.film);
          
          // Increment view count
          fetch(`${API_BASE}/powerstream/films/${id}/view`, { method: "POST" })
            .catch(() => {}); // Fire and forget
        } else {
          throw new Error(json.error || "Film not found");
        }
      } catch (err) {
        console.error("[FilmDetail] error:", err);
        setError(err.message || "Unable to load film.");
      } finally {
        setLoading(false);
      }
    }
    loadFilm();
  }, [id]);

  if (loading) {
    return (
      <div className="ps-tv-loading">
        <div className="ps-tv-spinner" />
        <p>Loading film…</p>
      </div>
    );
  }

  if (error) return <div className="ps-tv-error">{error}</div>;
  if (!film) return <div className="ps-tv-error">Film not found.</div>;

  // Support both old and new field names
  const videoUrl = film.url || film.videoUrl;
  const poster = film.thumbnail || film.posterUrl;
  const duration = film.duration || 0;
  const durationMinutes = Math.floor(duration / 60);

  return (
    <div className="ps-tv-detail-page">
      <button className="ps-tv-back" onClick={() => navigate(-1)}>
        ← Back to PowerStream TV
      </button>

      <div className="ps-tv-detail-layout">
        <div className="ps-tv-detail-player">
          {videoUrl ? (
            <video controls playsInline src={videoUrl} poster={poster}>
              Your browser does not support video playback.
            </video>
          ) : (
            <div className="ps-tv-video-placeholder">No video URL configured.</div>
          )}
        </div>

        <div className="ps-tv-detail-meta">
          <h1>{film.title}</h1>
          <p className="ps-tv-detail-description">{film.description}</p>

          <div className="ps-tv-detail-info-row">
            {film.category && <span className="ps-tv-chip">{film.category}</span>}
            {durationMinutes > 0 && (
              <span className="ps-tv-chip">{durationMinutes} min</span>
            )}
            {film.createdAt && (
              <span className="ps-tv-chip">
                {new Date(film.createdAt).toLocaleDateString()}
              </span>
            )}
            {film.views > 0 && <span className="ps-tv-chip">👁 {film.views} views</span>}
          </div>

          {film.genre && film.genre.length > 0 && (
            <div className="ps-tv-detail-info-row">
              {film.genre.map((g, i) => (
                <span key={i} className="ps-tv-chip genre">{g}</span>
              ))}
            </div>
          )}

          {film.tags && film.tags.length > 0 && (
            <div className="ps-tv-detail-info-row">
              {film.tags.map((tag, i) => (
                <span key={i} className="ps-tv-chip tag">#{tag}</span>
              ))}
            </div>
          )}

          {film.trailerUrl && (
            <div className="ps-tv-trailer-section">
              <h3>Trailer</h3>
              <video controls playsInline src={film.trailerUrl} className="ps-tv-trailer-player">
                Your browser does not support video playback.
              </video>
            </div>
          )}

          {film.monetization?.type === "rental" || film.monetization?.type === "purchase" ? (
            <div className="ps-tv-ppv-box">
              <div>Pay-Per-View</div>
              <div className="ps-tv-ppv-price">
                ${(film.monetization.priceUSD || 4.99).toFixed(2)}
              </div>
              <button className="ps-tv-cta-button" type="button">
                Purchase & Watch
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
