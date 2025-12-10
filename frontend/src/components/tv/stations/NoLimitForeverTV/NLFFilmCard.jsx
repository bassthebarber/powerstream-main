// frontend/src/components/tv/stations/NoLimitForeverTV/NLFFilmCard.jsx
// No Limit Forever TV - Film Card

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NLFFilmCard({ film, onDelete, showDelete = true }) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClick = (e) => {
    // Don't navigate if clicking delete button or confirm dialog
    if (e.target.closest('.nlf-delete-btn') || e.target.closest('.nlf-delete-confirm')) {
      return;
    }
    navigate(`/network/no-limit-forever/watch/${film._id}`);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirmDelete = async (e) => {
    e.stopPropagation();
    if (onDelete && !isDeleting) {
      setIsDeleting(true);
      try {
        await onDelete(film._id, film.title);
      } catch (err) {
        console.error("Delete failed:", err);
      } finally {
        setIsDeleting(false);
        setShowConfirm(false);
      }
    }
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setShowConfirm(false);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      movie: "🎥",
      documentary: "📽️",
      series: "📺",
      special: "⭐",
      music_video: "🎵",
      concert: "🎤",
      interview: "🎙️",
    };
    return icons[category] || "🎬";
  };

  return (
    <div className="nlf-card" onClick={handleClick}>
      <div className="nlf-card-poster">
        {film.posterUrl ? (
          <img src={film.posterUrl} alt={film.title} loading="lazy" />
        ) : (
          <div className="nlf-card-placeholder">
            <span>{getCategoryIcon(film.category)}</span>
          </div>
        )}
        
        {/* No Limit Forever Corner Logo */}
        <div className="nl-badge-container">
          <img
            src="/logos/nolimit-forever.logo.png.png"
            alt="No Limit Logo"
            className="nl-corner-logo"
          />
        </div>

        {/* Delete Button - Top Right */}
        {showDelete && onDelete && (
          <button 
            className="nlf-delete-btn"
            onClick={handleDeleteClick}
            title="Delete this film"
          >
            🗑️
          </button>
        )}

        {/* Delete Confirmation Dialog */}
        {showConfirm && (
          <div className="nlf-delete-confirm" onClick={(e) => e.stopPropagation()}>
            <p>Delete "{film.title}"?</p>
            <div className="nlf-delete-confirm-btns">
              <button 
                className="confirm-yes" 
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "..." : "Yes, Delete"}
              </button>
              <button 
                className="confirm-no" 
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="nlf-card-overlay">
          <button className="nlf-play-btn">▶</button>
        </div>

        {/* Badges */}
        <div className="nlf-card-badges">
          {film.isFeatured && <span className="badge featured">⭐</span>}
          {film.isPremium && <span className="badge premium">💎</span>}
        </div>
      </div>

      <div className="nlf-card-body">
        <h3 className="nlf-card-title">{film.title}</h3>
        <p className="nlf-card-meta">
          <span className="category-icon">{getCategoryIcon(film.category)}</span>
          <span className="category-text">{film.category?.replace("_", " ")}</span>
          {film.runtimeMinutes > 0 && (
            <span className="runtime">· {film.runtimeMinutes} min</span>
          )}
        </p>
        <div className="nlf-card-stats">
          <span className="views">👁 {film.views?.toLocaleString() || 0}</span>
          {film.rating > 0 && (
            <span className="rating">⭐ {film.rating.toFixed(1)}</span>
          )}
        </div>
        {film.description && (
          <p className="nlf-card-desc">
            {film.description.length > 100
              ? film.description.slice(0, 97) + "..."
              : film.description}
          </p>
        )}
      </div>
    </div>
  );
}

