// frontend/src/pages/studio/StudioRoyaltyPage.jsx
// Royalty Management - Splits & Statements
import React, { useState, useEffect } from "react";
import { saveRoyaltySplits, getRoyaltyStatements } from "../../lib/studioApi.js";
import "../../styles/studio-unified.css";

export default function StudioRoyaltyPage() {
  const [splits, setSplits] = useState([
    { name: "Producer", percentage: 50, role: "producer" },
    { name: "Artist", percentage: 30, role: "artist" },
    { name: "Writer", percentage: 20, role: "writer" },
  ]);
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statements, setStatements] = useState([]);

  useEffect(() => {
    fetchStatements();
  }, []);

  const fetchStatements = async () => {
    try {
      const result = await getRoyaltyStatements({ limit: 10 });
      if (result.ok) {
        setStatements(result.statements || []);
      }
    } catch (err) {
      console.error("Error fetching statements:", err);
    }
  };

  const totalPercentage = splits.reduce((sum, s) => sum + s.percentage, 0);
  const isValid = totalPercentage === 100;

  const handleSaveSplits = async () => {
    if (!isValid) {
      setError("Total must equal 100%");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const result = await saveRoyaltySplits({
        projectId: projectId || "default",
        participants: splits.map(s => ({ name: s.name, percentage: s.percentage, role: s.role })),
      });
      if (result.ok) {
        setSuccess("Splits saved successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Save failed");
      }
    } catch (err) {
      setError("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddSplit = () => {
    setSplits([...splits, { name: "", percentage: 0, role: "other" }]);
  };

  const handleRemoveSplit = (index) => {
    if (splits.length > 1) {
      setSplits(splits.filter((_, i) => i !== index));
    }
  };

  const handleUpdateSplit = (index, field, value) => {
    const updated = [...splits];
    updated[index][field] = field === "percentage" ? parseFloat(value) || 0 : value;
    setSplits(updated);
  };

  // Calculate progress ring
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(totalPercentage, 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div>
      {/* Header */}
      <div className="studio-header">
        <h1 className="studio-header-title">💰 Royalty Splits</h1>
        <p className="studio-header-subtitle">
          Lock in percentages and let PowerPay route coins on every spin, stream and sale.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="studio-alert studio-alert--error">
          <span>⚠️ {error}</span>
          <button className="studio-alert-dismiss" onClick={() => setError("")}>×</button>
        </div>
      )}
      {success && (
        <div className="studio-alert studio-alert--success">
          <span>✅ {success}</span>
          <button className="studio-alert-dismiss" onClick={() => setSuccess("")}>×</button>
        </div>
      )}

      <div className="studio-grid studio-grid--2">
        {/* Splits Management */}
        <div className="studio-card">
          <div className="studio-card-header">
            <h3 className="studio-card-title">Song Splits</h3>
            <span style={{ color: "#888", fontSize: 13 }}>{splits.length} participants</span>
          </div>

          {/* Collaborator List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {splits.map((split, idx) => (
              <div 
                key={idx} 
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)"
                }}
              >
                <div style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${getColorForRole(split.role)})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18
                }}>
                  {getIconForRole(split.role)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    className="studio-input"
                    value={split.name}
                    onChange={(e) => handleUpdateSplit(idx, "name", e.target.value)}
                    placeholder="Name"
                    style={{ marginBottom: 8 }}
                  />
                  <select
                    className="studio-select"
                    value={split.role}
                    onChange={(e) => handleUpdateSplit(idx, "role", e.target.value)}
                    style={{ padding: "6px 10px", fontSize: 12 }}
                  >
                    <option value="producer">Producer</option>
                    <option value="artist">Artist</option>
                    <option value="writer">Writer</option>
                    <option value="engineer">Engineer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 100 }}>
                  <input
                    type="number"
                    className="studio-input"
                    value={split.percentage}
                    onChange={(e) => handleUpdateSplit(idx, "percentage", e.target.value)}
                    min="0"
                    max="100"
                    step="0.5"
                    style={{ width: 70, textAlign: "center" }}
                  />
                  <span style={{ color: "#888" }}>%</span>
                </div>
                
                <button
                  className="studio-btn studio-btn--outline"
                  style={{ padding: "6px 10px", fontSize: 12 }}
                  onClick={() => handleRemoveSplit(idx)}
                  disabled={splits.length <= 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button className="studio-btn studio-btn--secondary" onClick={handleAddSplit} style={{ width: "100%", marginBottom: 20 }}>
            + Add Collaborator
          </button>

          <button 
            className="studio-btn studio-btn--primary" 
            onClick={handleSaveSplits} 
            disabled={loading || !isValid}
            style={{ width: "100%" }}
          >
            {loading ? "Saving..." : "Save Splits"}
          </button>
        </div>

        {/* Visual Summary */}
        <div>
          {/* Progress Ring */}
          <div className="studio-card" style={{ textAlign: "center", marginBottom: 20 }}>
            <div className="studio-card-header">
              <h3 className="studio-card-title">Split Summary</h3>
            </div>

            <div style={{ position: "relative", width: 180, height: 180, margin: "0 auto 20px" }}>
              <svg width="180" height="180" viewBox="0 0 180 180">
                {/* Background circle */}
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                />
                {/* Progress circle */}
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="none"
                  stroke={isValid ? "#00c864" : totalPercentage > 100 ? "#ff4444" : "#ffb84d"}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 90 90)"
                  style={{ transition: "stroke-dashoffset 0.3s ease" }}
                />
              </svg>
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center"
              }}>
                <div style={{ 
                  fontSize: 32, 
                  fontWeight: 900, 
                  color: isValid ? "#00c864" : totalPercentage > 100 ? "#ff4444" : "#ffb84d"
                }}>
                  {totalPercentage.toFixed(1)}%
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  {isValid ? "Complete" : totalPercentage < 100 ? `${(100 - totalPercentage).toFixed(1)}% remaining` : `${(totalPercentage - 100).toFixed(1)}% over`}
                </div>
              </div>
            </div>

            {/* Split bars */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {splits.filter(s => s.percentage > 0).map((split, idx) => (
                <div key={idx}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span>{split.name || "Unnamed"}</span>
                    <span style={{ color: "#ffb84d" }}>{split.percentage}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3 }}>
                    <div style={{
                      height: "100%",
                      width: `${split.percentage}%`,
                      background: `linear-gradient(90deg, ${getColorForRole(split.role)})`,
                      borderRadius: 3,
                      transition: "width 0.3s ease"
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statements */}
          <div className="studio-card">
            <div className="studio-card-header">
              <h3 className="studio-card-title">📊 Statements</h3>
            </div>

            {statements.length === 0 ? (
              <div className="studio-empty" style={{ padding: 24 }}>
                <div className="studio-empty-icon">📄</div>
                <p className="studio-empty-title">No statements yet</p>
                <p className="studio-empty-desc">Statements appear here after tracks are played</p>
              </div>
            ) : (
              <div className="studio-file-list">
                {statements.map((stmt, idx) => (
                  <div key={idx} className="studio-file-item">
                    <div className="studio-file-info">
                      <span className="studio-file-icon">💵</span>
                      <div>
                        <div className="studio-file-name">{stmt.title}</div>
                        <div className="studio-file-size">{stmt.date}</div>
                      </div>
                    </div>
                    <span style={{ color: "#00c864", fontWeight: 700 }}>${stmt.amount}</span>
                  </div>
                ))}
              </div>
            )}

            <button className="studio-btn studio-btn--outline" style={{ width: "100%", marginTop: 16 }}>
              View All Statements
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getColorForRole(role) {
  const colors = {
    producer: "#ffb84d, #ff9500",
    artist: "#ff4d94, #ff0066",
    writer: "#4d94ff, #0066ff",
    engineer: "#4dff94, #00c864",
    other: "#888888, #666666"
  };
  return colors[role] || colors.other;
}

function getIconForRole(role) {
  const icons = { producer: "🎹", artist: "🎤", writer: "✍️", engineer: "🔧", other: "👤" };
  return icons[role] || "👤";
}
