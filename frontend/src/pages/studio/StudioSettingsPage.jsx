// frontend/src/pages/studio/StudioSettingsPage.jsx
// Studio Settings - Organized Preferences
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import studioClient from "../../lib/studioClient.js";
import "../../styles/studio-unified.css";

export default function StudioSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    // Audio Settings
    sampleRate: "48000",
    bitDepth: "24",
    defaultBpmMin: 60,
    defaultBpmMax: 180,
    defaultKey: "C minor",
    latencyMode: "low",
    // Appearance
    theme: "dark",
    waveformColor: "#ffb84d",
    // Notifications
    emailNotifications: true,
    exportComplete: true,
    collaboratorUpdates: true,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [studioApiStatus, setStudioApiStatus] = useState("checking");
  const [backendApiStatus, setBackendApiStatus] = useState("checking");

  useEffect(() => {
    runHealthChecks();
  }, []);

  const runHealthChecks = async () => {
    // Check Studio API
    try {
      await studioClient.get("/health");
      setStudioApiStatus("online");
    } catch {
      setStudioApiStatus("offline");
    }

    // Check Backend API
    try {
      const res = await fetch("/api/health");
      setBackendApiStatus(res.ok ? "online" : "offline");
    } catch {
      setBackendApiStatus("offline");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      // Simulate save
      await new Promise(r => setTimeout(r, 800));
      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      {/* Header */}
      <div className="studio-header">
        <h1 className="studio-header-title">⚙️ Settings</h1>
        <p className="studio-header-subtitle">Configure your studio workspace</p>
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

      {/* API Status Section */}
      <div className="studio-section">
        <div className="studio-section-header">
          <h2 className="studio-section-title">
            <span className="studio-section-title-icon">📡</span>
            API Status
          </h2>
        </div>

        <div className="studio-card">
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {/* Studio API */}
            <div style={{
              flex: "1 1 200px",
              padding: 16,
              background: "rgba(255,255,255,0.03)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.08)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: studioApiStatus === "online" ? "#00c864" : studioApiStatus === "checking" ? "#ff9500" : "#ff4444",
                  boxShadow: studioApiStatus === "online" ? "0 0 10px rgba(0,200,100,0.5)" : "none",
                  animation: studioApiStatus === "checking" ? "studio-pulse 1s infinite" : "none"
                }} />
                <span style={{ fontWeight: 700 }}>Recording Studio API</span>
              </div>
              <div className={`studio-status ${studioApiStatus === "online" ? "studio-status--online" : studioApiStatus === "checking" ? "studio-status--warning" : "studio-status--offline"}`}>
                <span>{studioApiStatus === "online" ? "✓ Online" : studioApiStatus === "checking" ? "⏳ Checking..." : "✗ Offline"}</span>
              </div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
                Port 5100 • AI Beat Engine, Mix, Record
              </div>
            </div>

            {/* Backend API */}
            <div style={{
              flex: "1 1 200px",
              padding: 16,
              background: "rgba(255,255,255,0.03)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.08)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: backendApiStatus === "online" ? "#00c864" : backendApiStatus === "checking" ? "#ff9500" : "#ff4444",
                  boxShadow: backendApiStatus === "online" ? "0 0 10px rgba(0,200,100,0.5)" : "none",
                  animation: backendApiStatus === "checking" ? "studio-pulse 1s infinite" : "none"
                }} />
                <span style={{ fontWeight: 700 }}>PowerStream Backend</span>
              </div>
              <div className={`studio-status ${backendApiStatus === "online" ? "studio-status--online" : backendApiStatus === "checking" ? "studio-status--warning" : "studio-status--offline"}`}>
                <span>{backendApiStatus === "online" ? "✓ Online" : backendApiStatus === "checking" ? "⏳ Checking..." : "✗ Offline"}</span>
              </div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
                Port 5000 • Auth, Library, Exports
              </div>
            </div>

            {/* Refresh Button */}
            <button 
              className="studio-btn studio-btn--outline"
              onClick={runHealthChecks}
              style={{ alignSelf: "center" }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Audio Settings Section */}
      <div className="studio-section">
        <div className="studio-section-header">
          <h2 className="studio-section-title">
            <span className="studio-section-title-icon">🎚️</span>
            Audio Settings
          </h2>
        </div>

        <div className="studio-card">
          <div className="studio-grid studio-grid--2">
            <div>
              <label className="studio-label">Sample Rate</label>
              <select
                className="studio-select"
                value={settings.sampleRate}
                onChange={(e) => updateSetting("sampleRate", e.target.value)}
              >
                <option value="44100">44.1 kHz</option>
                <option value="48000">48 kHz (Recommended)</option>
                <option value="96000">96 kHz</option>
              </select>
            </div>

            <div>
              <label className="studio-label">Bit Depth</label>
              <select
                className="studio-select"
                value={settings.bitDepth}
                onChange={(e) => updateSetting("bitDepth", e.target.value)}
              >
                <option value="16">16-bit</option>
                <option value="24">24-bit (Recommended)</option>
                <option value="32">32-bit float</option>
              </select>
            </div>

            <div>
              <label className="studio-label">Default BPM Range</label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input
                  type="number"
                  className="studio-input"
                  value={settings.defaultBpmMin}
                  onChange={(e) => updateSetting("defaultBpmMin", parseInt(e.target.value))}
                  min="40"
                  max="200"
                  style={{ flex: 1 }}
                />
                <span style={{ color: "#888" }}>to</span>
                <input
                  type="number"
                  className="studio-input"
                  value={settings.defaultBpmMax}
                  onChange={(e) => updateSetting("defaultBpmMax", parseInt(e.target.value))}
                  min="40"
                  max="200"
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div>
              <label className="studio-label">Default Key</label>
              <input
                type="text"
                className="studio-input"
                value={settings.defaultKey}
                onChange={(e) => updateSetting("defaultKey", e.target.value)}
                placeholder="C minor"
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="studio-label">Latency Mode</label>
              <div style={{ display: "flex", gap: 12 }}>
                {["low", "balanced", "quality"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updateSetting("latencyMode", mode)}
                    className={`studio-chip ${settings.latencyMode === mode ? "studio-chip--active" : ""}`}
                    style={{ flex: 1, textTransform: "capitalize" }}
                  >
                    {mode === "low" && "⚡ "}
                    {mode === "balanced" && "⚖️ "}
                    {mode === "quality" && "💎 "}
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="studio-section">
        <div className="studio-section-header">
          <h2 className="studio-section-title">
            <span className="studio-section-title-icon">🎨</span>
            Appearance
          </h2>
        </div>

        <div className="studio-card">
          <div className="studio-grid studio-grid--2">
            <div>
              <label className="studio-label">Theme</label>
              <select
                className="studio-select"
                value={settings.theme}
                onChange={(e) => updateSetting("theme", e.target.value)}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>

            <div>
              <label className="studio-label">Waveform Color</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["#ffb84d", "#ff4d94", "#4d94ff", "#4dff94", "#ff4444"].map((c) => (
                  <button
                    key={c}
                    onClick={() => updateSetting("waveformColor", c)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: c,
                      border: settings.waveformColor === c ? "3px solid #fff" : "1px solid rgba(255,255,255,0.2)",
                      cursor: "pointer"
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="studio-section">
        <div className="studio-section-header">
          <h2 className="studio-section-title">
            <span className="studio-section-title-icon">🔔</span>
            Notifications
          </h2>
        </div>

        <div className="studio-card">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { key: "emailNotifications", label: "Email Notifications", desc: "Receive important updates via email" },
              { key: "exportComplete", label: "Export Complete", desc: "Notify when exports finish processing" },
              { key: "collaboratorUpdates", label: "Collaborator Updates", desc: "Notify when collaborators make changes" },
            ].map((item) => (
              <label 
                key={item.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: 16,
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 10,
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.08)"
                }}
              >
                <input
                  type="checkbox"
                  checked={settings[item.key]}
                  onChange={(e) => updateSetting(item.key, e.target.checked)}
                  style={{ 
                    width: 20, 
                    height: 20, 
                    accentColor: "#ffb84d",
                    cursor: "pointer"
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{item.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button
          className="studio-btn studio-btn--primary studio-btn--large"
          onClick={handleSave}
          disabled={saving}
          style={{ flex: 1 }}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
        <button className="studio-btn studio-btn--outline studio-btn--large">
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
