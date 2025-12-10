import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchShows } from "../lib/api.js";
import TVGuideGrid from "../components/TVGuideGrid.jsx";
import LiveNow from "../components/LiveNow.jsx";

const gold = "#ffb84d";

export default function TVGuide() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadShows();
  }, []);

  const loadShows = async () => {
    try {
      setLoading(true);
      setError("");
      // Fetch upcoming shows (default behavior from API)
      const data = await fetchShows({ limit: 200 });
      if (data?.ok && Array.isArray(data.shows)) {
        setShows(data.shows);
      } else {
        setError("Failed to load shows");
      }
    } catch (err) {
      console.error("Error loading shows:", err);
      setError("Failed to load TV guide");
    } finally {
      setLoading(false);
    }
  };

  const handleShowClick = (show) => {
    if (show._id) {
      navigate(`/shows/${show._id}`);
    } else if (show.stationId?.slug) {
      navigate(`/tv-stations/${show.stationId.slug}`);
    } else if (show.stationId?._id) {
      navigate(`/tv-stations/${show.stationId._id}`);
    }
  };

  return (
    <div className="ps-page">
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ color: gold, marginBottom: 8 }}>TV Guide</h1>
        <p className="ps-subtitle">Browse scheduled shows across all stations</p>
      </header>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
          Loading TV guide...
        </div>
      ) : error ? (
        <div
          style={{
            padding: "16px",
            borderRadius: 8,
            background: "rgba(239,68,68,0.15)",
            border: "1px solid #ef4444",
            color: "#ef4444",
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      ) : shows.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
          <p>No scheduled shows available.</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>
            Check back later for upcoming programming.
          </p>
        </div>
      ) : (
        <>
          <LiveNow />
          <TVGuideGrid shows={shows} onShowClick={handleShowClick} />
        </>
      )}
    </div>
  );
}

