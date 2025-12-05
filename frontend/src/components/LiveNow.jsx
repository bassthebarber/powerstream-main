import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchShows } from "../lib/api.js";

const gold = "#ffb84d";

export default function LiveNow({ stationId }) {
  const [currentShow, setCurrentShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkForLiveShow();
    // Check every minute for new shows
    const interval = setInterval(checkForLiveShow, 60000);
    return () => clearInterval(interval);
  }, [stationId]);

  const checkForLiveShow = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const params = stationId ? { stationId } : {};
      
      // Fetch shows that might be live (within last hour to next hour window)
      const startDate = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
      const endDate = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

      const data = await fetchShows({
        ...params,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 50,
      });

      if (data?.ok && Array.isArray(data.shows)) {
        // Find show that is currently live (now is between startTime and endTime)
        const liveShow = data.shows.find((show) => {
          const start = new Date(show.startTime);
          const end = new Date(show.endTime);
          return now >= start && now <= end;
        });

        setCurrentShow(liveShow || null);
      }
    } catch (err) {
      console.error("Error checking for live show:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchNow = () => {
    if (currentShow?._id) {
      navigate(`/shows/${currentShow._id}`);
    } else if (currentShow?.stationId?.slug) {
      navigate(`/tv-stations/${currentShow.stationId.slug}`);
    }
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (!currentShow) {
    return null; // No live show, don't render anything
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(255,184,77,0.15))",
        border: "1px solid rgba(239,68,68,0.3)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              background: "#ef4444",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            🔴 LIVE
          </span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>Now Playing</span>
        </div>
        <h3
          style={{
            margin: 0,
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "#fff",
          }}
        >
          {currentShow.title}
        </h3>
        {currentShow.description && (
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: 13,
              color: "var(--muted)",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {currentShow.description}
          </p>
        )}
      </div>
      <button
        onClick={handleWatchNow}
        style={{
          padding: "10px 20px",
          background: gold,
          color: "#000",
          border: "none",
          borderRadius: 8,
          fontWeight: 700,
          cursor: "pointer",
          fontSize: 14,
          whiteSpace: "nowrap",
        }}
      >
        Watch Now →
      </button>
    </div>
  );
}


