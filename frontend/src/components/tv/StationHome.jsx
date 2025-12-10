// frontend/src/components/tv/StationHome.jsx
// Netflix-style Station Home Page Component

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeroBanner from "./layout/HeroBanner.jsx";
import CategoryRow from "./layout/CategoryRow.jsx";
import SearchFilterBar from "./SearchFilterBar.jsx";
import "./StationHome.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

// Default categories to display
const DEFAULT_CATEGORIES = [
  "Recently Uploaded",
  "Movies",
  "Documentaries",
  "Sports",
  "Interviews",
  "Live Performances",
  "Behind the Scenes",
  "News",
  "Music",
  "Comedy",
  "Drama",
];

export default function StationHome({ stationSlug }) {
  const { slug: paramSlug, stationId: paramStationId } = useParams();
  const navigate = useNavigate();
  
  // Use prop, param slug, or param stationId
  const stationIdentifier = stationSlug || paramSlug || paramStationId;

  // State
  const [station, setStation] = useState(null);
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({});
  const [isSearching, setIsSearching] = useState(false);

  // Fetch station data
  useEffect(() => {
    if (!stationIdentifier) {
      setError("No station specified");
      setLoading(false);
      return;
    }

    async function fetchStationData() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/api/tv/${stationIdentifier}/catalog`);
        const data = await res.json();

        if (data.success || data.ok) {
          setStation(data.station);
          setVideos(data.videos || []);
          setFilteredVideos(data.videos || []);

          // Extract unique categories from videos
          const uniqueCategories = new Set();
          (data.videos || []).forEach(v => {
            if (v.category) uniqueCategories.add(v.category);
            v.tags?.forEach(t => uniqueCategories.add(t));
          });

          // Combine with default categories
          const allCategories = [
            "Recently Uploaded",
            ...Array.from(uniqueCategories),
            ...DEFAULT_CATEGORIES.filter(c => !uniqueCategories.has(c) && c !== "Recently Uploaded"),
          ];

          // Remove duplicates
          setCategories([...new Set(allCategories)]);
        } else {
          setError(data.message || "Failed to load station");
        }
      } catch (err) {
        console.error("[StationHome] Error:", err);
        setError("Failed to load station");
      } finally {
        setLoading(false);
      }
    }

    fetchStationData();
  }, [stationIdentifier]);

  // Filter videos based on search/filter criteria
  const applyFilters = useCallback((filterOptions) => {
    setFilters(filterOptions);
    let result = [...videos];

    // Search
    if (filterOptions.search) {
      const searchLower = filterOptions.search.toLowerCase();
      result = result.filter(v =>
        v.title?.toLowerCase().includes(searchLower) ||
        v.description?.toLowerCase().includes(searchLower) ||
        v.tags?.some(t => t.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (filterOptions.category && filterOptions.category !== "all") {
      result = result.filter(v =>
        v.category?.toLowerCase() === filterOptions.category.toLowerCase() ||
        v.tags?.some(t => t.toLowerCase() === filterOptions.category.toLowerCase())
      );
    }

    // Duration filter
    if (filterOptions.duration && filterOptions.duration !== "all") {
      const durationSec = (v) => v.duration || v.durationSeconds || 0;
      switch (filterOptions.duration) {
        case "short":
          result = result.filter(v => durationSec(v) < 600); // < 10 min
          break;
        case "medium":
          result = result.filter(v => durationSec(v) >= 600 && durationSec(v) <= 1800); // 10-30 min
          break;
        case "long":
          result = result.filter(v => durationSec(v) > 1800 && durationSec(v) <= 3600); // 30-60 min
          break;
        case "feature":
          result = result.filter(v => durationSec(v) > 3600); // > 60 min
          break;
      }
    }

    // Sort
    if (filterOptions.sort) {
      switch (filterOptions.sort) {
        case "newest":
          result.sort((a, b) => new Date(b.uploadedAt || b.createdAt) - new Date(a.uploadedAt || a.createdAt));
          break;
        case "oldest":
          result.sort((a, b) => new Date(a.uploadedAt || a.createdAt) - new Date(b.uploadedAt || b.createdAt));
          break;
        case "popular":
          result.sort((a, b) => (b.views || 0) - (a.views || 0));
          break;
        case "title-asc":
          result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
          break;
        case "title-desc":
          result.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
          break;
      }
    }

    setFilteredVideos(result);
    setIsSearching(!!filterOptions.search || (filterOptions.category && filterOptions.category !== "all"));
  }, [videos]);

  // Get featured video
  const featuredVideo = useMemo(() => {
    return videos.find(v => v.isFeatured) || videos[0];
  }, [videos]);

  // Get videos for a specific category
  const getVideosForCategory = useCallback((category) => {
    if (category === "Recently Uploaded") {
      return [...videos].sort((a, b) => 
        new Date(b.uploadedAt || b.createdAt) - new Date(a.uploadedAt || a.createdAt)
      ).slice(0, 20);
    }
    
    return videos.filter(v => 
      v.category?.toLowerCase() === category.toLowerCase() ||
      v.tags?.some(t => t.toLowerCase() === category.toLowerCase())
    );
  }, [videos]);

  // Handle video play
  const handleVideoPlay = (video) => {
    navigate(`/tv/${stationIdentifier}/watch/${video._id}`);
  };

  if (loading) {
    return (
      <div className="station-home station-home--loading">
        <div className="station-home__spinner" />
        <p>Loading station...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="station-home station-home--error">
        <h2>⚠️ {error}</h2>
        <button onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  return (
    <div className="station-home">
      {/* Hero Banner */}
      <HeroBanner 
        stationId={stationIdentifier}
        station={station}
        featuredVideo={featuredVideo}
        onPlay={handleVideoPlay}
      />

      {/* Search & Filter Bar */}
      <SearchFilterBar 
        stationId={stationIdentifier}
        onFilter={applyFilters}
      />

      {/* Search Results (if searching) */}
      {isSearching ? (
        <div className="station-home__search-results">
          <h2>
            {filteredVideos.length} result{filteredVideos.length !== 1 ? "s" : ""} found
          </h2>
          {filteredVideos.length === 0 ? (
            <div className="station-home__empty">
              <span>🔍</span>
              <p>No videos match your search criteria</p>
              <button onClick={() => applyFilters({})}>Clear Filters</button>
            </div>
          ) : (
            <CategoryRow 
              stationId={stationIdentifier}
              title="Search Results"
              videos={filteredVideos}
              onVideoPlay={handleVideoPlay}
            />
          )}
        </div>
      ) : (
        /* Category Rows (Netflix-style) */
        <div className="station-home__content">
          {categories.map((category) => {
            const categoryVideos = getVideosForCategory(category);
            // Only show categories that have videos
            if (categoryVideos.length === 0) return null;
            
            return (
              <CategoryRow 
                key={category}
                stationId={stationIdentifier}
                category={category}
                title={category}
                videos={categoryVideos}
                onVideoPlay={handleVideoPlay}
              />
            );
          })}

          {/* Show message if no videos at all */}
          {videos.length === 0 && (
            <div className="station-home__empty-state">
              <span>📺</span>
              <h3>No Content Yet</h3>
              <p>This station hasn't uploaded any videos yet.</p>
              <p>Check back soon for new content!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


