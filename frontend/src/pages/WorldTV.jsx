// frontend/src/pages/WorldTV.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

export default function WorldTV() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("all");

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tv-stations/world`);
      const data = await res.json();
      if (data.ok) {
        setStations(data.stations || []);
      }
    } catch (err) {
      console.error("Error fetching worldwide stations:", err);
    } finally {
      setLoading(false);
    }
  };

  const regions = ["all", ...new Set(stations.map((s) => s.region || s.country || "Other").filter(Boolean))];
  const filteredStations =
    selectedRegion === "all"
      ? stations
      : stations.filter((s) => (s.region || s.country) === selectedRegion);

  // Group by category for better organization
  const stationsByCategory = filteredStations.reduce((acc, station) => {
    const cat = station.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(station);
    return acc;
  }, {});

  return (
    <div className="ps-page">
      <h1>Worldwide TV</h1>
      <p className="ps-subtitle">International broadcast stations from around the globe</p>

      <div style={{ marginBottom: 24, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {regions.map((region) => (
          <button
            key={region}
            onClick={() => setSelectedRegion(region)}
            style={{
              padding: "8px 16px",
              background: selectedRegion === region ? "var(--gold)" : "rgba(255,255,255,0.1)",
              color: selectedRegion === region ? "#000" : "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: selectedRegion === region ? 600 : 400,
            }}
          >
            {region.charAt(0).toUpperCase() + region.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: "center", opacity: 0.7 }}>Loading stations...</p>
      ) : filteredStations.length === 0 ? (
        <p style={{ textAlign: "center", opacity: 0.7 }}>No stations in this region yet</p>
      ) : (
        Object.entries(stationsByCategory).map(([category, categoryStations]) => (
          <div key={category} style={{ marginBottom: 48 }}>
            <h2 style={{ marginBottom: 16, fontSize: "1.5rem", color: "var(--gold)" }}>{category}</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 24,
              }}
            >
              {categoryStations.map((station) => (
                <Link
                  key={station._id}
                  to={`/tv-stations/${station.slug || station.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="ps-tile"
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: 24,
                    minHeight: 250,
                  }}
                >
                  {station.logoUrl && (
                    <img
                      src={station.logoUrl}
                      alt={station.name}
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: "contain",
                        marginBottom: 16,
                      }}
                    />
                  )}
                  <h3 style={{ marginBottom: 8, textAlign: "center" }}>{station.name}</h3>
                  {(station.region || station.country) && (
                    <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 8, textAlign: "center" }}>
                      🌍 {station.region || station.country}
                    </p>
                  )}
                  {station.description && (
                    <p style={{ fontSize: 13, opacity: 0.8, textAlign: "center", marginTop: "auto" }}>
                      {station.description.substring(0, 100)}...
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

