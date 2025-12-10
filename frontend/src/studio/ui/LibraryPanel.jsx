// frontend/src/studio/ui/LibraryPanel.jsx
// Studio Library Panel - Masters, Songs, Recordings, Beats tabs

import React, { useState, useEffect, useCallback } from "react";
import { useStudioAudio } from "../StudioAudioContext.jsx";
import RecordingList from "../components/RecordingList.jsx";
import "./LibraryPanel.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

const TABS = [
  { key: "masters", label: "Masters", icon: "💿" },
  { key: "songs", label: "Songs", icon: "🎵" },
  { key: "recordings", label: "Recordings", icon: "🎤" },
  { key: "beats", label: "Beats", icon: "🥁" },
];

export default function LibraryPanel({ 
  onLoadItem,
  onLoadMaster,
  onLoadRecording,
  onLoadBeat,
}) {
  // Get shared audio context
  const { playAudio, stopAudio, setCurrentTrack, currentTrack, isPlaying } = useStudioAudio();
  
  const [activeTab, setActiveTab] = useState("masters");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [playingId, setPlayingId] = useState(null);

  // Load library for tab
  const loadLibrary = useCallback(async (tab) => {
    try {
      setLoading(true);
      setError("");
      
      const res = await fetch(`${API_BASE}/api/studio/library?tab=${tab}&limit=50`);
      const data = await res.json();
      
      if (data.success) {
        setItems(data.items || []);
      } else {
        setError(data.error || "Failed to load library");
      }
    } catch (err) {
      console.error("[LibraryPanel] Error:", err);
      setError("Failed to load library");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/studio/library/stats`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("[LibraryPanel] Stats error:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadLibrary(activeTab);
    loadStats();
  }, []);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    loadLibrary(tab);
    handleStopAudio();
  };

  // Handle load into studio
  const handleLoad = (item) => {
    handleStopAudio();
    
    // Get type based on current tab
    const type = activeTab === "masters" ? "master" 
      : activeTab === "recordings" ? "recording" 
      : activeTab === "beats" ? "beat" 
      : "song";
    
    // Set in shared context
    setCurrentTrack({
      id: item._id,
      title: item.title,
      audioUrl: item.audioUrl,
      type,
    });
    
    // Call appropriate callback based on tab
    if (activeTab === "masters" && onLoadMaster) {
      onLoadMaster(item);
    } else if (activeTab === "recordings" && onLoadRecording) {
      onLoadRecording(item);
    } else if (activeTab === "beats" && onLoadBeat) {
      onLoadBeat(item);
    } else if (onLoadItem) {
      onLoadItem(item, activeTab);
    }
  };

  // Preview audio using shared context
  const handlePreview = (item) => {
    if (playingId === item._id) {
      stopAudio();
      setPlayingId(null);
      return;
    }
    
    // Get type based on current tab
    const type = activeTab === "masters" ? "master" 
      : activeTab === "recordings" ? "recording" 
      : activeTab === "beats" ? "beat" 
      : "song";
    
    // Update shared context and play
    setCurrentTrack({
      id: item._id,
      title: item.title,
      audioUrl: item.audioUrl,
      type,
    });
    
    playAudio(item.audioUrl, {
      id: item._id,
      title: item.title,
      type,
    });
    
    setPlayingId(item._id);
  };

  const handleStopAudio = () => {
    stopAudio();
    setPlayingId(null);
  };
  
  // Sync playingId with shared context
  useEffect(() => {
    if (!isPlaying && playingId) {
      setPlayingId(null);
    }
  }, [isPlaying, playingId]);

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="library-panel">
      <div className="library-header">
        <span className="library-icon">📚</span>
        <h3>Studio Library</h3>
        <button className="refresh-btn" onClick={() => loadLibrary(activeTab)}>
          🔄
        </button>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="library-stats">
          <span>{stats.masters} masters</span>
          <span>{stats.recordings} recordings</span>
          <span>{stats.beats} beats</span>
          <span>{stats.projects} projects</span>
        </div>
      )}

      {/* Tabs */}
      <div className="library-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`library-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => handleTabChange(tab.key)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="library-content">
        {loading ? (
          <div className="library-loading">
            <div className="spinner" />
            <span>Loading {activeTab}...</span>
          </div>
        ) : error ? (
          <div className="library-error">
            <span>⚠️ {error}</span>
            <button onClick={() => loadLibrary(activeTab)}>Retry</button>
          </div>
        ) : items.length === 0 ? (
          <div className="library-empty">
            <span className="empty-icon">
              {TABS.find((t) => t.key === activeTab)?.icon || "📁"}
            </span>
            <p>No {activeTab} yet</p>
            <p className="empty-hint">
              {activeTab === "recordings" && "Record a take to see it here"}
              {activeTab === "masters" && "Export a mixdown to create a master"}
              {activeTab === "beats" && "Generate or upload beats to see them here"}
              {activeTab === "songs" && "Create a new project to get started"}
            </p>
          </div>
        ) : activeTab === "recordings" ? (
          /* Use RecordingList for recordings tab with full playback controls */
          <RecordingList
            recordings={items}
            onDeleted={(id) => setItems((prev) => prev.filter((r) => r._id !== id))}
            onRefresh={() => loadLibrary("recordings")}
          />
        ) : (
          <div className="library-list">
            {items.map((item) => (
              <div key={item._id} className="library-item">
                <div className="item-info">
                  <span className="item-title">{item.title || "Untitled"}</span>
                  <span className="item-meta">
                    {item.bpm && <span className="meta-bpm">{item.bpm} BPM</span>}
                    {item.key && <span className="meta-key">{item.key}</span>}
                    {item.quality && <span className="meta-quality">{item.quality}</span>}
                    {item.type && <span className="meta-type">{item.type}</span>}
                  </span>
                  <span className="item-details">
                    <span className="item-duration">{formatDuration(item.durationSeconds)}</span>
                    <span className="item-date">{formatDate(item.createdAt)}</span>
                  </span>
                </div>
                <div className="item-actions">
                  <button
                    className={`preview-btn ${playingId === item._id ? "playing" : ""}`}
                    onClick={() => handlePreview(item)}
                    title={playingId === item._id ? "Stop" : "Preview"}
                  >
                    {playingId === item._id ? "⏹" : "▶"}
                  </button>
                  <button
                    className="load-btn"
                    onClick={() => handleLoad(item)}
                    title="Load in Studio"
                  >
                    Load
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

