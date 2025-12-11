// frontend/src/nlf-tv/NLFRatingStars.jsx
// No Limit Forever TV - 5-Star Rating Component with Animation

import React, { useState, useEffect } from "react";
import styles from "./styles/NLF.module.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

export default function NLFRatingStars({ 
  videoId, 
  initialRating = 0, 
  ratingCount = 0,
  userId = null,
  readOnly = false,
  size = "medium", // small, medium, large
  showCount = true,
  onRatingChange,
}) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [count, setCount] = useState(ratingCount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setRating(initialRating);
    setCount(ratingCount);
  }, [initialRating, ratingCount]);

  const handleMouseEnter = (star) => {
    if (!readOnly) {
      setHoverRating(star);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleClick = async (star) => {
    if (readOnly || isSubmitting) return;

    setIsSubmitting(true);
    setShowAnimation(true);

    try {
      const res = await fetch(`${API_BASE}/api/nlf/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          userId,
          rating: star,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setUserRating(star);
        setRating(data.averageRating);
        setCount(data.ratingCount);
        
        if (onRatingChange) {
          onRatingChange({
            userRating: star,
            averageRating: data.averageRating,
            ratingCount: data.ratingCount,
          });
        }
      }
    } catch (err) {
      console.error("[NLF] Rating error:", err);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowAnimation(false), 600);
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case "small": return styles.starsSmall;
      case "large": return styles.starsLarge;
      default: return styles.starsMedium;
    }
  };

  const displayRating = hoverRating || userRating || rating;

  return (
    <div className={`${styles.ratingContainer} ${getSizeClass()}`}>
      <div 
        className={`${styles.starsWrapper} ${showAnimation ? styles.starsAnimate : ""}`}
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${styles.star} ${
              star <= displayRating ? styles.starFilled : styles.starEmpty
            } ${star <= hoverRating ? styles.starHover : ""} ${
              !readOnly ? styles.starClickable : ""
            }`}
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
            ({count.toLocaleString()} {count === 1 ? "rating" : "ratings"})
          </span>
        </div>
      )}

      {userRating > 0 && !readOnly && (
        <div className={styles.userRatingBadge}>
          Your rating: {userRating} ★
        </div>
      )}
    </div>
  );
}

// Compact version for cards
export function NLFRatingCompact({ rating = 0, count = 0 }) {
  return (
    <div className={styles.ratingCompact}>
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


