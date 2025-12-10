// frontend/src/pages/TVStations.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api.js";

export default function TVStations() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const res = await api.get("/tv-stations");
      if (res.data?.ok) {
        setStations(res.data.stations || []);
      } else if (res.data?.stations) {
        setStations(res.data.stations);
      }
    } catch (err) {
      console.error("Error fetching stations:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ps-page">
      <h1>TV Stations</h1>
      <p className="ps-subtitle">Global streaming stations - Live & Recorded</p>

      {loading ? (
        <p style={{ textAlign: "center", opacity: 0.7 }}>Loading stations...</p>
      ) : stations.length === 0 ? (
        <p style={{ textAlign: "center", opacity: 0.7 }}>No stations available yet</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 24,
            marginTop: 32,
          }}
        >
          {stations.map((station) => (
            <Link
              key={station._id}
              to={`/tv-stations/${station.slug || station.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="ps-tile"
              style={{ textDecoration: "none", display: "block" }}
            >
              {station.logoUrl && (
                <img
                  src={station.logoUrl}
                  alt={station.name}
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "contain",
                    marginBottom: 16,
                  }}
                />
              )}
              <h3 style={{ marginBottom: 8 }}>{station.name}</h3>
              {station.description && (
                <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>{station.description}</p>
              )}
              {station.isLive && (
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 8px",
                    background: "red",
                    color: "#fff",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  LIVE
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}




