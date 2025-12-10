// frontend/src/pages/studio/StudioTVExportPage.jsx
// TV Distribution - Export content to TV stations

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import studioApi from "../../lib/studioApi.js";
import "../../styles/studio-unified.css";

const STATIONS = [
  { id: "southern-power", name: "Southern Power Syndicate", icon: "🎸", color: "#ffd43b" },
  { id: "no-limit-east-houston", name: "No Limit East Houston", icon: "🏠", color: "#ff6b6b" },
  { id: "civic-connect", name: "Civic Connect", icon: "🏛️", color: "#4dabf7" },
  { id: "world-tv", name: "World TV", icon: "🌍", color: "#69db7c" },
  { id: "texas-got-talent", name: "Texas Got Talent", icon: "⭐", color: "#f783ac" },
];

const CONTENT_TYPES = [
  { id: "music-video", name: "Music Video", icon: "🎬" },
  { id: "live-performance", name: "Live Performance", icon: "🎤" },
  { id: "interview", name: "Interview", icon: "🎙️" },
  { id: "documentary", name: "Documentary", icon: "🎞️" },
  { id: "behind-scenes", name: "Behind the Scenes", icon: "📹" },
];

export default function StudioTVExportPage() {
  const navigate = useNavigate();
  
  const [libraryItems, setLibraryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedStations, setSelectedStations] = useState([]);
  const [contentType, setContentType] = useState("music-video");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exports, setExports] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [libraryRes, exportsRes] = await Promise.allSettled([
        studioApi.getLibraryItems(null, 30),
        studioApi.getTVExports({ limit: 10 }),
      ]);

      if (libraryRes.status === "fulfilled" && libraryRes.value?.ok) {
        setLibraryItems(libraryRes.value.items || []);
      }
      if (exportsRes.status === "fulfilled" && exportsRes.value?.ok) {
        setExports(exportsRes.value.exports || []);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  };

  const handleStationToggle = (stationId) => {
    setSelectedStations((prev) =>
      prev.includes(stationId)
        ? prev.filter((id) => id !== stationId)
        : [...prev, stationId]
    );
  };

  const handleExport = async () => {
    if (!selectedItem) {
      setError("Please select content to export");
      return;
    }
    if (selectedStations.length === 0) {
      setError("Please select at least one station");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    setExporting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await studioApi.createTVExport({
        contentId: selectedItem.id,
        contentUrl: selectedItem.url,
        stations: selectedStations,
        contentType,
        title,
        description,
        scheduledDate: scheduledDate || undefined,
      });

      if (res?.ok) {
        setSuccess(`Content exported to ${selectedStations.length} station(s)!`);
        setExports((prev) => [res.export, ...prev]);
        // Reset form
        setSelectedItem(null);
        setSelectedStations([]);
        setTitle("");
        setDescription("");
        setScheduledDate("");
      } else {
        throw new Error(res?.message || "Export failed");
      }
    } catch (err) {
      setError(err.message || "Failed to export");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="studio-page">
      <header className="studio-page-header">
        <button className="studio-back-btn" onClick={() => navigate("/studio")}>
          ← Back
        </button>
        <h1 className="studio-page-title">📺 TV Distribution</h1>
        <p className="studio-page-subtitle">Export your content to PowerStream TV stations</p>
      </header>

      {error && (
        <div className="studio-alert studio-alert--error">
          ⚠️ {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="studio-alert studio-alert--success">
          ✅ {success}
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      <div className="studio-grid studio-grid--2">
        {/* Left - Content Selection */}
        <div className="studio-card">
          <h3 className="studio-card-title">📁 Select Content</h3>
          
          <div className="content-list">
            {libraryItems.length === 0 ? (
              <div className="empty-state">
                <span>No content in library</span>
              </div>
            ) : (
              libraryItems.map((item) => (
                <button
                  key={item.id}
                  className={`content-item ${selectedItem?.id === item.id ? "content-item--selected" : ""}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <span className="content-icon">
                    {item.type === "recording" ? "🎙️" : item.type === "mix" ? "🎚️" : "🎵"}
                  </span>
                  <div className="content-info">
                    <span className="content-name">{item.name}</span>
                    <span className="content-meta">{item.type} • {item.duration}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right - Export Settings */}
        <div className="studio-card">
          <h3 className="studio-card-title">⚙️ Export Settings</h3>

          {/* Title */}
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title for TV listing..."
              className="form-input"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description for TV guide..."
              className="form-textarea"
            />
          </div>

          {/* Content Type */}
          <div className="form-group">
            <label>Content Type</label>
            <div className="type-grid">
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  className={`type-btn ${contentType === type.id ? "type-btn--active" : ""}`}
                  onClick={() => setContentType(type.id)}
                >
                  <span>{type.icon}</span>
                  <span>{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scheduled Date */}
          <div className="form-group">
            <label>Schedule Date (optional)</label>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Station Selection */}
      <div className="studio-card" style={{ marginTop: 24 }}>
        <h3 className="studio-card-title">📡 Select Stations</h3>
        <div className="stations-grid">
          {STATIONS.map((station) => (
            <button
              key={station.id}
              className={`station-card ${selectedStations.includes(station.id) ? "station-card--selected" : ""}`}
              style={{ "--station-color": station.color }}
              onClick={() => handleStationToggle(station.id)}
            >
              <div className="station-icon">{station.icon}</div>
              <div className="station-name">{station.name}</div>
              {selectedStations.includes(station.id) && (
                <div className="station-check">✓</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Export Button */}
      <div className="action-row">
        <button
          className="export-btn"
          onClick={handleExport}
          disabled={exporting || !selectedItem || selectedStations.length === 0}
        >
          {exporting ? "📡 Exporting..." : "📺 Export to TV"}
        </button>
      </div>

      {/* Recent Exports */}
      {exports.length > 0 && (
        <div className="studio-card" style={{ marginTop: 24 }}>
          <h3 className="studio-card-title">📋 Recent Exports</h3>
          <div className="exports-list">
            {exports.map((exp, i) => (
              <div key={i} className="export-item">
                <div className="export-info">
                  <span className="export-title">{exp.title}</span>
                  <span className="export-meta">
                    {exp.stations?.length || 0} stations • {exp.status}
                  </span>
                </div>
                <span className={`export-status export-status--${exp.status}`}>
                  {exp.status === "pending" ? "⏳" : exp.status === "published" ? "✅" : "🔄"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .studio-page {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .studio-page-header {
          margin-bottom: 24px;
        }

        .studio-back-btn {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 0.9rem;
          margin-bottom: 8px;
        }

        .studio-page-title {
          font-size: 2rem;
          font-weight: 900;
          margin: 0;
          background: linear-gradient(90deg, #fff, #339af0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .studio-page-subtitle {
          color: #888;
          margin: 4px 0 0;
        }

        .studio-grid--2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .studio-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 24px;
        }

        .studio-card-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 16px;
        }

        .content-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 400px;
          overflow-y: auto;
        }

        .content-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 2px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .content-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .content-item--selected {
          border-color: #339af0;
          background: rgba(51, 154, 240, 0.1);
        }

        .content-icon {
          font-size: 24px;
        }

        .content-info {
          display: flex;
          flex-direction: column;
        }

        .content-name {
          font-weight: 600;
          color: #fff;
        }

        .content-meta {
          font-size: 0.8rem;
          color: #888;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 0.85rem;
          color: #888;
          margin-bottom: 6px;
        }

        .form-input, .form-textarea {
          width: 100%;
          padding: 12px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
        }

        .form-textarea {
          min-height: 80px;
          resize: vertical;
        }

        .type-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .type-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px 8px;
          background: rgba(255, 255, 255, 0.02);
          border: 2px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          font-size: 0.8rem;
        }

        .type-btn:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .type-btn--active {
          border-color: #339af0;
          background: rgba(51, 154, 240, 0.1);
        }

        .stations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .station-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 2px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .station-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--station-color);
        }

        .station-card--selected {
          border-color: var(--station-color);
          background: rgba(255, 255, 255, 0.05);
        }

        .station-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .station-name {
          color: #fff;
          font-weight: 600;
          text-align: center;
          font-size: 0.9rem;
        }

        .station-check {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 24px;
          height: 24px;
          background: var(--station-color);
          color: #000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
        }

        .action-row {
          display: flex;
          justify-content: center;
          margin-top: 24px;
        }

        .export-btn {
          padding: 16px 48px;
          background: linear-gradient(135deg, #339af0, #228be6);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .export-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(51, 154, 240, 0.4);
        }

        .export-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .exports-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .export-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }

        .export-info {
          display: flex;
          flex-direction: column;
        }

        .export-title {
          font-weight: 600;
        }

        .export-meta {
          font-size: 0.8rem;
          color: #888;
        }

        .export-status {
          font-size: 1.2rem;
        }

        .studio-alert {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .studio-alert--error {
          background: rgba(255, 68, 68, 0.15);
          color: #ff6666;
        }

        .studio-alert--success {
          background: rgba(0, 200, 100, 0.15);
          color: #00c864;
        }

        .studio-alert button {
          background: none;
          border: none;
          color: inherit;
          font-size: 1.2rem;
          cursor: pointer;
        }

        .empty-state {
          padding: 40px;
          text-align: center;
          color: #666;
        }

        @media (max-width: 768px) {
          .studio-grid--2 {
            grid-template-columns: 1fr;
          }

          .stations-grid {
            grid-template-columns: 1fr;
          }

          .type-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

