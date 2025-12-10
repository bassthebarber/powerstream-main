import React from "react";
import { Link } from "react-router-dom";
import { STATIONS } from "../constants/stations.js";

export default function TVStationsPage() {
  return (
    <div className="ps-page">
      <header style={{ textAlign: "center", marginBottom: 32 }}>
        <h1>TV Stations Hub</h1>
        <p className="ps-subtitle">
          Browse live channels, recorded content, and program guides
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        {STATIONS.map((station) => (
          <Link
            key={station.id}
            to={`/stations/${station.slug}`}
            className="ps-card"
            style={{
              textDecoration: "none",
              color: "inherit",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {station.isLive && (
              <span
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  padding: "4px 8px",
                  borderRadius: 999,
                  background: "rgba(255,0,0,0.85)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                🔴 Live
              </span>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 120,
                marginBottom: 12,
                background: "rgba(255,255,255,0.02)",
                borderRadius: 12,
              }}
            >
              {station.logo ? (
                <img
                  src={station.logo}
                  alt={station.name}
                  style={{
                    maxWidth: 200,
                    maxHeight: 80,
                    objectFit: "contain",
                  }}
                />
              ) : (
                <span style={{ fontWeight: 700 }}>{station.name}</span>
              )}
            </div>
            <h3 style={{ fontSize: 16, marginBottom: 6 }}>{station.name}</h3>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>
              {station.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
