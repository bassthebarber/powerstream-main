// frontend/src/components/tv/layout/CategoryRow.jsx
// Netflix-style horizontal scrollable category row

import React, { useState, useEffect, useRef } from "react";
import FilmCard from "./FilmCard.jsx";
import "./CategoryRow.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

export default function CategoryRow({ 
  stationId, 
  category, 
  title,
  videos: propVideos,
  onVideoPlay,
  maxItems = 20,
}) {
  const [videos, setVideos] = useState(propVideos || []);
  const [loading, setLoading] = useState(!propVideos);
  const [error, setError] = useState("");
  const [scrollPosition, setScrollPosition] = useState(0);
  const rowRef = useRef(null);

  // Fetch videos if not provided via props
  useEffect(() => {
    if (propVideos) {
      setVideos(propVideos);
      return;
    }

    if (!stationId) return;

    async function fetchVideos() {
      try {
        setLoading(true);
        setError("");

        let url = `${API_BASE}/api/tv/${stationId}/videos`;
        const params = new URLSearchParams();
        
        if (category && category !== "all" && category !== "Recently Uploaded") {
          params.append("category", category);
        }
        params.append("limit", maxItems.toString());
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (data.success || data.ok) {
          let vids = data.videos || [];
          
          // If category is "Recently Uploaded", sort by date
          if (category === "Recently Uploaded") {
            vids = vids.sort((a, b) => 
              new Date(b.uploadedAt || b.createdAt) - new Date(a.uploadedAt || a.createdAt)
            );
          }
          
          // Filter by category if needed
          if (category && category !== "all" && category !== "Recently Uploaded") {
            vids = vids.filter(v => 
              v.category?.toLowerCase() === category.toLowerCase() ||
              v.tags?.some(t => t.toLowerCase() === category.toLowerCase())
            );
          }
          
          setVideos(vids.slice(0, maxItems));
        }
      } catch (err) {
        console.error(`[CategoryRow] Error fetching ${category}:`, err);
        setError("Failed to load videos");
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, [stationId, category, propVideos, maxItems]);

  // Scroll handlers
  const scroll = (direction) => {
    if (!rowRef.current) return;
    
    const container = rowRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    const newPosition = direction === "left" 
      ? scrollPosition - scrollAmount 
      : scrollPosition + scrollAmount;
    
    container.scrollTo({
      left: newPosition,
      behavior: "smooth"
    });
    
    setScrollPosition(newPosition);
  };

  const handleScroll = () => {
    if (rowRef.current) {
      setScrollPosition(rowRef.current.scrollLeft);
    }
  };

  // Check if we can scroll
  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = rowRef.current 
    ? scrollPosition < rowRef.current.scrollWidth - rowRef.current.clientWidth - 10
    : false;

  // Display title
  const displayTitle = title || category || "Videos";

  // Don't render if no videos and not loading
  if (!loading && videos.length === 0) {
    return null;
  }

  return (
    <section className="category-row">
      <div className="category-row__header">
        <h2 className="category-row__title">{displayTitle}</h2>
        {videos.length > 0 && (
          <span className="category-row__count">{videos.length} videos</span>
        )}
      </div>

      <div className="category-row__container">
        {/* Left scroll button */}
        {canScrollLeft && (
          <button 
            className="category-row__scroll-btn category-row__scroll-btn--left"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            ‹
          </button>
        )}

        {/* Videos row */}
        <div 
          className="category-row__row" 
          ref={rowRef}
          onScroll={handleScroll}
        >
          {loading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="category-row__skeleton">
                <div className="category-row__skeleton-thumb" />
                <div className="category-row__skeleton-title" />
              </div>
            ))
          ) : error ? (
            <div className="category-row__error">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="category-row__empty">
              <span>📺</span>
              <p>No content available yet</p>
            </div>
          ) : (
            videos.map((video, index) => (
              <FilmCard 
                key={video._id || index}
                video={video}
                stationId={stationId}
                onPlay={onVideoPlay}
              />
            ))
          )}
        </div>

        {/* Right scroll button */}
        {canScrollRight && (
          <button 
            className="category-row__scroll-btn category-row__scroll-btn--right"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            ›
          </button>
        )}
      </div>
    </section>
  );
}



