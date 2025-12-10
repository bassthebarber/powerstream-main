import React from "react";
import { useNavigate } from "react-router-dom";
import "./netflix.css";

export default function MovieCard({ movie }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/tv/movies/${movie._id}`);
  };

  return (
    <div className="movie-card" onClick={handleClick}>
      <div className="movie-poster-wrap">
        <img
          src={movie.thumbnail}
          alt={movie.title}
          className="movie-poster"
        />
        {movie.isPaid && (
          <span className="badge badge-ppv-small">
            PPV ${movie.price?.toFixed(2) || "9.99"}
          </span>
        )}
      </div>
      <div className="movie-card-meta">
        <h4 className="movie-card-title">{movie.title}</h4>
        <p className="movie-card-sub">
          {movie.category || "General"} • {movie.views ?? 0} views
        </p>
      </div>
    </div>
  );
}


