import React from "react";
import MovieCard from "./MovieCard.jsx";
import "./netflix.css";

export default function MovieRow({ title, movies }) {
  if (!movies || movies.length === 0) return null;

  return (
    <section className="netflix-section">
      <h2 className="netflix-section-title">{title}</h2>
      <div className="movie-row">
        {movies.map((m) => (
          <MovieCard key={m._id} movie={m} />
        ))}
      </div>
    </section>
  );
}


