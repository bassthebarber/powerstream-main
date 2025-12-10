// frontend/src/church/ChurchNetworkHome.jsx
// PowerStream Church Network - Home / Station List

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ChurchNetwork.css";

const API_BASE = import.meta.env.MODE === "development" 
  ? "http://localhost:5001" 
  : (import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001");

export default function ChurchNetworkHome() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, live

  useEffect(() => {
    loadStations();
  }, [filter]);

  const loadStations = async () => {
    try {
      setLoading(true);
      const params = filter === "live" ? "?live=true" : "";
      const res = await fetch(`${API_BASE}/api/church/stations${params}`);
      const data = await res.json();
      
      if (data.success) {
        setStations(data.stations || []);
      } else {
        setError(data.error || "Failed to load stations");
      }
    } catch (err) {
      console.error("[ChurchNetwork] Error:", err);
      setError("Failed to load church stations");
    } finally {
      setLoading(false);
    }
  };

  const liveCount = stations.filter(s => s.isLive).length;

  return (
    <div className="church-wrapper">
      <header className="church-page-header">
        <div className="church-branding">
          <span className="church-logo-icon">⛪</span>
          <div>
            <h1 className="church-title">PowerStream Church Network</h1>
            <p className="church-subtitle">
              Local churches streaming live services and archives through PowerStream
            </p>
          </div>
        </div>
        
        <div className="church-stats">
          <div className="stat-item">
            <span className="stat-value">{stations.length}</span>
            <span className="stat-label">Churches</span>
          </div>
          <div className="stat-item live">
            <span className="stat-value">{liveCount}</span>
            <span className="stat-label">Live Now</span>
          </div>
        </div>
      </header>

      {/* Filter */}
      <div className="church-filters">
        <button 
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Churches
        </button>
        <button 
          className={`filter-btn ${filter === "live" ? "active" : ""}`}
          onClick={() => setFilter("live")}
        >
          🔴 Live Now
        </button>
      </div>

      {loading && (
        <div className="church-loading">
          <div className="spinner"></div>
          <span>Loading churches...</span>
        </div>
      )}

      {error && (
        <div className="church-error">
          ⚠️ {error}
          <button onClick={loadStations}>Retry</button>
        </div>
      )}

      <div className="church-grid">
        {stations.map((s) => (
          <Link key={s._id} to={`/church/${s.slug}`} className="church-card">
            {s.isLive && <div className="live-badge">🔴 LIVE</div>}
            
            <div className="church-logo-wrap">
              {s.logoUrl ? (
                <img src={s.logoUrl} alt={s.name} className="church-logo" />
              ) : (
                <div className="church-logo-placeholder">
                  {s.name?.charAt(0) || "C"}
                </div>
              )}
            </div>
            
            <div className="church-info">
              <h3>{s.name}</h3>
              {s.location && <p className="church-location">📍 {s.location}</p>}
              {s.pastorName && <p className="church-pastor">Pastor {s.pastorName}</p>}
              {s.denomination && <p className="church-denomination">{s.denomination}</p>}
            </div>
            
            {s.regularServices && s.regularServices.length > 0 && (
              <div className="church-schedule">
                {s.regularServices.slice(0, 2).map((svc, i) => (
                  <span key={i} className="schedule-item">
                    {svc.day} {svc.time}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}

        {!loading && stations.length === 0 && (
          <div className="church-empty">
            <span className="empty-icon">⛪</span>
            <p>No church stations found</p>
            <p className="empty-hint">
              {filter === "live" 
                ? "No churches are live right now. Check back during service times!"
                : "Be the first to add your church to the PowerStream Church Network."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

