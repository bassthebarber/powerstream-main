// frontend/src/components/tv/global/RatingStars.jsx
// Universal TV Rating Stars Component - Works across all stations

import React, { useState, useEffect } from "react";
import styles from "./global.module.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

/**
 * Universal 5-Star Rating Component for TV Videos
 * 
 * @param {Object} props
 * @param {string} props.stationId - Station ID
 * @param {string} props.videoId - Video ID
 * @param {number} props.initialRating - Initial average rating (0-5)
 * @param {number} props.initialCount - Initial rating count
 * @param {string} props.userId - Optional user ID for authenticated ratings
 * @param {boolean} props.readOnly - If true, no interactions
 * @param {string} props.size - "small" | "medium" | "large"
 * @param {boolean} props.showCount - Show rating count
 * @param {function} props.onRatingChange - Callback when rating changes
 */
export default function RatingStars({
  stationId,
  videoId,
  initialRating = 0,
  initialCount = 0,
  userId = null,
  readOnly = false,
  size = "medium",
  showCount = true,
  onRatingChange,
}) {
  const [rating, setRating] = useState(initialRating);
  const [ratingCount, setRatingCount] = useState(initialCount);
  const [hoverRating, setHoverRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setRating(initialRating);
    setRatingCount(initialCount);
  }, [initialRating, initialCount]);

  const handleMouseEnter = (star) => {
    if (!readOnly && !isSubmitting) {
      setHoverRating(star);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleClick = async (star) => {
    if (readOnly || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/tv/engagement/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId,
          videoId,
          stars: star,
          userId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setUserRating(star);
        setRating(data.rating);
        setRatingCount(data.ratingCount);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);

        if (onRatingChange) {
          onRatingChange({
            userRating: star,
            averageRating: data.rating,
            ratingCount: data.ratingCount,
          });
        }
      }
    } catch (err) {
      console.error("[RatingStars] Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoverRating || userRating || rating;

  const sizeClass = {
    small: styles.starsSmall,
    medium: styles.starsMedium,
    large: styles.starsLarge,
  }[size] || styles.starsMedium;

  return (
    <div className={`${styles.ratingContainer} ${sizeClass}`}>
      <div 
        className={styles.starsWrapper}
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${styles.star} ${
              star <= displayRating ? styles.starFilled : styles.starEmpty
            } ${star <= hoverRating ? styles.starHover : ""} ${
              !readOnly ? styles.starClickable : ""
            } ${showSuccess && star <= userRating ? styles.starSuccess : ""}`}
            onMouseEnter={() => handleMouseEnter(star)}
            onClick={() => handleClick(star)}
            role={readOnly ? "presentation" : "button"}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            ★
          </span>
        ))}
      </div>

      {showCount && (
        <div className={styles.ratingInfo}>
          <span className={styles.ratingValue}>
            {rating > 0 ? rating.toFixed(1) : "—"}
          </span>
          <span className={styles.ratingCount}>
            ({ratingCount.toLocaleString()})
          </span>
        </div>
      )}

      {userRating > 0 && !readOnly && (
        <div className={styles.userRatingBadge}>
          Your rating: {userRating} ★
        </div>
      )}

      {showSuccess && (
        <div className={styles.successMessage}>
          ✓ Rating saved!
        </div>
      )}
    </div>
  );
}

/**
 * Compact Rating Display (for cards)
 */
export function RatingCompact({ rating = 0, count = 0, className = "" }) {
  return (
    <div className={`${styles.ratingCompact} ${className}`}>
      <span className={styles.starFilled}>★</span>
      <span className={styles.ratingCompactValue}>
        {rating > 0 ? rating.toFixed(1) : "—"}
      </span>
      {count > 0 && (
        <span className={styles.ratingCompactCount}>({count})</span>
      )}
    </div>
  );
}



