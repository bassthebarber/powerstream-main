// frontend/src/schools/SchoolNetworkHome.jsx
// PowerStream School Network - Home / Station List

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./SchoolNetwork.css";

const API_BASE = import.meta.env.MODE === "development" 
  ? "http://localhost:5001" 
  : (import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001");

export default function SchoolNetworkHome() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("");

  useEffect(() => {
    loadStations();
  }, [filter, districtFilter]);

  const loadStations = async () => {
    try {
      setLoading(true);
      let params = [];
      if (filter === "live") params.push("live=true");
      if (districtFilter) params.push(`district=${encodeURIComponent(districtFilter)}`);
      const queryString = params.length > 0 ? `?${params.join("&")}` : "";
      
      const res = await fetch(`${API_BASE}/api/schools/stations${queryString}`);
      const data = await res.json();
      
      if (data.success) {
        setStations(data.stations || []);
      } else {
        setError(data.error || "Failed to load stations");
      }
    } catch (err) {
      console.error("[SchoolNetwork] Error:", err);
      setError("Failed to load school stations");
    } finally {
      setLoading(false);
    }
  };

  const liveCount = stations.filter(s => s.isLive).length;
  const districts = [...new Set(stations.map(s => s.district).filter(Boolean))];

  return (
    <div className="school-wrapper">
      <header className="school-page-header">
        <div className="school-branding">
          <span className="school-logo-icon">🏫</span>
          <div>
            <h1 className="school-title">PowerStream School Network</h1>
            <p className="school-subtitle">
              Local schools streaming football, basketball, graduations, pep rallies, and more
            </p>
          </div>
        </div>
        
        <div className="school-stats">
          <div className="stat-item">
            <span className="stat-value">{stations.length}</span>
            <span className="stat-label">Schools</span>
          </div>
          <div className="stat-item live">
            <span className="stat-value">{liveCount}</span>
            <span className="stat-label">Live Now</span>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="school-filters">
        <button 
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Schools
        </button>
        <button 
          className={`filter-btn ${filter === "live" ? "active" : ""}`}
          onClick={() => setFilter("live")}
        >
          🔴 Live Now
        </button>
        
        {districts.length > 0 && (
          <select 
            className="district-filter"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
          >
            <option value="">All Districts</option>
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}
      </div>

      {loading && (
        <div className="school-loading">
          <div className="spinner"></div>
          <span>Loading schools...</span>
        </div>
      )}

      {error && (
        <div className="school-error">
          ⚠️ {error}
          <button onClick={loadStations}>Retry</button>
        </div>
      )}

      <div className="school-grid">
        {stations.map((s) => (
          <Link key={s._id} to={`/schools/${s.slug}`} className="school-card">
            {s.isLive && <div className="live-badge">🔴 LIVE</div>}
            
            <div className="school-logo-wrap">
              {s.logoUrl ? (
                <img src={s.logoUrl} alt={s.name} className="school-logo" />
              ) : (
                <div className="school-logo-placeholder">
                  {s.name?.charAt(0) || "S"}
                </div>
              )}
            </div>
            
            <div className="school-info">
              <h3>{s.name}</h3>
              {s.district && <p className="school-district">{s.district}</p>}
              {s.mascot && <p className="school-mascot">🐾 {s.mascot}</p>}
              {s.location && <p className="school-location">📍 {s.location}</p>}
              {s.colors && <p className="school-colors">🎨 {s.colors}</p>}
            </div>
            
            {s.classification && (
              <div className="school-classification">
                <span className="classification-badge">{s.classification}</span>
              </div>
            )}
          </Link>
        ))}

        {!loading && stations.length === 0 && (
          <div className="school-empty">
            <span className="empty-icon">🏫</span>
            <p>No school stations found</p>
            <p className="empty-hint">
              {filter === "live" 
                ? "No schools are live right now. Check back during game time!"
                : "Be the first to add your school to the PowerStream School Network."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


