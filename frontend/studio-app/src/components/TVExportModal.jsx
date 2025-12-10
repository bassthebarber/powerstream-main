// frontend/studio-app/src/components/TVExportModal.jsx
// Modal for sending studio assets to PowerStream TV

import React, { useState, useEffect } from "react";
import { TV_EXPORT_API } from "../config/api.js";

// Available stations
const DEFAULT_STATIONS = [
  { id: "Southern Power Network", name: "Southern Power Network" },
  { id: "No Limit East Houston", name: "No Limit East Houston" },
  { id: "Texas Got Talent", name: "Texas Got Talent" },
  { id: "Civic Connect", name: "Civic Connect" },
  { id: "Gospel Hour", name: "Gospel Hour" },
  { id: "Late Night Vibes", name: "Late Night Vibes" },
  { id: "Morning Motivation", name: "Morning Motivation" },
  { id: "Hip Hop Headquarters", name: "Hip Hop Headquarters" },
  { id: "R&B Soul Station", name: "R&B Soul Station" },
];

// Asset types
const ASSET_TYPES = [
  { id: "song", name: "Full Song", icon: "🎵" },
  { id: "instrumental", name: "Instrumental / Beat", icon: "🎹" },
  { id: "stem", name: "Stem / Loop", icon: "🔊" },
  { id: "show-intro", name: "Show Intro", icon: "🎬" },
  { id: "bumper", name: "Bumper / Transition", icon: "⚡" },
  { id: "jingle", name: "Jingle / ID", icon: "🔔" },
  { id: "mix", name: "DJ Mix / Mixdown", icon: "🎚️" },
];

