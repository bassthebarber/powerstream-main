// frontend/src/pages/MultistreamDashboard.jsx
// RTMP Endpoint Management Dashboard
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../lib/api.js";
import "../styles/powerstream-social.css";

const PLATFORMS = [
  { value: "facebook", label: "Facebook Live", icon: "📘" },
  { value: "youtube", label: "YouTube Live", icon: "📺" },
  { value: "twitch", label: "Twitch", icon: "🎮" },
  { value: "kick", label: "Kick", icon: "⚡" },
  { value: "linkedin", label: "LinkedIn Live", icon: "💼" },
  { value: "instagram", label: "Instagram Live", icon: "📷", needsBridge: true },
  { value: "tiktok", label: "TikTok Live", icon: "🎵", needsBridge: true },
  { value: "custom", label: "Custom RTMP", icon: "🔧" },
];

export default function MultistreamDashboard() {
  const { user } = useAuth();
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    platform: "facebook",
    name: "",
    rtmpUrl: "",
    streamKey: "",
    bridgeProxyUrl: "",
  });
  const [statuses, setStatuses] = useState({});

  useEffect(() => {
    fetchEndpoints();
    // Poll status every 5 seconds
    const interval = setInterval(fetchStatuses, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchEndpoints = async () => {
    try {
      const res = await api.get("/rtmp/endpoints");
      if (res.data?.ok) {
        setEndpoints(res.data.endpoints || []);
      }
    } catch (error) {
      console.error("Error fetching endpoints:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const res = await api.get("/rtmp/status");
      if (res.data?.ok && res.data.sessions) {
        // Map session endpoints to status object
        const statusMap = {};
        res.data.sessions.forEach((session) => {
          session.endpoints?.forEach((ep) => {
            statusMap[ep.endpointId] = ep.status;
          });
        });
        setStatuses(statusMap);
      }
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/rtmp/endpoints/${editingId}`, formData);
      } else {
        await api.post("/rtmp/endpoints", formData);
      }
      await fetchEndpoints();
      setShowAddForm(false);
      setEditingId(null);
      setFormData({
        platform: "facebook",
        name: "",
        rtmpUrl: "",
        streamKey: "",
        bridgeProxyUrl: "",
      });
    } catch (error) {
      console.error("Error saving endpoint:", error);
      alert(error.response?.data?.error || "Failed to save endpoint");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this endpoint?")) return;
    try {
      await api.delete(`/rtmp/endpoints/${id}`);
      await fetchEndpoints();
    } catch (error) {
      console.error("Error deleting endpoint:", error);
      alert(error.response?.data?.error || "Failed to delete endpoint");
    }
  };

  const handleEdit = (endpoint) => {
    setEditingId(endpoint.id);
    setFormData({
      platform: endpoint.platform,
      name: endpoint.name,
      rtmpUrl: endpoint.rtmpUrl,
      streamKey: "", // Don't show existing key for security
      bridgeProxyUrl: endpoint.bridgeProxyUrl || "",
    });
    setShowAddForm(true);
  };

  const getStatusColor = (endpoint) => {
    const status = statuses[endpoint.id] || endpoint.lastStatus;
    if (status === "connected") return "#4ade80"; // Green
    if (status === "error" || status === "disconnected") return "#ef4444"; // Red
    return "#fbbf24"; // Yellow
  };

  const getStatusIcon = (endpoint) => {
    const status = statuses[endpoint.id] || endpoint.lastStatus;
    if (status === "connected") return "🟢";
    if (status === "error") return "🔴";
    if (status === "disconnected") return "⚫";
    return "🟡";
  };

  const selectedPlatform = PLATFORMS.find((p) => p.value === formData.platform);

  return (
    <div className="ps-page">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1>🌐 Multistream Dashboard</h1>
        <p className="ps-subtitle">
          Manage RTMP endpoints for simultaneous streaming to multiple platforms
        </p>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="ps-card" style={{ marginBottom: "24px" }}>
            <h2 style={{ marginBottom: "20px", color: "var(--gold)" }}>
              {editingId ? "Edit" : "Add"} RTMP Endpoint
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                  Platform
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "14px",
                  }}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.icon} {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Facebook Live"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                  RTMP URL
                </label>
                <input
                  type="text"
                  value={formData.rtmpUrl}
                  onChange={(e) => setFormData({ ...formData, rtmpUrl: e.target.value })}
                  placeholder="rtmp://rtmp-api.facebook.com:80/rtmp/"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                  Stream Key
                </label>
                <input
                  type="password"
                  value={formData.streamKey}
                  onChange={(e) => setFormData({ ...formData, streamKey: e.target.value })}
                  placeholder="Your stream key"
                  required={!editingId}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "14px",
                  }}
                />
                {editingId && (
                  <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                    Leave empty to keep existing key
                  </p>
                )}
              </div>

              {selectedPlatform?.needsBridge && (
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                    Bridge Proxy URL (Required for {selectedPlatform.label})
                  </label>
                  <input
                    type="text"
                    value={formData.bridgeProxyUrl}
                    onChange={(e) => setFormData({ ...formData, bridgeProxyUrl: e.target.value })}
                    placeholder="https://your-bridge-proxy.com/rtmp"
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px",
                    }}
                  />
                  <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                    Instagram and TikTok require a bridge-proxy service to convert RTMP to their protocols
                  </p>
                </div>
              )}

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="submit"
                  style={{
                    padding: "12px 24px",
                    background: "var(--gold)",
                    color: "#000",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {editingId ? "Update" : "Add"} Endpoint
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                    setFormData({
                      platform: "facebook",
                      name: "",
                      rtmpUrl: "",
                      streamKey: "",
                      bridgeProxyUrl: "",
                    });
                  }}
                  style={{
                    padding: "12px 24px",
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "#fff",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Endpoints List */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              padding: "12px 24px",
              background: "var(--gold)",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              cursor: "pointer",
              marginBottom: "24px",
            }}
          >
            + Add RTMP Endpoint
          </button>
        )}

        {loading ? (
          <p style={{ textAlign: "center", opacity: 0.7 }}>Loading endpoints...</p>
        ) : endpoints.length === 0 ? (
          <div className="ps-card" style={{ textAlign: "center", padding: "48px" }}>
            <p style={{ fontSize: "1.2rem", marginBottom: "16px" }}>No RTMP endpoints configured</p>
            <p style={{ color: "#888", marginBottom: "24px" }}>
              Add endpoints to stream to multiple platforms simultaneously
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                padding: "12px 24px",
                background: "var(--gold)",
                color: "#000",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Add Your First Endpoint
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {endpoints.map((endpoint) => {
              const platform = PLATFORMS.find((p) => p.value === endpoint.platform);
              return (
                <div
                  key={endpoint.id}
                  className="ps-card"
                  style={{
                    border: `2px solid ${getStatusColor(endpoint)}`,
                    opacity: endpoint.isActive ? 1 : 0.6,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "1.5rem" }}>{platform?.icon || "🔧"}</span>
                        <h3 style={{ margin: 0, color: "var(--gold)" }}>{endpoint.name}</h3>
                        <span style={{ fontSize: "1.2rem" }}>{getStatusIcon(endpoint)}</span>
                      </div>
                      <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "4px" }}>
                        {platform?.label || endpoint.platform}
                      </p>
                      <p style={{ color: "#888", fontSize: "0.85rem", fontFamily: "monospace" }}>
                        {endpoint.rtmpUrl}
                      </p>
                      {endpoint.needsBridgeProxy && (
                        <p style={{ color: "#fbbf24", fontSize: "0.85rem", marginTop: "8px" }}>
                          ⚠️ Requires bridge-proxy: {endpoint.bridgeProxyUrl || "Not configured"}
                        </p>
                      )}
                      {endpoint.lastError && (
                        <p style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "8px" }}>
                          Error: {endpoint.lastError}
                        </p>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleEdit(endpoint)}
                        style={{
                          padding: "8px 16px",
                          background: "rgba(255, 184, 77, 0.2)",
                          border: "1px solid rgba(255, 184, 77, 0.4)",
                          borderRadius: "6px",
                          color: "#ffb84d",
                          fontWeight: 600,
                          cursor: "pointer",
                          fontSize: "0.85rem",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(endpoint.id)}
                        style={{
                          padding: "8px 16px",
                          background: "rgba(239, 68, 68, 0.2)",
                          border: "1px solid rgba(239, 68, 68, 0.4)",
                          borderRadius: "6px",
                          color: "#ef4444",
                          fontWeight: 600,
                          cursor: "pointer",
                          fontSize: "0.85rem",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "8px",
                      background: "rgba(0, 0, 0, 0.3)",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#888" }}>Status:</span>
                      <span style={{ color: getStatusColor(endpoint), fontWeight: 600 }}>
                        {statuses[endpoint.id] || endpoint.lastStatus || "unknown"}
                      </span>
                    </div>
                    {endpoint.lastConnectedAt && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                        <span style={{ color: "#888" }}>Last Connected:</span>
                        <span style={{ color: "#888" }}>
                          {new Date(endpoint.lastConnectedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}






