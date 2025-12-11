// frontend/src/components/tv/SearchFilterBar.jsx
// Search and filter bar for TV content

import React, { useState, useEffect, useCallback } from "react";
import "./SearchFilterBar.css";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "movies", label: "Movies" },
  { value: "shows", label: "TV Shows" },
  { value: "documentaries", label: "Documentaries" },
  { value: "music", label: "Music" },
  { value: "news", label: "News" },
  { value: "sports", label: "Sports" },
  { value: "interviews", label: "Interviews" },
  { value: "live", label: "Live Performances" },
  { value: "behind-the-scenes", label: "Behind the Scenes" },
  { value: "comedy", label: "Comedy" },
  { value: "drama", label: "Drama" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "popular", label: "Most Popular" },
  { value: "title-asc", label: "Title A-Z" },
  { value: "title-desc", label: "Title Z-A" },
];

const DURATION_FILTERS = [
  { value: "all", label: "Any Length" },
  { value: "short", label: "Short (<10 min)" },
  { value: "medium", label: "Medium (10-30 min)" },
  { value: "long", label: "Long (>30 min)" },
  { value: "feature", label: "Feature (>60 min)" },
];

export default function SearchFilterBar({ 
  stationId,
  onSearch,
  onFilter,
  initialFilters = {},
  showCategories = true,
  showSort = true,
  showDuration = true,
}) {
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || "");
  const [category, setCategory] = useState(initialFilters.category || "all");
  const [sort, setSort] = useState(initialFilters.sort || "newest");
  const [duration, setDuration] = useState(initialFilters.duration || "all");
  const [isExpanded, setIsExpanded] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Trigger filter callback when any filter changes
  useEffect(() => {
    if (onFilter) {
      onFilter({
        search: debouncedSearch,
        category,
        sort,
        duration,
      });
    }
  }, [debouncedSearch, category, sort, duration, onFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setCategory("all");
    setSort("newest");
    setDuration("all");
  };

  const hasActiveFilters = 
    searchQuery || 
    category !== "all" || 
    sort !== "newest" || 
    duration !== "all";

  return (
    <div className="search-filter-bar">
      {/* Search input */}
      <form className="search-filter-bar__search" onSubmit={handleSearchSubmit}>
        <span className="search-filter-bar__search-icon">🔍</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search videos..."
          className="search-filter-bar__input"
        />
        {searchQuery && (
          <button 
            type="button"
            className="search-filter-bar__clear"
            onClick={() => setSearchQuery("")}
          >
            ×
          </button>
        )}
      </form>

      {/* Filter toggles */}
      <div className="search-filter-bar__filters">
        {/* Category filter */}
        {showCategories && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="search-filter-bar__select"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        )}

        {/* Sort filter */}
        {showSort && (
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="search-filter-bar__select"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {/* Duration filter */}
        {showDuration && (
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="search-filter-bar__select"
          >
            {DURATION_FILTERS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {/* Expand/collapse advanced filters */}
        <button 
          type="button"
          className={`search-filter-bar__toggle ${isExpanded ? "active" : ""}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>⚙️</span>
          <span className="search-filter-bar__toggle-text">Filters</span>
        </button>

        {/* Clear all */}
        {hasActiveFilters && (
          <button 
            type="button"
            className="search-filter-bar__clear-all"
            onClick={handleClearFilters}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Expanded filters panel */}
      {isExpanded && (
        <div className="search-filter-bar__expanded">
          <div className="search-filter-bar__filter-group">
            <label>Category</label>
            <div className="search-filter-bar__chips">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  className={`search-filter-bar__chip ${category === cat.value ? "active" : ""}`}
                  onClick={() => setCategory(cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="search-filter-bar__filter-group">
            <label>Duration</label>
            <div className="search-filter-bar__chips">
              {DURATION_FILTERS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`search-filter-bar__chip ${duration === opt.value ? "active" : ""}`}
                  onClick={() => setDuration(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="search-filter-bar__active">
          <span>Active filters:</span>
          {searchQuery && (
            <span className="search-filter-bar__active-chip">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery("")}>×</button>
            </span>
          )}
          {category !== "all" && (
            <span className="search-filter-bar__active-chip">
              {CATEGORIES.find(c => c.value === category)?.label}
              <button onClick={() => setCategory("all")}>×</button>
            </span>
          )}
          {duration !== "all" && (
            <span className="search-filter-bar__active-chip">
              {DURATION_FILTERS.find(d => d.value === duration)?.label}
              <button onClick={() => setDuration("all")}>×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}


