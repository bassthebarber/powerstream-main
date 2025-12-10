// frontend/src/components/tv/OnDemandSection.jsx
// Netflix-style On-Demand section with horizontal scroll rows
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./OnDemandSection.module.css";

// Single content card with hover preview
function ContentCard({ item, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 400); // Delay before expanding
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
  };

  const thumbnail = item.thumbnail || item.posterUrl || item.thumbnailUrl;
  const duration = item.duration ? Math.floor(item.duration / 60) : null;

  return (
    <div
      className={`${styles.card} ${isHovered ? styles.cardHovered : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(item)}
    >
      <div className={styles.cardInner}>
        {/* Thumbnail */}
        <div className={styles.thumbnail}>
          {thumbnail ? (
            <img src={thumbnail} alt={item.title} loading="lazy" />
          ) : (
            <div className={styles.thumbnailPlaceholder}>
              <span>🎬</span>
            </div>
          )}
          
          {/* Duration badge */}
          {duration > 0 && (
            <span className={styles.durationBadge}>{duration}m</span>
          )}
          
          {/* Play button overlay */}
          <div className={styles.playOverlay}>
            <div className={styles.playButton}>▶</div>
          </div>
        </div>

        {/* Hover preview card */}
        {isHovered && (
          <div className={styles.hoverCard}>
            <div className={styles.hoverThumbnail}>
              {thumbnail ? (
                <img src={thumbnail} alt={item.title} />
              ) : (
                <div className={styles.thumbnailPlaceholder}>
                  <span>🎬</span>
                </div>
              )}
              <div className={styles.hoverPlayOverlay}>
                <div className={styles.hoverPlayButton}>▶</div>
              </div>
            </div>
            
            <div className={styles.hoverInfo}>
              <h4 className={styles.hoverTitle}>{item.title}</h4>
              
              <div className={styles.hoverMeta}>
                {item.category && <span className={styles.tag}>{item.category}</span>}
                {duration > 0 && <span className={styles.runtime}>{duration} min</span>}
                {item.views > 0 && <span className={styles.views}>👁 {item.views}</span>}
              </div>
              
              <p className={styles.hoverDescription}>
                {item.description?.slice(0, 120) || "No description available."}
                {item.description?.length > 120 ? "…" : ""}
              </p>
              
              <div className={styles.hoverActions}>
                <button className={styles.watchBtn}>▶ Watch Now</button>
                <button className={styles.addBtn}>+ My List</button>
              </div>
            </div>
          </div>
        )}

        {/* Title/Subtitle */}
        <div className={styles.cardInfo}>
          <h4 className={styles.title}>{item.title}</h4>
          {item.category && <p className={styles.subtitle}>{item.category}</p>}
        </div>
      </div>
    </div>
  );
}

// Horizontal scroll row
function ContentRow({ title, items, onItemClick }) {
  const rowRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkArrows = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
  };

  useEffect(() => {
    checkArrows();
    const row = rowRef.current;
    if (row) {
      row.addEventListener("scroll", checkArrows);
      return () => row.removeEventListener("scroll", checkArrows);
    }
  }, [items]);

  const scroll = (direction) => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth * 0.8;
    rowRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <div className={styles.row}>
      <h3 className={styles.rowTitle}>{title}</h3>
      
      <div className={styles.rowContainer}>
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            className={`${styles.scrollBtn} ${styles.scrollLeft}`}
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            ‹
          </button>
        )}

        {/* Content Row */}
        <div className={styles.rowContent} ref={rowRef}>
          {items.map((item) => (
            <ContentCard key={item._id} item={item} onClick={onItemClick} />
          ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            className={`${styles.scrollBtn} ${styles.scrollRight}`}
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}

// Featured Hero Banner
function HeroBanner({ item, onPlay }) {
  if (!item) return null;

  const thumbnail = item.thumbnail || item.posterUrl || item.bannerUrl;

  return (
    <div
      className={styles.hero}
      style={{ backgroundImage: thumbnail ? `url(${thumbnail})` : undefined }}
    >
      <div className={styles.heroGradient} />
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>{item.title}</h1>
        <p className={styles.heroDescription}>
          {item.description?.slice(0, 200) || "Watch now on PowerStream TV"}
          {item.description?.length > 200 ? "…" : ""}
        </p>
        <div className={styles.heroActions}>
          <button className={styles.heroPlayBtn} onClick={() => onPlay(item)}>
            ▶ Play
          </button>
          <button className={styles.heroInfoBtn}>ℹ More Info</button>
        </div>
      </div>
    </div>
  );
}

// Main On-Demand Section Component
export default function OnDemandSection({ 
  films = [], 
  trending = [], 
  categories = [],
  onFilmSelect 
}) {
  const navigate = useNavigate();

  const handleItemClick = (item) => {
    if (onFilmSelect) {
      onFilmSelect(item);
    } else {
      navigate(`/powerstream-tv/film/${item._id}`);
    }
  };

  // Group films by category
  const filmsByCategory = {};
  films.forEach((film) => {
    const cat = film.category || "Uncategorized";
    if (!filmsByCategory[cat]) filmsByCategory[cat] = [];
    filmsByCategory[cat].push(film);
  });

  // Get featured film (first trending or first film)
  const featured = trending[0] || films[0];

  return (
    <div className={styles.onDemand}>
      {/* Hero Banner */}
      {featured && <HeroBanner item={featured} onPlay={handleItemClick} />}

      {/* Content Rows */}
      <div className={styles.rows}>
        {/* Trending Row */}
        {trending.length > 0 && (
          <ContentRow
            title="🔥 Trending Now"
            items={trending}
            onItemClick={handleItemClick}
          />
        )}

        {/* Continue Watching (placeholder) */}
        {films.length > 0 && (
          <ContentRow
            title="▶ Continue Watching"
            items={films.slice(0, 6)}
            onItemClick={handleItemClick}
          />
        )}

        {/* New Releases */}
        {films.length > 0 && (
          <ContentRow
            title="🆕 New Releases"
            items={[...films].sort((a, b) => 
              new Date(b.createdAt) - new Date(a.createdAt)
            ).slice(0, 12)}
            onItemClick={handleItemClick}
          />
        )}

        {/* Category Rows */}
        {Object.entries(filmsByCategory).map(([category, categoryFilms]) => (
          <ContentRow
            key={category}
            title={category}
            items={categoryFilms}
            onItemClick={handleItemClick}
          />
        ))}

        {/* Most Viewed */}
        {films.length > 0 && (
          <ContentRow
            title="👁 Most Viewed"
            items={[...films].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 12)}
            onItemClick={handleItemClick}
          />
        )}
      </div>
    </div>
  );
}