export default function TVExportModal({ 
  isOpen, 
  onClose, 
  item, // The library item to export
  onSuccess, // Callback when export succeeds
}) {
  const [stations, setStations] = useState(DEFAULT_STATIONS);
  const [selectedStation, setSelectedStation] = useState("");
  const [assetType, setAssetType] = useState("song");
  const [targetShow, setTargetShow] = useState("");
  const [priority, setPriority] = useState("normal");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Fetch stations on mount
  useEffect(() => {
    fetchStations();
  }, []);

  // Reset form when modal opens with new item
  useEffect(() => {
    if (isOpen && item) {
      setSelectedStation("");
      setTargetShow("");
      setPriority("normal");
      setError(null);
      setResult(null);
      
      // Auto-detect asset type from item
      if (item.type === "beat") setAssetType("instrumental");
      else if (item.type === "mix" || item.type === "export") setAssetType("mix");
      else if (item.type === "stem") setAssetType("stem");
      else setAssetType("song");
    }
  }, [isOpen, item]);

  async function fetchStations() {
    try {
      const res = await fetch(`${TV_EXPORT_API}/stations`);
      const data = await res.json();
      if (data.success && data.stations) {
        setStations(data.stations.map(s => ({
          id: s.name || s.id,
          name: s.name || s.id,
        })));
      }
    } catch (err) {
      console.warn("Could not fetch TV stations, using defaults");
    }
  }

  async function handleExport() {
    if (!selectedStation) {
      setError("Please select a station");
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const res = await fetch(`${TV_EXPORT_API}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          libraryItemId: item._id,
          assetType,
          targetStation: selectedStation,
          targetShow: targetShow || undefined,
          priority,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResult(data);
        if (onSuccess) onSuccess(data);
      } else {
        setError(data.message || "Export failed");
      }
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setIsExporting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div 
        className="modal-content"
        style={{
          background: "#1a1a1a",
          border: "1px solid rgba(230, 184, 0, 0.3)",
          borderRadius: "12px",
          padding: "1.5rem",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "1.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          paddingBottom: "1rem",
        }}>
          <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            📺 Send to PowerStream TV
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#888",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {/* Success Result */}
        {result ? (
          <div style={{ textAlign: "center", padding: "1rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
              {result.export?.status === "sent" ? "✅" : "📤"}
            </div>
            <h3 style={{ color: "#4CAF50", marginBottom: "0.5rem" }}>
              {result.export?.status === "sent" ? "Export Sent!" : "Export Queued!"}
            </h3>
            <p style={{ opacity: 0.8, marginBottom: "1rem" }}>
              {result.message}
            </p>
            <div style={{ 
              background: "rgba(255,255,255,0.05)", 
              borderRadius: "8px", 
              padding: "1rem",
              textAlign: "left",
              fontSize: "0.9rem",
            }}>
              <div><strong>Asset:</strong> {item?.title || item?.name}</div>
              <div><strong>Station:</strong> {selectedStation}</div>
              <div><strong>Status:</strong> {result.export?.status}</div>
              {result.export?.externalId && (
                <div><strong>TV ID:</strong> {result.export.externalId}</div>
              )}
            </div>
            <button
              onClick={onClose}
              className="studio-gold-btn"
              style={{ marginTop: "1.5rem", width: "100%" }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Asset Info */}
            <div style={{ 
              background: "rgba(230, 184, 0, 0.1)", 
              borderRadius: "8px", 
              padding: "1rem",
              marginBottom: "1.5rem",
            }}>
              <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                {item?.title || item?.name || "Untitled Asset"}
              </div>
              <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                {item?.artistName && `by ${item.artistName}`}
                {item?.bpm && ` • ${item.bpm} BPM`}
                {item?.key && ` • ${item.key}`}
                {item?.duration && ` • ${Math.round(item.duration)}s`}
              </div>
            </div>

            {/* Station Selection */}
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                Target Station *
              </label>
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontSize: "1rem",
                }}
              >
                <option value="">Select a station...</option>
                {stations.map(station => (
                  <option key={station.id} value={station.id}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Asset Type */}
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                Asset Type
              </label>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(4, 1fr)", 
                gap: "0.5rem" 
              }}>
                {ASSET_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setAssetType(type.id)}
                    style={{
                      padding: "0.5rem",
                      borderRadius: "6px",
                      border: assetType === type.id 
                        ? "2px solid var(--gold, #e6b800)" 
                        : "1px solid rgba(255,255,255,0.2)",
                      background: assetType === type.id 
                        ? "rgba(230, 184, 0, 0.2)" 
                        : "transparent",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      textAlign: "center",
                    }}
                    title={type.name}
                  >
                    <div style={{ fontSize: "1.2rem" }}>{type.icon}</div>
                    <div style={{ marginTop: "0.25rem", opacity: 0.8 }}>{type.name.split(" ")[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Show/Series Name */}
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                Show / Series (optional)
              </label>
              <input
                type="text"
                value={targetShow}
                onChange={(e) => setTargetShow(e.target.value)}
                placeholder="e.g., Friday Night Live, Morning Show"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontSize: "1rem",
                }}
              />
            </div>

            {/* Priority */}
            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                Priority
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {["low", "normal", "high", "urgent"].map(p => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      borderRadius: "6px",
                      border: priority === p 
                        ? "2px solid var(--gold, #e6b800)" 
                        : "1px solid rgba(255,255,255,0.2)",
                      background: priority === p 
                        ? "rgba(230, 184, 0, 0.2)" 
                        : "transparent",
                      color: p === "urgent" ? "#F44336" : "#fff",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      textTransform: "capitalize",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ 
                color: "#F44336", 
                background: "rgba(244, 67, 54, 0.1)",
                padding: "0.75rem",
                borderRadius: "6px",
                marginBottom: "1rem",
                fontSize: "0.9rem",
              }}>
                ❌ {error}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || !selectedStation}
                className="studio-gold-btn"
                style={{
                  flex: 2,
                  padding: "0.75rem",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  opacity: (!selectedStation || isExporting) ? 0.5 : 1,
                }}
              >
                {isExporting ? "📤 Sending..." : "📺 Send to TV"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}






