import React from "react";
import { Link } from "react-router-dom";

export default function TrendingCarousel({ films }) {
  if (!films || !films.length) return null;

  const featured = films[0];
  // Support both old (posterUrl) and new (thumbnail) field names
  const featuredPoster = featured.thumbnail || featured.posterUrl;

  return (
    <section className="ps-tv-section trending">
      <h2 className="ps-tv-section-title">Trending Now</h2>
      <div className="ps-tv-trending-layout">
        <Link
          to={`/powerstream-tv/film/${featured._id}`}
          className="ps-tv-trending-featured"
        >
          {featuredPoster ? (
            <img
              src={featuredPoster}
              alt={featured.title}
              className="ps-tv-trending-poster"
            />
          ) : (
            <div className="ps-tv-trending-poster placeholder">No Poster</div>
          )}
          <div className="ps-tv-trending-overlay">
            <h3>{featured.title}</h3>
            <p>{featured.description?.slice(0, 120)}</p>
            {featured.views > 0 && (
              <span className="ps-tv-views">👁 {featured.views} views</span>
            )}
          </div>
        </Link>

        <div className="ps-tv-trending-list">
          {films.slice(1, 8).map((film) => {
            const poster = film.thumbnail || film.posterUrl;
            return (
              <Link
                key={film._id}
                to={`/powerstream-tv/film/${film._id}`}
                className="ps-tv-trending-item"
              >
                {poster ? (
                  <img
                    src={poster}
                    alt={film.title}
                    className="ps-tv-trending-thumb"
                  />
                ) : (
                  <div className="ps-tv-trending-thumb placeholder">🎬</div>
                )}
                <span>{film.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
