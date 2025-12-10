// frontend/src/pages/PowerStreamTV/PowerStreamTV.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./powerstreamTV.css";
import FilmGrid from "./FilmGrid.jsx";
import FilmCategories from "./FilmCategories.jsx";
import TrendingCarousel from "./TrendingCarousel.jsx";

// Use centralized API config - always local in development
import { API_BASE_URL } from "../../config/apiConfig.js";
const API_BASE = API_BASE_URL;

export default function PowerStreamTV() {
  const navigate = useNavigate();
  
  // State
  const [films, setFilms] = useState([]);
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, total: 0 });

  // Fetch data from /api/powerstream endpoints with graceful error handling
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      setError("");

      // Helper to safely fetch JSON
      const safeFetch = async (url) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return { ok: false };
          return await res.json();
        } catch {
          return { ok: false };
        }
      };

      // Fetch all endpoints in parallel with individual error handling
      const [filmsJson, catJson, trendingJson] = await Promise.all([
        safeFetch(`${API_BASE}/powerstream/films`),
        safeFetch(`${API_BASE}/powerstream/categories`),
        safeFetch(`${API_BASE}/powerstream/trending`),
      ]);

      // Handle films response
      if (filmsJson.ok) {
        setFilms(filmsJson.films || []);
        setPagination(filmsJson.pagination || { page: 1, total: 0 });
      } else {
        setFilms([]);
      }

      // Handle categories response
      if (catJson.ok) {
        const cats = (catJson.categories || []).map(cat => ({
          id: cat,
          label: cat,
        }));
        setCategories([{ id: "all", label: "All" }, ...cats]);
      } else {
        setCategories([{ id: "all", label: "All" }]);
      }

      // Handle trending response
      if (trendingJson.ok) {
        setTrending(trendingJson.films || []);
      } else {
        setTrending([]);
      }

      setLoading(false);
    }

    loadAll();
  }, []);

  // Filter films by active category
  const visibleFilms =
    activeCategory === "all"
      ? films
      : films.filter((f) => f.category === activeCategory);

  return (
    <div className="ps-tv-page">
      <header className="ps-tv-header">
        <div className="ps-tv-brand">
          <span className="ps-tv-logo">🎬</span>
          <div>
            <h1>PowerStream TV</h1>
            <p>Independent films, series, and global premieres.</p>
          </div>
        </div>
        <button 
          className="ps-tv-upload-btn"
          onClick={() => navigate("/powerstream-tv/upload")}
        >
          ⬆ Upload Film
        </button>
      </header>

      {error && <div className="ps-tv-error">{error}</div>}

      {loading ? (
        <div className="ps-tv-loading">
          <div className="ps-tv-spinner" />
          <p>Loading PowerStream TV…</p>
        </div>
      ) : (
        <>
          {/* Trending Carousel - show trending or first 10 films */}
          <TrendingCarousel films={trending.length ? trending : films.slice(0, 10)} />

          {/* Category Filter */}
          <FilmCategories
            categories={categories}
            active={activeCategory}
            onChange={setActiveCategory}
          />

          {/* Film Grid */}
          <FilmGrid films={visibleFilms} />

          {/* Empty State */}
          {films.length === 0 && !loading && (
            <div className="ps-tv-empty">
              <p>No films uploaded yet. Be the first to premiere!</p>
              <button 
                className="ps-tv-cta-button"
                onClick={() => navigate("/powerstream-tv/upload")}
              >
                🎬 Upload Your Film
              </button>
            </div>
          )}

          {/* Pagination Info */}
          {pagination.total > 0 && (
            <div className="ps-tv-pagination">
              <p>Showing {films.length} of {pagination.total} films</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
