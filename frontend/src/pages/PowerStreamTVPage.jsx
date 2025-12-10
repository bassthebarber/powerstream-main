import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api.js";
import { STATIONS } from "../constants/stations.js";

// Film categories for Netflix-style rows
const CATEGORIES = [
  { id: "drama", name: "Drama", icon: "🎭" },
  { id: "documentary", name: "Documentary", icon: "🎬" },
  { id: "comedy", name: "Comedy", icon: "😂" },
  { id: "action", name: "Action & Thriller", icon: "💥" },
  { id: "local", name: "Local Creators", icon: "🌟" },
  { id: "music", name: "Music & Concerts", icon: "🎵" },
];

// Mock films for demo
const MOCK_FILMS = [
  { _id: "f1", title: "East Side Story", category: "drama", posterUrl: null, duration: "1h 45m", rating: "TV-14" },
  { _id: "f2", title: "Houston Dreams", category: "documentary", posterUrl: null, duration: "52m", rating: "TV-G" },
  { _id: "f3", title: "The Come Up", category: "music", posterUrl: null, duration: "1h 22m", rating: "TV-PG" },
  { _id: "f4", title: "Southern Laughs", category: "comedy", posterUrl: null, duration: "45m", rating: "TV-14" },
  { _id: "f5", title: "Street Legends", category: "action", posterUrl: null, duration: "2h 10m", rating: "TV-MA" },
  { _id: "f6", title: "Hometown Heroes", category: "local", posterUrl: null, duration: "35m", rating: "TV-G" },
];

