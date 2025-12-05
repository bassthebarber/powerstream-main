// frontend/src/components/powergram/GramGrid.jsx
// Standalone grid component - can be embedded in other pages
import React, { useEffect, useState } from "react";
import api from "../../lib/api.js";
import GramModal from "../GramModal.jsx";
import "../../styles/powergram.css";

export default function GramGrid({ limit = 30 }) {
  const [grams, setGrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGram, setSelectedGram] = useState(null);

  useEffect(() => {
    fetchGrams();
  }, [limit]);

  const fetchGrams = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/powergram?limit=${limit}`);
      if (res.data?.ok) {
        setGrams(res.data.grams || []);
      } else if (res.data?.grams) {
        setGrams(res.data.grams);
      } else if (Array.isArray(res.data)) {
        setGrams(res.data);
      }
    } catch (err) {
      console.error("Error fetching grams:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pg-loading">
        <div className="pg-loading-spinner"></div>
        <span>Loading photos...</span>
      </div>
    );
  }

  if (grams.length === 0) {
    return (
      <div className="pg-empty">
        <div className="pg-empty-icon">📸</div>
        <h3>No photos yet</h3>
        <p>Be the first to share a moment</p>
      </div>
    );
  }

  return (
    <>
      <div className="pg-grid">
        {grams.map((gram) => (
          <GramTile
            key={gram._id || gram.id}
            gram={gram}
            onClick={() => setSelectedGram(gram)}
          />
        ))}
      </div>

      {selectedGram && (
        <GramModal
          gram={selectedGram}
          onClose={() => setSelectedGram(null)}
          onUpdate={fetchGrams}
        />
      )}
    </>
  );
}

function GramTile({ gram, onClick }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="pg-tile" onClick={onClick}>
      <div className="pg-tile-image-wrapper">
        {!loaded && !error && (
          <div className="pg-tile-placeholder">
            <div className="pg-loading-spinner pg-loading-spinner--small"></div>
          </div>
        )}
        {error ? (
          <div className="pg-tile-error">
            <span>📸</span>
          </div>
        ) : (
          <img
            src={gram.imageUrl || gram.mediaUrl}
            alt={gram.caption || "Photo"}
            className={`pg-tile-image ${loaded ? "pg-tile-image--loaded" : ""}`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        )}
      </div>

      <div className="pg-tile-overlay">
        <div className="pg-tile-stats">
          <span className="pg-tile-stat">
            <span>❤️</span>
            <span>{gram.likes?.length || 0}</span>
          </span>
          <span className="pg-tile-stat">
            <span>💬</span>
            <span>{gram.comments?.length || 0}</span>
          </span>
        </div>
      </div>

      {gram.mediaType === "video" && (
        <div className="pg-tile-video-badge">▶</div>
      )}
    </div>
  );
}
