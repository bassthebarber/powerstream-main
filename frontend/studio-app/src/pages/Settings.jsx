// frontend/studio-app/src/pages/Settings.jsx
// Settings Page - Studio Preferences & Environment Info

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/studio.css";
import { STUDIO_HEALTH, ENV_INFO, API_BASE, STUDIO_API_BASE } from "../config/api.js";

export default function Settings() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("dark");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [latency, setLatency] = useState(128);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  // Health status
  const [mainApiStatus, setMainApiStatus] = useState("checking");
  const [studioApiStatus, setStudioApiStatus] = useState("checking");

  // Check API health
  useEffect(() => {
    async function checkHealth() {
      // Check main API
      try {
        const res = await fetch(`${API_BASE}/api/health`, { method: "GET" });
        setMainApiStatus(res.ok ? "online" : "offline");
      } catch {
        setMainApiStatus("offline");
      }

      // Check studio API
      try {
        const res = await fetch(STUDIO_HEALTH, { method: "GET" });
        setStudioApiStatus(res.ok ? "online" : "offline");
      } catch {
        setStudioApiStatus("offline");
      }
    }
    checkHealth();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    try {
      // Simulate saving settings
      await new Promise((r) => setTimeout(r, 800));
      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const StatusBadge = ({ status, label }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: status === "online" ? "#00c864" : status === "checking" ? "#e6b800" : "#ff4455",
          boxShadow: `0 0 8px ${status === "online" ? "rgba(0,200,100,0.5)" : status === "checking" ? "rgba(230,184,0,0.5)" : "rgba(255,68,85,0.5)"}`,
        }}
      />
      <span style={{ color: "#888" }}>{label}:</span>
      <span style={{ 
        color: status === "online" ? "#00c864" : status === "checking" ? "#e6b800" : "#ff4455",
        fontWeight: 600,
      }}>
        {status === "checking" ? "Checking..." : status === "online" ? "Online" : "Offline"}
      </span>
    </div>
  );

  return (
    <div className="studio-page">
      {/* Header */}
      <div className="studio-header">
        <div>
          <h1 className="studio-title">Settings</h1>
          <p className="studio-subtitle">Studio Preferences & Configuration</p>
        </div>
      </div>

      {success && (
        <div className="studio-status studio-status--success" style={{ marginBottom: 20 }}>
          {success}
        </div>
      )}

      <div className="studio-grid studio-grid--2">
        {/* Left - Preferences */}
        <div className="studio-panel studio-panel--glow">
          <h3 className="studio-card-title">⚙️ Preferences</h3>

          {/* Theme */}
          <div className="studio-field">
            <label className="studio-label">Theme</label>
            <select
              className="studio-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="dark">Dark Mode (Black & Gold)</option>
              <option value="light">Light Mode (Coming Soon)</option>
            </select>
          </div>

          {/* Audio Latency */}
          <div className="studio-field">
            <label className="studio-label">Audio Latency: {latency} ms</label>
            <input
              type="range"
              className="studio-slider"
              min="64"
              max="512"
              step="64"
              value={latency}
              onChange={(e) => setLatency(Number(e.target.value))}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#666", marginTop: 4 }}>
              <span>64ms (Low)</span>
              <span>512ms (High)</span>
            </div>
          </div>

          {/* Email Alerts */}
          <div className="studio-card" style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Email Alerts</div>
                <div style={{ fontSize: "0.85rem", color: "#888" }}>
                  Receive notifications for exports and sessions
                </div>
              </div>
              <label style={{ cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  style={{ display: "none" }}
                />
                <div
                  style={{
                    width: 48,
                    height: 24,
                    borderRadius: 12,
                    background: emailAlerts ? "#e6b800" : "rgba(255,255,255,0.1)",
                    position: "relative",
                    transition: "background 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 2,
                      left: emailAlerts ? 26 : 2,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left 0.2s ease",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    }}
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <button
            className="studio-btn studio-btn--gold studio-btn--lg"
            onClick={handleSave}
            disabled={saving}
            style={{ width: "100%", marginTop: 24 }}
          >
            {saving ? "⏳ Saving..." : "💾 Save Settings"}
          </button>
        </div>

        {/* Right - Environment Info */}
        <div className="studio-panel">
          <h3 className="studio-card-title">🔧 Environment Info</h3>

          {/* API Status */}
          <div className="studio-card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: "#e6b800", marginBottom: 12 }}>API Status</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <StatusBadge status={mainApiStatus} label="Main API" />
              <StatusBadge status={studioApiStatus} label="Studio API" />
            </div>
          </div>

          {/* Endpoints */}
          <div className="studio-card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: "#e6b800", marginBottom: 12 }}>API Endpoints</div>
            <div style={{ fontSize: "0.85rem", color: "#888" }}>
              <div style={{ marginBottom: 8 }}>
                <div style={{ color: "#666", fontSize: "0.75rem" }}>Main API</div>
                <code style={{ 
                  background: "rgba(0,0,0,0.3)", 
                  padding: "4px 8px", 
                  borderRadius: 6,
                  color: "#e6b800",
                  fontSize: "0.8rem",
                }}>
                  {API_BASE}
                </code>
              </div>
              <div>
                <div style={{ color: "#666", fontSize: "0.75rem" }}>Studio API</div>
                <code style={{ 
                  background: "rgba(0,0,0,0.3)", 
                  padding: "4px 8px", 
                  borderRadius: 6,
                  color: "#e6b800",
                  fontSize: "0.8rem",
                }}>
                  {STUDIO_API_BASE}
                </code>
              </div>
            </div>
          </div>

          {/* Version Info */}
          <div className="studio-card">
            <div style={{ fontWeight: 700, color: "#e6b800", marginBottom: 12 }}>Version</div>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", fontSize: "0.85rem" }}>
              <span style={{ color: "#666" }}>App Version:</span>
              <span style={{ color: "#ccc" }}>{ENV_INFO.version}</span>
              
              <span style={{ color: "#666" }}>Environment:</span>
              <span style={{ color: "#ccc" }}>{ENV_INFO.environment}</span>
              
              <span style={{ color: "#666" }}>Build:</span>
              <span style={{ color: "#ccc" }}>PowerHarmony Studio</span>
            </div>
          </div>

          {/* Advanced Settings Note */}
          <div 
            className="studio-card" 
            style={{ 
              marginTop: 16, 
              background: "rgba(68,136,255,0.1)",
              borderColor: "rgba(68,136,255,0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.5rem" }}>🚀</span>
              <div>
                <div style={{ fontWeight: 600, color: "#4488ff", marginBottom: 4 }}>
                  Advanced Settings
                </div>
                <div style={{ fontSize: "0.85rem", color: "#888" }}>
                  Additional configuration options will be added in future updates.
                </div>
              </div>
            </div>
          </div>

          {/* Admin Dashboard Section */}
          <div 
            className="studio-card" 
            style={{ 
              marginTop: 16, 
              background: "rgba(156,39,176,0.1)",
              borderColor: "rgba(156,39,176,0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.5rem" }}>👥</span>
                <div>
                  <div style={{ fontWeight: 600, color: "#9c27b0", marginBottom: 4 }}>
                    Admin Dashboard
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#888" }}>
                    Manage producers, beats, and performance stats.
                  </div>
                </div>
              </div>
              <button
                className="studio-btn studio-btn--outline"
                onClick={() => navigate("/admin/producers")}
                style={{ borderColor: "rgba(156,39,176,0.5)", color: "#9c27b0" }}
              >
                Open Producer Admin →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