export default function PowerStreamTVPage() {
  const navigate = useNavigate();
  const [films, setFilms] = useState(MOCK_FILMS);
  const [loading, setLoading] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState(null);

  useEffect(() => {
    // Try to fetch real films from API
    const fetchFilms = async () => {
      try {
        const res = await api.get("/films?limit=30");
        if (res.data?.films && res.data.films.length > 0) {
          setFilms(res.data.films);
        }
      } catch (err) {
        // Use mock data
        console.log("Films API not available, using demo data");
      }
    };
    fetchFilms();
  }, []);

  const getFilmsByCategory = (categoryId) => {
    return films.filter(f => f.category === categoryId);
  };

  return (
    <div className="pstv-page">
      {/* Hero Section */}
      <header className="pstv-hero">
        <div className="pstv-hero-content">
          <h1>🎬 PowerStream TV</h1>
          <p className="pstv-hero-subtitle">
            Independent films, original series, and exclusive content from creators worldwide.
          </p>
          <div className="pstv-hero-actions">
            <Link to="/stations" className="pstv-btn pstv-btn--primary">
              📺 Live Stations
            </Link>
            <button 
              className="pstv-btn pstv-btn--secondary"
              onClick={() => {
                // TODO: Open filmmaker onboarding
                window.location.href = "mailto:SPSStreamNetwork@gmail.com?subject=Filmmaker%20Submission&body=I%20would%20like%20to%20submit%20my%20film%20to%20PowerStream%20TV.";
              }}
            >
              🎥 Submit Your Film
            </button>
          </div>
        </div>
      </header>

      {/* Featured Stations Row */}
      <section className="pstv-section">
        <h2 className="pstv-section-title">📺 Featured Stations</h2>
        <div className="pstv-stations-row">
          {STATIONS.slice(0, 5).map((station) => (
            <Link 
              key={station.id}
              to={`/stations/${station.slug}`}
              className="pstv-station-card"
            >
              <div className="pstv-station-logo">
                {station.logo ? (
                  <img src={station.logo} alt={station.name} />
                ) : (
                  <span>{station.name[0]}</span>
                )}
              </div>
              <div className="pstv-station-name">{station.name}</div>
              {station.isLive && <span className="pstv-live-badge">🔴 LIVE</span>}
            </Link>
          ))}
        </div>
      </section>

      {/* Netflix-style Category Rows */}
      {CATEGORIES.map((category) => {
        const categoryFilms = getFilmsByCategory(category.id);
        if (categoryFilms.length === 0) {
          // Show placeholder if no films in category
          return (
            <section key={category.id} className="pstv-section">
              <h2 className="pstv-section-title">{category.icon} {category.name}</h2>
              <div className="pstv-films-row">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="pstv-film-card pstv-film-card--placeholder">
                    <div className="pstv-film-poster">
                      <span>{category.icon}</span>
                    </div>
                    <div className="pstv-film-title">Coming Soon</div>
                  </div>
                ))}
              </div>
            </section>
          );
        }
        
        return (
          <section key={category.id} className="pstv-section">
            <h2 className="pstv-section-title">{category.icon} {category.name}</h2>
            <div className="pstv-films-row">
              {categoryFilms.map((film) => (
                <div 
                  key={film._id}
                  className="pstv-film-card"
                  onClick={() => setSelectedFilm(film)}
                >
                  <div className="pstv-film-poster">
                    {film.posterUrl ? (
                      <img src={film.posterUrl} alt={film.title} />
                    ) : (
                      <div className="pstv-film-poster-placeholder">
                        <span>🎬</span>
                      </div>
                    )}
                    <div className="pstv-film-overlay">
                      <button className="pstv-play-btn">▶</button>
                    </div>
                  </div>
                  <div className="pstv-film-info">
                    <div className="pstv-film-title">{film.title}</div>
                    <div className="pstv-film-meta">
                      {film.duration} • {film.rating}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* Film Detail Modal */}
      {selectedFilm && (
        <div className="pstv-modal-overlay" onClick={() => setSelectedFilm(null)}>
          <div className="pstv-modal" onClick={(e) => e.stopPropagation()}>
            <button className="pstv-modal-close" onClick={() => setSelectedFilm(null)}>×</button>
            <div className="pstv-modal-poster">
              {selectedFilm.posterUrl ? (
                <img src={selectedFilm.posterUrl} alt={selectedFilm.title} />
              ) : (
                <div className="pstv-modal-poster-placeholder">🎬</div>
              )}
            </div>
            <div className="pstv-modal-content">
              <h2>{selectedFilm.title}</h2>
              <div className="pstv-modal-meta">
                <span>{selectedFilm.duration}</span>
                <span>{selectedFilm.rating}</span>
                <span className="pstv-modal-category">{selectedFilm.category}</span>
              </div>
              <p className="pstv-modal-desc">
                {selectedFilm.description || "An original PowerStream TV production. More details coming soon."}
              </p>
              <div className="pstv-modal-actions">
                <button className="pstv-btn pstv-btn--primary">▶ Play</button>
                <button className="pstv-btn pstv-btn--secondary">+ My List</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .pstv-page {
          min-height: 100vh;
          background: #0a0a0b;
        }
        
        .pstv-hero {
          background: linear-gradient(135deg, #1a1a1f 0%, #0a0a0b 100%);
          padding: 60px 32px;
          text-align: center;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        
        .pstv-hero h1 {
          font-size: 2.5rem;
          margin: 0 0 16px;
        }
        
        .pstv-hero-subtitle {
          font-size: 1.1rem;
          color: var(--muted);
          max-width: 600px;
          margin: 0 auto 32px;
        }
        
        .pstv-hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .pstv-btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        
        .pstv-btn--primary {
          background: var(--gold);
          color: #000;
          border: none;
        }
        
        .pstv-btn--secondary {
          background: transparent;
          color: #fff;
          border: 1px solid rgba(255,255,255,0.3);
        }
        
        .pstv-btn:hover {
          transform: translateY(-2px);
        }
        
        .pstv-section {
          padding: 32px;
        }
        
        .pstv-section-title {
          font-size: 1.3rem;
          margin: 0 0 20px;
          color: #fff;
        }
        
        .pstv-stations-row {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 16px;
        }
        
        .pstv-station-card {
          flex: 0 0 auto;
          width: 160px;
          padding: 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          text-align: center;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
          position: relative;
        }
        
        .pstv-station-card:hover {
          background: rgba(255,255,255,0.06);
          border-color: var(--gold);
        }
        
        .pstv-station-logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 12px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .pstv-station-logo img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        .pstv-station-name {
          font-size: 13px;
          font-weight: 600;
        }
        
        .pstv-live-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 10px;
        }
        
        .pstv-films-row {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 16px;
        }
        
        .pstv-film-card {
          flex: 0 0 auto;
          width: 180px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .pstv-film-card:hover {
          transform: scale(1.05);
        }
        
        .pstv-film-poster {
          width: 180px;
          height: 270px;
          border-radius: 8px;
          background: linear-gradient(135deg, #2a2a30 0%, #1a1a1f 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        
        .pstv-film-poster img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .pstv-film-poster-placeholder {
          font-size: 48px;
          opacity: 0.3;
        }
        
        .pstv-film-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .pstv-film-card:hover .pstv-film-overlay {
          opacity: 1;
        }
        
        .pstv-play-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--gold);
          border: none;
          font-size: 20px;
          cursor: pointer;
        }
        
        .pstv-film-info {
          padding: 12px 0;
        }
        
        .pstv-film-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .pstv-film-meta {
          font-size: 12px;
          color: var(--muted);
        }
        
        .pstv-film-card--placeholder .pstv-film-poster {
          opacity: 0.4;
        }
        
        .pstv-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        
        .pstv-modal {
          background: #1a1a1f;
          border-radius: 16px;
          max-width: 800px;
          width: 100%;
          display: flex;
          overflow: hidden;
          position: relative;
        }
        
        .pstv-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0,0,0,0.5);
          border: none;
          color: #fff;
          font-size: 20px;
          cursor: pointer;
          z-index: 10;
        }
        
        .pstv-modal-poster {
          width: 300px;
          min-height: 400px;
          background: #2a2a30;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .pstv-modal-poster img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .pstv-modal-poster-placeholder {
          font-size: 80px;
          opacity: 0.3;
        }
        
        .pstv-modal-content {
          flex: 1;
          padding: 32px;
        }
        
        .pstv-modal-content h2 {
          margin: 0 0 16px;
          font-size: 1.8rem;
        }
        
        .pstv-modal-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          color: var(--muted);
          font-size: 14px;
        }
        
        .pstv-modal-category {
          text-transform: capitalize;
        }
        
        .pstv-modal-desc {
          color: var(--muted);
          line-height: 1.6;
          margin-bottom: 24px;
        }
        
        .pstv-modal-actions {
          display: flex;
          gap: 12px;
        }
        
        @media (max-width: 768px) {
          .pstv-modal {
            flex-direction: column;
          }
          
          .pstv-modal-poster {
            width: 100%;
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
}
