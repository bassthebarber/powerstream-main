import React from "react";
import { Link } from "react-router-dom";

export default function FilmGrid({ films }) {
  if (!films || !films.length) {
    return null; // Parent handles empty state
  }

  return (
    <section className="ps-tv-section">
      <h2 className="ps-tv-section-title">All Films</h2>
      <div className="ps-tv-grid">
        {films.map((film) => {
          // Support both old (posterUrl) and new (thumbnail) field names
          const poster = film.thumbnail || film.posterUrl;
          const videoUrl = film.url || film.videoUrl;
          
          return (
            <Link
              key={film._id}
              to={`/powerstream-tv/film/${film._id}`}
              className="ps-tv-card"
            >
              <div className="ps-tv-poster-wrapper">
                {poster ? (
                  <img src={poster} alt={film.title} className="ps-tv-poster" />
                ) : (
                  <div className="ps-tv-poster placeholder">No Poster</div>
                )}
                {film.isPaid && <span className="ps-tv-badge paid">PPV</span>}
                {film.views > 100 && <span className="ps-tv-badge trending">🔥</span>}
              </div>
              <div className="ps-tv-card-body">
                <h3>{film.title}</h3>
                <p>{film.description?.slice(0, 80) || "No description."}</p>
                {film.duration > 0 && (
                  <span className="ps-tv-duration">
                    {Math.floor(film.duration / 60)}m
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
