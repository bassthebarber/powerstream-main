// frontend/studio-app/src/pages/Royalty.jsx
// Royalty Dashboard - Split Designer & Management

import React, { useState, useEffect } from "react";
import "../styles/studio.css";
import { STUDIO_API_BASE } from "../config/api.js";

// Use centralized API config
const STUDIO_API = STUDIO_API_BASE;

const ROLES = [
  "Artist",
  "Producer",
  "Writer",
  "Engineer",
  "Featured Artist",
  "Label",
  "Publisher",
  "Other",
];

export default function Royalty() {
  // Create Split Form
  const [trackName, setTrackName] = useState("");
  const [mainArtist, setMainArtist] = useState("");
  const [contributors, setContributors] = useState([
    { name: "", role: "Artist", percentage: 50 },
    { name: "", role: "Producer", percentage: 50 },
  ]);

  // Saved Splits
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Viewing a split
  const [viewingSplit, setViewingSplit] = useState(null);

  // Calculate total percentage
  const totalPercentage = contributors.reduce((sum, c) => sum + (c.percentage || 0), 0);
  const isValid = totalPercentage === 100;

  // Fetch saved splits
  useEffect(() => {
    fetchSplits();
  }, []);

  const fetchSplits = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${STUDIO_API}/api/royalty/splits`);
      const data = await res.json();
      setSplits(data.splits || data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      // Use stub data
      setSplits(STUB_SPLITS);
    } finally {
      setLoading(false);
    }
  };

  // Add contributor row
  const addContributor = () => {
    setContributors([...contributors, { name: "", role: "Other", percentage: 0 }]);
  };

  // Remove contributor row
  const removeContributor = (index) => {
    if (contributors.length <= 1) return;
    setContributors(contributors.filter((_, i) => i !== index));
  };

  // Update contributor
  const updateContributor = (index, field, value) => {
    const updated = [...contributors];
    updated[index] = { ...updated[index], [field]: field === "percentage" ? Number(value) : value };
    setContributors(updated);
  };

  // Save split
  const saveSplit = async () => {
    if (!trackName.trim()) {
      setError("Track name is required");
      return;
    }
    if (!mainArtist.trim()) {
      setError("Main artist is required");
      return;
    }
    if (!isValid) {
      setError("Total percentage must equal 100%");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${STUDIO_API}/api/royalty/splits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackName,
          mainArtist,
          contributors: contributors.filter(c => c.name.trim()),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save split");
      }

      setSuccess("Split saved successfully!");
      setTrackName("");
      setMainArtist("");
      setContributors([
        { name: "", role: "Artist", percentage: 50 },
        { name: "", role: "Producer", percentage: 50 },
      ]);
      fetchSplits();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Clear form
  const clearForm = () => {
    setTrackName("");
    setMainArtist("");
    setContributors([
      { name: "", role: "Artist", percentage: 50 },
      { name: "", role: "Producer", percentage: 50 },
    ]);
    setError("");
    setSuccess("");
  };

  return (
    <div className="studio-page">
      {/* Header */}
      <div className="studio-header">
        <div>
          <h1 className="studio-title">Royalty Dashboard</h1>
          <p className="studio-subtitle">Split Designer · Track Ownership & Revenue Distribution</p>
        </div>
      </div>

      {error && (
        <div className="studio-status studio-status--error" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}
      {success && (
        <div className="studio-status studio-status--success" style={{ marginBottom: 20 }}>
          {success}
        </div>
      )}

      <div className="studio-grid studio-grid--2">
        {/* Left - Create Split */}
        <div className="studio-panel studio-panel--glow">
          <h3 className="studio-card-title">📝 Create Split</h3>

          <div className="studio-field">
            <label className="studio-label">Track Name</label>
            <input
              type="text"
              className="studio-input"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              placeholder="Enter track name..."
            />
          </div>

          <div className="studio-field">
            <label className="studio-label">Main Artist</label>
            <input
              type="text"
              className="studio-input"
              value={mainArtist}
              onChange={(e) => setMainArtist(e.target.value)}
              placeholder="Enter main artist name..."
            />
          </div>

          {/* Contributors */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <label className="studio-label" style={{ margin: 0 }}>Contributors</label>
              <button className="studio-btn studio-btn--sm" onClick={addContributor}>
                + Add
              </button>
            </div>

            {contributors.map((contrib, index) => (
              <div 
                key={index} 
                className="studio-card" 
                style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 120px 80px 40px", 
                  gap: 10, 
                  alignItems: "center",
                  marginBottom: 10 
                }}
              >
                <input
                  type="text"
                  className="studio-input"
                  value={contrib.name}
                  onChange={(e) => updateContributor(index, "name", e.target.value)}
                  placeholder="Name"
                  style={{ margin: 0 }}
                />
                <select
                  className="studio-select"
                  value={contrib.role}
                  onChange={(e) => updateContributor(index, "role", e.target.value)}
                  style={{ margin: 0 }}
                >
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input
                    type="number"
                    className="studio-input"
                    value={contrib.percentage}
                    onChange={(e) => updateContributor(index, "percentage", e.target.value)}
                    min="0"
                    max="100"
                    style={{ margin: 0, width: "100%", textAlign: "center" }}
                  />
                  <span style={{ color: "#888" }}>%</span>
                </div>
                <button
                  className="studio-btn studio-btn--sm"
                  onClick={() => removeContributor(index)}
                  style={{ 
                    padding: "8px", 
                    background: contributors.length <= 1 ? "#333" : "rgba(255,68,85,0.2)",
                    color: contributors.length <= 1 ? "#555" : "#ff4455",
                    border: "none"
                  }}
                  disabled={contributors.length <= 1}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Total Indicator */}
          <div 
            className="studio-card" 
            style={{ 
              textAlign: "center", 
              marginTop: 20,
              background: isValid ? "rgba(0,200,100,0.1)" : "rgba(255,68,85,0.1)",
              borderColor: isValid ? "rgba(0,200,100,0.3)" : "rgba(255,68,85,0.3)"
            }}
          >
            <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: 4 }}>TOTAL SPLIT</div>
            <div style={{ 
              fontSize: "2rem", 
              fontWeight: 900, 
              color: isValid ? "#00c864" : "#ff4455" 
            }}>
              {totalPercentage}%
            </div>
            {!isValid && (
              <div style={{ fontSize: "0.8rem", color: "#ff4455", marginTop: 4 }}>
                Must equal 100%
              </div>
            )}
          </div>

          {/* Percentage Circle Visual */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
            <div 
              className="studio-percentage" 
              style={{ "--percent": totalPercentage }}
            >
              <span className="studio-percentage-value">{totalPercentage}%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button
              className="studio-btn studio-btn--gold"
              onClick={saveSplit}
              disabled={saving || !isValid}
              style={{ flex: 1 }}
            >
              {saving ? "Saving..." : "💾 Save Split"}
            </button>
            <button
              className="studio-btn"
              onClick={clearForm}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Right - Saved Splits */}
        <div className="studio-panel">
          <h3 className="studio-card-title">📊 Saved Splits</h3>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
              Loading splits...
            </div>
          ) : splits.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>📁</div>
              No splits saved yet. Create your first one!
            </div>
          ) : (
            <div style={{ maxHeight: 500, overflowY: "auto" }}>
              <table className="studio-table">
                <thead>
                  <tr>
                    <th>Track</th>
                    <th>Main Artist</th>
                    <th>Contributors</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {splits.map((split, i) => (
                    <tr key={split._id || i}>
                      <td style={{ fontWeight: 600 }}>{split.trackName}</td>
                      <td>{split.mainArtist}</td>
                      <td>{split.contributors?.length || 0}</td>
                      <td>
                        <button
                          className="studio-btn studio-btn--sm studio-btn--outline"
                          onClick={() => setViewingSplit(split)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Split Modal */}
      {viewingSplit && (
        <div 
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setViewingSplit(null)}
        >
          <div 
            className="studio-panel studio-panel--glow"
            style={{ maxWidth: 500, width: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="studio-card-title">📜 {viewingSplit.trackName}</h3>
            <p style={{ color: "#888", marginBottom: 20 }}>Main Artist: {viewingSplit.mainArtist}</p>
            
            {viewingSplit.contributors?.map((c, i) => (
              <div 
                key={i}
                className="studio-card"
                style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "#888" }}>{c.role}</div>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e6b800" }}>
                  {c.percentage}%
                </div>
              </div>
            ))}

            <button
              className="studio-btn"
              onClick={() => setViewingSplit(null)}
              style={{ width: "100%", marginTop: 20 }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Stub data
const STUB_SPLITS = [
  {
    _id: "1",
    trackName: "No Limit Dreams",
    mainArtist: "Scarface 2.0",
    contributors: [
      { name: "Scarface 2.0", role: "Artist", percentage: 50 },
      { name: "Studio AI", role: "Producer", percentage: 30 },
      { name: "No Limit East Houston", role: "Label", percentage: 20 },
    ],
  },
  {
    _id: "2",
    trackName: "Southern Soul",
    mainArtist: "PowerHarmony",
    contributors: [
      { name: "PowerHarmony", role: "Artist", percentage: 60 },
      { name: "Beat Master", role: "Producer", percentage: 40 },
    ],
  },
];
