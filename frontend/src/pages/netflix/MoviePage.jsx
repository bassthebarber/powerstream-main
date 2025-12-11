import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import "./netflix.css";

export default function MoviePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/movies/${id}`)
      .then((r) => {
        setMovie(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="movie-page loading">
        <div className="spinner" />
        <p>Loading movie...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="movie-page not-found">
        <h1>Movie Not Found</h1>
        <button onClick={() => navigate("/tv")}>← Back to TV</button>
      </div>
    );
  }

  return (
    <div className="movie-page">
      <button className="back-btn" onClick={() => navigate("/tv")}>
        ← Back
      </button>
      
      <div className="video-container">
        <video src={movie.videoUrl} controls autoPlay />
      </div>
      
      <div className="movie-details">
        <h1>{movie.title}</h1>
        <p className="description">{movie.description}</p>
        
        <div className="meta-row">
          {movie.duration > 0 && (
            <span className="meta-item">⏱ {movie.duration} mins</span>
          )}
          {movie.category && (
            <span className="meta-item">📁 {movie.category}</span>
          )}
          {movie.views > 0 && (
            <span className="meta-item">👁 {movie.views} views</span>
          )}
          {movie.likes > 0 && (
            <span className="meta-item">❤️ {movie.likes} likes</span>
          )}
        </div>

        {movie.genres && movie.genres.length > 0 && (
          <div className="genres">
            {movie.genres.map((g, i) => (
              <span key={i} className="genre-tag">{g}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


