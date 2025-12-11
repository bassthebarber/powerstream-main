// frontend/src/components/tv/stations/NoLimitForeverTV/NLFFeaturedHero.jsx
// No Limit Forever TV - Featured Hero Section

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NLFFeaturedHero({ films }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const featured = films[currentIndex];

  useEffect(() => {
    if (films.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % films.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [films.length]);

  if (!featured) return null;

  const handleWatch = () => {
    navigate(`/network/no-limit-forever/watch/${featured._id}`);
  };

  return (
    <div 
      className="nlf-hero"
      style={{
        backgroundImage: featured.backdropUrl || featured.posterUrl 
          ? `linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.3) 100%), url(${featured.backdropUrl || featured.posterUrl})`
          : undefined,
      }}
    >
      <div className="nlf-hero-content">
        <span className="nlf-hero-badge">
          {featured.isFeatured ? "⭐ FEATURED" : "🎬 NOW STREAMING"}
        </span>
        <h2 className="nlf-hero-title">{featured.title}</h2>
        <div className="nlf-hero-meta">
          <span className="category">{featured.category?.toUpperCase()}</span>
          {featured.year && <span className="year">{featured.year}</span>}
          {featured.runtimeMinutes > 0 && (
            <span className="runtime">{Math.floor(featured.runtimeMinutes / 60)}h {featured.runtimeMinutes % 60}m</span>
          )}
          {featured.rating > 0 && (
            <span className="rating">⭐ {featured.rating.toFixed(1)}</span>
          )}
          <span className="views">{featured.views?.toLocaleString()} views</span>
        </div>
        <p className="nlf-hero-desc">
          {featured.description?.length > 200 
            ? featured.description.slice(0, 197) + "..." 
            : featured.description}
        </p>
        <div className="nlf-hero-actions">
          <button className="nlf-hero-btn primary" onClick={handleWatch}>
            ▶ Watch Now
          </button>
          {featured.trailerUrl && (
            <button className="nlf-hero-btn secondary">
              🎬 Trailer
            </button>
          )}
        </div>
      </div>

      {films.length > 1 && (
        <div className="nlf-hero-dots">
          {films.map((_, idx) => (
            <button
              key={idx}
              className={`hero-dot ${idx === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

