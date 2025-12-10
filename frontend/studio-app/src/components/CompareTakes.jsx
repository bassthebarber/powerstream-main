// frontend/studio-app/src/components/CompareTakes.jsx

import React, { useEffect, useState } from "react";
import "./CompareTakes.css";
import { API_BASE as MAIN_API } from "../config/api.js";

// AI Coach endpoints are on the main PowerStream API
const API_BASE = MAIN_API;

const CompareTakes = ({ artistName, trackTitle, onSelectTake }) => {
  const [takes, setTakes] = useState([]);
  const [bestTakeId, setBestTakeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecentTakes = async () => {
    if (!artistName || !trackTitle) {
      setTakes([]);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        artistName,
        trackTitle,
        limit: "3",
      });
      const res = await fetch(`${API_BASE}/api/aicoach/takes/recent?${params}`);
      if (!res.ok) throw new Error("Failed to fetch takes");
      const data = await res.json();
      setTakes(data.takes || []);
      setBestTakeId(data.bestTakeId);
    } catch (err) {
      setError(err.message);
      setTakes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentTakes();
  }, [artistName, trackTitle]);

  // Get score color based on value
  const getScoreColor = (score) => {
    if (score >= 85) return "#00c864"; // green
    if (score >= 70) return "#e6b800"; // gold
    if (score >= 50) return "#ff9944"; // orange
    return "#ff5555"; // red
  };

  // Format date
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (!artistName || !trackTitle) {
    return (
      <div className="compare-takes-card">
        <h3 className="compare-takes-title">Compare Takes</h3>
        <p className="compare-takes-hint">
          Enter artist name and track title above, then analyze some takes to compare them here.
        </p>
      </div>
    );
  }

  return (
    <div className="compare-takes-card">
      <div className="compare-takes-header">
        <h3 className="compare-takes-title">Compare Takes</h3>
        <button
          className="compare-takes-refresh"
          onClick={fetchRecentTakes}
          disabled={loading}
          title="Refresh takes"
        >
          🔄
        </button>
      </div>
      <p className="compare-takes-subtitle">
        Your last 3 analyzed takes for "{trackTitle}"
      </p>

      {error && <div className="compare-takes-error">{error}</div>}

      {loading ? (
        <div className="compare-takes-loading">Loading takes...</div>
      ) : takes.length === 0 ? (
        <div className="compare-takes-empty">
          No analyzed takes yet. Record and analyze a take to see it here!
        </div>
      ) : (
        <div className="compare-takes-list">
          {takes.map((take, idx) => {
            const isBest = take._id === bestTakeId;
            const overallScore = take.scores?.overall || 0;

            return (
              <div
                key={take._id}
                className={`compare-takes-item ${isBest ? "compare-takes-item--best" : ""}`}
                onClick={() => onSelectTake && onSelectTake(take)}
              >
                {isBest && <div className="compare-takes-best-badge">🏆 BEST</div>}
                
                <div className="compare-takes-item-header">
                  <span className="compare-takes-take-num">Take #{takes.length - idx}</span>
                  <span className="compare-takes-date">{formatDate(take.createdAt)}</span>
                </div>

                <div className="compare-takes-overall">
                  <span
                    className="compare-takes-overall-score"
                    style={{ color: getScoreColor(overallScore) }}
                  >
                    {overallScore}
                  </span>
                  <span className="compare-takes-overall-label">Overall</span>
                </div>

                <div className="compare-takes-scores-mini">
                  <div className="compare-takes-score-mini">
                    <span className="compare-takes-score-label">DEL</span>
                    <span className="compare-takes-score-val">{take.scores?.delivery || "-"}</span>
                  </div>
                  <div className="compare-takes-score-mini">
                    <span className="compare-takes-score-label">CLR</span>
                    <span className="compare-takes-score-val">{take.scores?.clarity || "-"}</span>
                  </div>
                  <div className="compare-takes-score-mini">
                    <span className="compare-takes-score-label">EMO</span>
                    <span className="compare-takes-score-val">{take.scores?.emotion || "-"}</span>
                  </div>
                  <div className="compare-takes-score-mini">
                    <span className="compare-takes-score-label">FLW</span>
                    <span className="compare-takes-score-val">{take.scores?.flow || "-"}</span>
                  </div>
                </div>

                <div className="compare-takes-coach-mode">
                  Coach: {take.coachMode || "standard"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {takes.length > 0 && bestTakeId && (
        <div className="compare-takes-summary">
          <span className="compare-takes-summary-icon">💡</span>
          <span className="compare-takes-summary-text">
            Your best take scored{" "}
            <strong style={{ color: "#e6b800" }}>
              {takes.find((t) => t._id === bestTakeId)?.scores?.overall || 0}
            </strong>{" "}
            overall. Keep pushing for that 90+!
          </span>
        </div>
      )}
    </div>
  );
};

export default CompareTakes;



