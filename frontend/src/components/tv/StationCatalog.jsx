// frontend/src/components/tv/StationCatalog.jsx
// Universal Station Video Catalog Component

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./StationCatalog.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

export default function StationCatalog() {
  const { stationId } = useParams();
  const navigate = useNavigate();
  
  const [station, setStation] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playingVideo, setPlayingVideo] = useState(null);

  useEffect(() => {
    if (!stationId) {
      setError("No station ID provided");
      setLoading(false);
      return;
    }

    async function fetchCatalog() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/api/tv/${stationId}/catalog`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || data.error || "Failed to load catalog");
        }

        setStation(data.station);
        setVideos(data.videos || []);
      } catch (err) {
        console.error("[StationCatalog] Error:", err);
        setError(err.message || "Failed to load station catalog");
      } finally {
        setLoading(false);
      }
    }

    fetchCatalog();
  }, [stationId]);

  const handlePlayVideo = (video) => {
    setPlayingVideo(video);
  };

  const closePlayer = () => {
    setPlayingVideo(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="station-catalog loading">
        <div className="catalog-spinner" />
        <p>Loading catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="station-catalog error">
        <div className="error-icon">⚠️</div>
        <h2>Error Loading Catalog</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="station-catalog">
      {/* Video Player Modal */}
      {playingVideo && (
        <div className="video-player-modal" onClick={closePlayer}>
          <div className="video-player-container" onClick={(e) => e.stopPropagation()}>
            <button className="close-player" onClick={closePlayer}>×</button>
            <video
              controls
              autoPlay
              src={playingVideo.url || playingVideo.videoUrl}
              poster={playingVideo.thumbnail || playingVideo.thumbnailUrl}
            >
              Your browser does not support video playback.
            </video>
            <div className="video-player-info">
              <h3>{playingVideo.title}</h3>
              {playingVideo.description && <p>{playingVideo.description}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Station Header */}
      <header className="catalog-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
        
        <div className="station-info">
          {station?.logo && (
            <img 
              src={station.logo} 
              alt={station.name} 
              className="station-logo"
            />
          )}
          <div className="station-details">
            <h1>{station?.name || "Station Catalog"}</h1>
            {station?.description && (
              <p className="station-description">{station.description}</p>
            )}
            <div className="station-meta">
              {station?.category && (
                <span className="category-badge">{station.category}</span>
              )}
              {station?.isLive && (
                <span className="live-badge">🔴 LIVE</span>
              )}
              <span className="video-count">{videos.length} video{videos.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Video Grid */}
      <main className="catalog-content">
        {videos.length === 0 ? (
          <div className="empty-catalog">
            <div className="empty-icon">📺</div>
            <h3>No Videos Yet</h3>
            <p>This station hasn't uploaded any videos yet.</p>
            <p>Check back later for new content!</p>
          </div>
        ) : (
          <div className="video-grid">
            {videos.map((video, index) => (
              <div 
                key={video._id || index} 
                className="video-card"
                onClick={() => handlePlayVideo(video)}
              >
                <div className="video-thumbnail-wrapper">
                  {video.thumbnail || video.thumbnailUrl ? (
                    <img
                      src={video.thumbnail || video.thumbnailUrl}
                      alt={video.title}
                      className="video-thumbnail"
                    />
                  ) : (
                    <div className="video-thumbnail placeholder">
                      <span>📹</span>
                    </div>
                  )}
                  <button className="play-button">▶</button>
                  {video.duration && (
                    <span className="video-duration">
                      {formatDuration(video.duration || video.durationSeconds)}
                    </span>
                  )}
                </div>
                <div className="video-info">
                  <h4 className="video-title">{video.title || "Untitled Video"}</h4>
                  {video.description && (
                    <p className="video-description">
                      {video.description.length > 80 
                        ? video.description.slice(0, 80) + "..." 
                        : video.description}
                    </p>
                  )}
                  <div className="video-meta">
                    {(video.uploadedAt || video.createdAt) && (
                      <span className="video-date">
                        {formatDate(video.uploadedAt || video.createdAt)}
                      </span>
                    )}
                    {video.views > 0 && (
                      <span className="video-views">
                        👁 {video.views.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


