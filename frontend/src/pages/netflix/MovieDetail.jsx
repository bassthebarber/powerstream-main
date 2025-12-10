import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import "../../components/netflix/netflix.css";

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playingTrailer, setPlayingTrailer] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/movies/${id}`);
        setMovie(res.data.movie);
        setLoading(false);
        // bump views for trending
        api.post(`/movies/${id}/view`).catch(() => {});
      } catch (err) {
        console.error("[MovieDetail] load error", err);
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handlePurchase = async () => {
    try {
      await api.post(`/movies/${id}/purchase`);
      setHasAccess(true);
      alert(
        "Ticket unlocked for this device (demo mode). You can wire real payments into this endpoint later."
      );
    } catch (err) {
      console.error("[MovieDetail] purchase error", err);
      alert("Could not complete purchase yet.");
    }
  };

  const handleLike = async () => {
    try {
      const res = await api.post(`/movies/${id}/like`);
      setMovie(res.data.movie);
    } catch (err) {
      console.error("[MovieDetail] like error", err);
    }
  };

  if (loading) {
    return (
      <div className="movie-detail-page">
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ margin: '0 auto 20px' }} />
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="movie-detail-page">
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <h2>Movie not found</h2>
          <button 
            className="watch-btn"
            onClick={() => navigate("/tv/browse")}
            style={{ marginTop: '20px' }}
          >
            ← Back to Browse
          </button>
        </div>
      </div>
    );
  }

  const canWatch = !movie.isPaid || hasAccess;

  const mainVideoSrc =
    playingTrailer && movie.trailerUrl ? movie.trailerUrl : movie.videoUrl;

  return (
    <div className="movie-detail-page">
      <button 
        onClick={() => navigate("/tv/browse")}
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        ← Back to Browse
      </button>

      <div className="movie-hero">
        <video
          src={canWatch ? mainVideoSrc : movie.trailerUrl || movie.videoUrl}
          controls
          autoPlay={canWatch}
          className="movie-hero-video"
        />

        <div className="movie-hero-meta">
          <h1>{movie.title}</h1>
          <p className="movie-hero-description">{movie.description}</p>

          <div className="movie-tags">
            {movie.category && <span>📁 {movie.category}</span>}
            {movie.isPaid && (
              <span className="badge-ppv">
                💳 PPV ${movie.price?.toFixed(2) || "9.99"}
              </span>
            )}
            <span>👁 {movie.views ?? 0} views</span>
            <span>❤️ {movie.likes ?? 0} likes</span>
            {movie.runtimeMinutes && <span>⏱ {movie.runtimeMinutes} min</span>}
          </div>

          {movie.genres && movie.genres.length > 0 && (
            <div className="movie-tags">
              {movie.genres.map((g, i) => (
                <span key={i} style={{ background: 'rgba(255,215,0,0.2)', color: '#ffd700' }}>
                  {g}
                </span>
              ))}
            </div>
          )}

          <div className="movie-actions">
            {movie.trailerUrl && (
              <button
                className="watch-btn"
                onClick={() => setPlayingTrailer((prev) => !prev)}
              >
                {playingTrailer ? "▶ Watch Full Movie" : "🎬 Watch Trailer"}
              </button>
            )}

            {movie.isPaid && !hasAccess && (
              <button className="watch-btn danger" onClick={handlePurchase}>
                💳 Buy Ticket ${movie.price?.toFixed(2) || "9.99"}
              </button>
            )}

            <button 
              className="watch-btn"
              onClick={handleLike}
              style={{ background: 'linear-gradient(90deg, #ff6b6b, #ee5a5a)' }}
            >
              ❤️ Like
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



