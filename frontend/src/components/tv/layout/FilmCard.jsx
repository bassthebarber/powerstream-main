// frontend/src/components/tv/layout/FilmCard.jsx
// Netflix-style film/video card component

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FilmCard.css";

export default function FilmCard({ 
  video, 
  stationId,
  onPlay,
  onDelete,
  showDuration = true,
  showTitle = true,
  showDelete = false,
}) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get thumbnail URL
  const thumbnail = video.thumbnail || video.thumbnailUrl || video.posterUrl || "";
  
  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remainMins = mins % 60;
      return `${hrs}:${remainMins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const duration = video.duration || video.durationSeconds || 0;
  const durationStr = formatDuration(duration);

  const handleClick = (e) => {
    // Don't navigate if clicking delete controls
    if (e.target.closest('.film-card__delete-btn') || e.target.closest('.film-card__delete-confirm')) {
      return;
    }
    if (onPlay) {
      onPlay(video);
    } else {
      navigate(`/tv/${stationId}/watch/${video._id}`);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async (e) => {
    e.stopPropagation();
    if (onDelete && !isDeleting) {
      setIsDeleting(true);
      try {
        await onDelete(video._id, video.title);
      } catch (err) {
        console.error("Delete failed:", err);
      } finally {
        setIsDeleting(false);
        setShowConfirmDelete(false);
      }
    }
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setShowConfirmDelete(false);
  };

  return (
    <div 
      className={`film-card ${isHovered ? "film-card--hovered" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="film-card__thumbnail">
        {thumbnail && !imageError ? (
          <img 
            src={thumbnail} 
            alt={video.title || "Video"} 
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="film-card__placeholder">
            <span>🎬</span>
          </div>
        )}
        
        {/* Duration overlay */}
        {showDuration && durationStr && (
          <span className="film-card__duration">{durationStr}</span>
        )}
        
        {/* Play button overlay */}
        <div className="film-card__play-overlay">
          <button className="film-card__play-btn" aria-label="Play">
            ▶
          </button>
        </div>

        {/* Badges */}
        <div className="film-card__badges">
          {video.isNew && <span className="film-card__badge film-card__badge--new">NEW</span>}
          {video.isFeatured && <span className="film-card__badge film-card__badge--featured">★</span>}
          {video.isLive && <span className="film-card__badge film-card__badge--live">LIVE</span>}
        </div>

        {/* Delete Button */}
        {showDelete && onDelete && (
          <button 
            className="film-card__delete-btn"
            onClick={handleDeleteClick}
            title="Delete video"
          >
            🗑️
          </button>
        )}

        {/* Delete Confirmation */}
        {showConfirmDelete && (
          <div className="film-card__delete-confirm" onClick={(e) => e.stopPropagation()}>
            <p>Delete "{video.title}"?</p>
            <div className="film-card__delete-btns">
              <button 
                className="film-card__delete-yes"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "..." : "Delete"}
              </button>
              <button 
                className="film-card__delete-no"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {showTitle && (
        <div className="film-card__info">
          <h4 className="film-card__title">{video.title || "Untitled"}</h4>
          {video.category && (
            <span className="film-card__category">{video.category}</span>
          )}
          {video.views > 0 && (
            <span className="film-card__views">
              {video.views.toLocaleString()} views
            </span>
          )}
        </div>
      )}

      {/* Hover preview card */}
      {isHovered && (
        <div className="film-card__hover-preview">
          <div className="film-card__hover-content">
            <h4>{video.title}</h4>
            {video.description && (
              <p>{video.description.length > 100 
                ? video.description.slice(0, 100) + "..." 
                : video.description}
              </p>
            )}
            <div className="film-card__hover-actions">
              <button className="film-card__action-btn film-card__action-btn--play">
                ▶ Play
              </button>
              <button className="film-card__action-btn">
                + My List
              </button>
              <button className="film-card__action-btn">
                👍
              </button>
            </div>
            <div className="film-card__hover-meta">
              {video.category && <span>{video.category}</span>}
              {durationStr && <span>{durationStr}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


