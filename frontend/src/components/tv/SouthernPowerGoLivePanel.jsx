// frontend/src/components/tv/SouthernPowerGoLivePanel.jsx
// Southern Power Unified Stream - Go Live Panel

import { useEffect, useState } from "react";
import "./SouthernPowerGoLivePanel.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

export default function SouthernPowerGoLivePanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    loadStreamKey();
  }, []);

  async function loadStreamKey() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/stream-keys/southern-power`);
      const json = await res.json();
      
      if (!json.success) {
        throw new Error(json.error || "Failed to load stream key");
      }
      
      setData(json);
      setError("");
    } catch (err) {
      console.error("Failed to load stream key:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (loading) {
    return (
      <div className="sp-go-live-panel loading">
        <div className="spinner" />
        <span>Loading Southern Power stream key...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sp-go-live-panel error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Stream Key</h3>
        <p>{error}</p>
        <button onClick={loadStreamKey}>Try Again</button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="sp-go-live-panel empty">
        <p>No stream key configured</p>
      </div>
    );
  }

  return (
    <div className="sp-go-live-panel">
      <div className="sp-header">
        <div className="sp-logo">🔥</div>
        <div className="sp-title">
          <h2>Southern Power – Unified Live Stream</h2>
          <span className="channel-name">{data.channelName}</span>
        </div>
        {data.isLive && (
          <div className="live-badge">
            <span className="live-dot" />
            LIVE
          </div>
        )}
      </div>

      <div className="sp-instructions">
        <p>Use this RTMP endpoint + key in <strong>OBS</strong>, <strong>Prism</strong>, or your streaming app:</p>
      </div>

      <div className="sp-credentials">
        <div className="sp-field">
          <label>RTMP URL</label>
          <div className="field-value">
            <code>{data.rtmpEndpoint}</code>
            <button 
              className={`copy-btn ${copied === "rtmp" ? "copied" : ""}`}
              onClick={() => copyToClipboard(data.rtmpEndpoint, "rtmp")}
            >
              {copied === "rtmp" ? "✓ Copied" : "📋 Copy"}
            </button>
          </div>
        </div>

        <div className="sp-field">
          <label>Stream Key</label>
          <div className="field-value">
            <code className="stream-key">{data.streamKey}</code>
            <button 
              className={`copy-btn ${copied === "key" ? "copied" : ""}`}
              onClick={() => copyToClipboard(data.streamKey, "key")}
            >
              {copied === "key" ? "✓ Copied" : "📋 Copy"}
            </button>
          </div>
        </div>
      </div>

      {/* Platform Status */}
      {data.platforms && (
        <div className="sp-platforms">
          <h4>Multi-Platform Status</h4>
          <div className="platform-list">
            {Object.entries(data.platforms).map(([name, config]) => (
              <div 
                key={name} 
                className={`platform-item ${config.enabled ? "enabled" : "disabled"} ${config.configured ? "configured" : ""}`}
              >
                <span className="platform-icon">
                  {name === "facebook" && "📘"}
                  {name === "instagram" && "📸"}
                  {name === "youtube" && "📺"}
                  {name === "tiktok" && "🎵"}
                  {name === "twitch" && "🎮"}
                </span>
                <span className="platform-name">{name.charAt(0).toUpperCase() + name.slice(1)}</span>
                <span className={`platform-status ${config.enabled ? "on" : "off"}`}>
                  {config.enabled ? "ON" : "OFF"}
                </span>
                {config.configured ? (
                  <span className="platform-config">✓</span>
                ) : (
                  <span className="platform-config pending">⚙️</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {data.totalStreamMinutes > 0 && (
        <div className="sp-stats">
          <div className="stat">
            <span className="stat-value">{Math.round(data.totalStreamMinutes)}</span>
            <span className="stat-label">Total Minutes Streamed</span>
          </div>
        </div>
      )}

      <div className="sp-note">
        <span className="lock-icon">🔐</span>
        <p>Only authorized accounts (Marcus & Gangsta) are allowed to use this unified key.</p>
      </div>

      <div className="sp-actions">
        <button className="refresh-btn" onClick={loadStreamKey}>
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}

