// frontend/src/components/tv/layout/HeroBanner.jsx
// Netflix-style hero banner for featured content

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HeroBanner.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

export default function HeroBanner({ 
  stationId, 
  featuredVideo: propFeatured,
  station,
  onPlay,
}) {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState(propFeatured || null);
  const [loading, setLoading] = useState(!propFeatured);
  const [infoExpanded, setInfoExpanded] = useState(false);

  // Fetch featured video if not provided
  useEffect(() => {
    if (propFeatured) {
      setFeatured(propFeatured);
      return;
    }

    if (!stationId) return;

    async function fetchFeatured() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/tv/${stationId}/videos?featured=true&limit=1`);
        const data = await res.json();

        if ((data.success || data.ok) && data.videos?.length > 0) {
          // Get featured video or most recent
          const featured = data.videos.find(v => v.isFeatured) || data.videos[0];
          setFeatured(featured);
        }
      } catch (err) {
        console.error("[HeroBanner] Error fetching featured:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, [stationId, propFeatured]);

  const handlePlay = () => {
    if (onPlay && featured) {
      onPlay(featured);
    } else if (featured) {
      navigate(`/tv/${stationId}/watch/${featured._id}`);
    }
  };

  const handleMoreInfo = () => {
    setInfoExpanded(!infoExpanded);
  };

  // Get background image
  const backgroundImage = featured?.thumbnail 
    || featured?.thumbnailUrl 
    || featured?.posterUrl 
    || featured?.bannerUrl
    || station?.banner
    || station?.bannerUrl
    || "";

  // If no featured content, show station banner
  if (!loading && !featured) {
    return (
      <div className="hero-banner hero-banner--empty">
        <div 
          className="hero-banner__background"
          style={{ 
            backgroundImage: station?.banner 
              ? `url(${station.banner})` 
              : "linear-gradient(135deg, #1a1a1a, #0a0a0a)" 
          }}
        />
        <div className="hero-banner__gradient" />
        <div className="hero-banner__content">
          <div className="hero-banner__logo">
            {station?.logo && (
              <img src={station.logo} alt={station.name} />
            )}
          </div>
          <h1 className="hero-banner__title">
            {station?.name || "PowerStream TV"}
          </h1>
          <p className="hero-banner__description">
            {station?.description || "Welcome to the station. Check back soon for new content!"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`hero-banner ${infoExpanded ? "hero-banner--expanded" : ""}`}>
      {/* Background image */}
      <div 
        className="hero-banner__background"
        style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined }}
      />

      {/* Gradient overlays */}
      <div className="hero-banner__gradient" />
      <div className="hero-banner__gradient-bottom" />

      {/* Content */}
      <div className="hero-banner__content">
        {/* Station logo */}
        {station?.logo && (
          <div className="hero-banner__station-logo">
            <img src={station.logo} alt={station.name} />
          </div>
        )}

        {/* Title */}
        <h1 className="hero-banner__title">
          {featured?.title || "Featured Content"}
        </h1>

        {/* Metadata */}
        <div className="hero-banner__meta">
          {featured?.category && (
            <span className="hero-banner__category">{featured.category}</span>
          )}
          {featured?.duration && (
            <span className="hero-banner__duration">
              {Math.floor(featured.duration / 60)} min
            </span>
          )}
          {featured?.views > 0 && (
            <span className="hero-banner__views">
              {featured.views.toLocaleString()} views
            </span>
          )}
        </div>

        {/* Description */}
        <p className={`hero-banner__description ${infoExpanded ? "hero-banner__description--expanded" : ""}`}>
          {featured?.description || "Watch the latest featured content on this station."}
        </p>

        {/* Actions */}
        <div className="hero-banner__actions">
          <button 
            className="hero-banner__btn hero-banner__btn--play"
            onClick={handlePlay}
          >
            <span className="hero-banner__btn-icon">▶</span>
            Watch Now
          </button>

          <button 
            className="hero-banner__btn hero-banner__btn--info"
            onClick={handleMoreInfo}
          >
            <span className="hero-banner__btn-icon">ℹ</span>
            {infoExpanded ? "Less Info" : "More Info"}
          </button>

          <button 
            className="hero-banner__btn hero-banner__btn--add"
            title="Add to My List"
          >
            <span className="hero-banner__btn-icon">+</span>
          </button>
        </div>

        {/* Expanded info */}
        {infoExpanded && featured && (
          <div className="hero-banner__expanded-info">
            {featured.tags && featured.tags.length > 0 && (
              <div className="hero-banner__tags">
                {featured.tags.map((tag, i) => (
                  <span key={i} className="hero-banner__tag">{tag}</span>
                ))}
              </div>
            )}
            {featured.uploadedAt && (
              <p className="hero-banner__date">
                Uploaded: {new Date(featured.uploadedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="hero-banner__loading">
          <div className="hero-banner__spinner" />
        </div>
      )}
    </div>
  );
}



