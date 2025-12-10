// frontend/src/components/tv/stations/NoLimitForeverTV/NoLimitForeverTVPage.jsx
// No Limit Forever TV - Main Streaming Page
// Chief Engineer Architecture - Clean, Professional Layout

import { useEffect, useState } from "react";
import NLFFilmGrid from "./NLFFilmGrid";
import NLFUploadFilm from "./NLFUploadFilm";
import "./NoLimitForeverTV.css";

// API Configuration
const API_BASE = import.meta.env.MODE === "development" 
  ? "http://localhost:5001" 
  : (import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001");

// Content Categories
const CATEGORIES = [
  { key: "all", label: "All", icon: "🎬" },
  { key: "movie", label: "Movies", icon: "🎥" },
  { key: "documentary", label: "Documentaries", icon: "📽️" },
  { key: "series", label: "Series", icon: "📺" },
  { key: "special", label: "Specials", icon: "⭐" },
  { key: "music_video", label: "Music Videos", icon: "🎵" },
  { key: "concert", label: "Concerts", icon: "🎤" },
  { key: "interview", label: "Interviews", icon: "🎙️" },
];

export default function NoLimitForeverTVPage() {
  const [films, setFilms] = useState([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  // Load films from API
  async function loadFilms(selectedCategory = category) {
    try {
      setLoading(true);
      setError("");
      const params = selectedCategory && selectedCategory !== "all"
        ? `?category=${encodeURIComponent(selectedCategory)}`
        : "";
      
      const res = await fetch(`${API_BASE}/api/nlf/films${params}`);
      const json = await res.json();
      
      if (!json.success) throw new Error(json.error || "Failed to load films");
      setFilms(json.films || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFilms("all");
  }, []);

  const handleCategoryClick = (cat) => {
    setCategory(cat);
    loadFilms(cat);
  };

  const handleCreated = () => {
    loadFilms(category);
    setShowUpload(false);
  };

  // Handle film deletion
  const handleDelete = async (filmId, filmTitle) => {
    try {
      const res = await fetch(`${API_BASE}/api/nlf/films/${filmId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      
      if (!json.success) {
        throw new Error(json.error || "Failed to delete film");
      }
      
      // Remove from local state immediately for smooth UX
      setFilms(prev => prev.filter(f => f._id !== filmId));
      console.log(`✅ Deleted: ${filmTitle}`);
    } catch (err) {
      console.error("Delete failed:", err);
      alert(`Failed to delete "${filmTitle}": ${err.message}`);
      throw err;
    }
  };

  return (
    <div className="nlf-page">
      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION - Logo & Branding
          ═══════════════════════════════════════════════════════════ */}
      <section className="nlf-hero-section">
        <div className="nlf-logo-container">
          <img 
            src="/logos/nolimit-forever.logo.png.png"
            alt="No Limit Forever" 
            className="nlf-main-logo"
          />
        </div>
        <h1 className="nlf-main-title">NO LIMIT FOREVER TV</h1>
        <p className="nlf-tagline">Exclusive Films • Documentaries • Music Cinema</p>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CONTROL BAR - Categories & Upload
          ═══════════════════════════════════════════════════════════ */}
      <section className="nlf-control-bar">
        <div className="nlf-categories">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              className={`nlf-cat-btn ${category === c.key ? "active" : ""}`}
              onClick={() => handleCategoryClick(c.key)}
            >
              <span className="cat-icon">{c.icon}</span>
              <span className="cat-label">{c.label}</span>
            </button>
          ))}
        </div>
        <button 
          className="nlf-upload-btn"
          onClick={() => setShowUpload(!showUpload)}
        >
          {showUpload ? "✕ Close" : "➕ Upload Content"}
        </button>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          MAIN CONTENT AREA
          ═══════════════════════════════════════════════════════════ */}
      <main className="nlf-main-content">
        {/* Film Grid */}
        <div className={`nlf-grid-area ${showUpload ? 'with-sidebar' : ''}`}>
          {loading && (
            <div className="nlf-loading">
              <div className="nlf-spinner" />
              <span>Loading catalog…</span>
            </div>
          )}
          {error && (
            <div className="nlf-error">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
              <button onClick={() => loadFilms(category)}>Retry</button>
            </div>
          )}
          {!loading && !error && (
            <NLFFilmGrid 
              films={films} 
              emptyMessage="No content yet. Upload the first film!"
              onDelete={handleDelete}
              showDelete={true}
            />
          )}
        </div>

        {/* Upload Panel */}
        {showUpload && (
          <aside className="nlf-upload-panel-container">
            <NLFUploadFilm 
              onCreated={handleCreated} 
              onCancel={() => setShowUpload(false)} 
            />
          </aside>
        )}
      </main>
    </div>
  );
}
