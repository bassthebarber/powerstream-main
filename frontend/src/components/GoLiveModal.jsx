// frontend/src/components/GoLiveModal.jsx
// Go Live Modal with Multistream Status
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { startStream, stopStream } from "../lib/streamApi.js";
import api from "../lib/api.js";

export default function GoLiveModal({
  isOpen,
  onClose,
  stationId,
  stationName,
  onStarted,
  onStopped,
}) {
  const { user } = useAuth();
  const [streamKey, setStreamKey] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [multistreamStatus, setMultistreamStatus] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [selectedEndpoints, setSelectedEndpoints] = useState([]);
  const [recordingEnabled, setRecordingEnabled] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchEndpoints();
      fetchProfiles();
      fetchStreamStatus();
    }
  }, [isOpen, stationId]);

  useEffect(() => {
    if (isLive && sessionId) {
      const interval = setInterval(() => {
        fetchMultistreamStatus();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isLive, sessionId]);

  const fetchEndpoints = async () => {
    try {
      const params = stationId ? { stationId } : {};
      const res = await api.get("/rtmp/endpoints", { params });
      if (res.data?.ok) {
        const fetchedEndpoints = res.data.endpoints || [];
        setEndpoints(fetchedEndpoints);
        // Auto-select all active endpoints by default
        setSelectedEndpoints(fetchedEndpoints.filter((ep) => ep.isActive).map((ep) => ep.id));
      }
    } catch (error) {
      console.error("Error fetching endpoints:", error);
    }
  };

  const fetchProfiles = async () => {
    try {
      const params = stationId ? { stationId } : {};
      const res = await api.get("/multistream/profiles", { params });
      if (res.data?.ok) {
        setProfiles(res.data.profiles || []);
        // Auto-select default profile if exists
        const defaultProfile = res.data.profiles.find((p) => p.isDefault);
        if (defaultProfile) {
          setSelectedProfileId(defaultProfile.id);
          setSelectedEndpoints(defaultProfile.endpointIds || []);
        }
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const fetchStreamStatus = async () => {
    try {
      const res = await api.get("/live/status");
      if (res.data?.isLive) {
        setIsLive(true);
        setSessionId(res.data.sessionId);
        setStreamKey(res.data.streamKey);
        setTitle(res.data.title || "");
        if (res.data.multistream) {
          setMultistreamStatus(res.data.multistream);
        }
      }
    } catch (error) {
      console.error("Error fetching stream status:", error);
    }
  };

  const fetchMultistreamStatus = async () => {
    try {
      const res = await api.get("/rtmp/status");
      if (res.data?.ok && res.data.sessions) {
        const currentSession = res.data.sessions.find((s) => s.sessionId === sessionId);
        if (currentSession) {
          setMultistreamStatus(currentSession);
        }
      }
    } catch (error) {
      console.error("Error fetching multistream status:", error);
    }
  };

  const handleGoLive = async () => {
    if (!streamKey.trim()) {
      alert("Please enter a stream key");
      return;
    }

    setLoading(true);
    try {
      const result = await startStream({
        streamKey: streamKey.trim(),
        title: title.trim() || (stationName ? `${stationName} Live` : "PowerStream Live"),
        description: description.trim(),
        stationId,
        useMultistream: true,
        profileId: selectedProfileId || null,
        selectedEndpoints: selectedProfileId ? null : selectedEndpoints,
        recordingEnabled,
      });

      if (result?.sessionId) {
        setSessionId(result.sessionId);
        setIsLive(true);
        if (result.multistream) {
          setMultistreamStatus(result.multistream);
        }
        if (typeof onStarted === "function") {
          onStarted(result);
        }
      }
    } catch (error) {
      console.error("Error starting stream:", error);
      alert(error.response?.data?.error || error.message || "Failed to start stream");
    } finally {
      setLoading(false);
    }
  };

  const toggleEndpoint = (endpointId) => {
    setSelectedEndpoints((prev) => {
      if (prev.includes(endpointId)) {
        return prev.filter((id) => id !== endpointId);
      } else {
        return [...prev, endpointId];
      }
    });
    // Clear profile selection when manually toggling endpoints
    setSelectedProfileId(null);
  };

  const handleStopLive = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      await stopStream(sessionId);
      setIsLive(false);
      setSessionId(null);
      setMultistreamStatus(null);
      setStreamKey("");
      setTitle("");
      if (typeof onStopped === "function") {
        onStopped();
      }
    } catch (error) {
      console.error("Error stopping stream:", error);
      alert(error.message || "Failed to stop stream");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === "connected") return "#4ade80";
    if (status === "error" || status === "disconnected") return "#ef4444";
    return "#fbbf24";
  };

  const getStatusIcon = (status) => {
    if (status === "connected") return "🟢";
    if (status === "error") return "🔴";
    if (status === "disconnected") return "⚫";
    return "🟡";
  };

  if (!isOpen) return null;

  const activeEndpoints = endpoints.filter((ep) => ep.isActive);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "24px",
      }}
      onClick={onClose}
    >
      <div
        className="ps-card"
        style={{
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ color: "var(--gold)", margin: 0 }}>🔴 Go Live</h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "24px",
              cursor: "pointer",
              padding: "0",
              width: "32px",
              height: "32px",
            }}
          >
            ×
          </button>
        </div>

        {!isLive ? (
          <>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                Stream Key
              </label>
              <input
                type="text"
                value={streamKey}
                onChange={(e) => setStreamKey(e.target.value)}
                placeholder="Enter your stream key"
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

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                Stream Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Live Stream"
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

            {activeEndpoints.length > 0 && (
              <div style={{ marginBottom: "20px", padding: "12px", background: "rgba(255, 184, 77, 0.1)", borderRadius: "8px" }}>
                <p style={{ fontSize: "0.9rem", color: "#ffb84d", marginBottom: "8px", fontWeight: 600 }}>
                  📡 Multistream Active
                </p>
                <p style={{ fontSize: "0.85rem", color: "#888" }}>
                  Your stream will be sent to {activeEndpoints.length} platform{activeEndpoints.length !== 1 ? "s" : ""}:
                </p>
                <ul style={{ fontSize: "0.85rem", color: "#888", marginTop: "8px", paddingLeft: "20px" }}>
                  {activeEndpoints.map((ep) => (
                    <li key={ep.id}>{ep.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeEndpoints.length === 0 && (
              <div style={{ marginBottom: "20px", padding: "12px", background: "rgba(251, 191, 36, 0.1)", borderRadius: "8px" }}>
                <p style={{ fontSize: "0.9rem", color: "#fbbf24", marginBottom: "8px" }}>
                  ⚠️ No RTMP endpoints configured
                </p>
                <p style={{ fontSize: "0.85rem", color: "#888" }}>
                  Stream will only go to PowerStream. Configure multistream endpoints in the dashboard.
                </p>
              </div>
            )}

            <button
              onClick={handleGoLive}
              disabled={loading || !streamKey.trim()}
              style={{
                width: "100%",
                padding: "14px",
                background: loading ? "#666" : "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Starting..." : "🔴 Go Live"}
            </button>
          </>
        ) : (
          <>
            <div style={{ marginBottom: "20px", padding: "16px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "8px", border: "2px solid #ef4444" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <span style={{ fontSize: "1.5rem" }}>🔴</span>
                <span style={{ fontSize: "1.2rem", fontWeight: 700 }}>LIVE</span>
              </div>
              <p style={{ color: "#888", fontSize: "0.9rem", margin: 0 }}>{title || "Untitled Stream"}</p>
            </div>

            {multistreamStatus && multistreamStatus.endpoints && multistreamStatus.endpoints.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "1rem", marginBottom: "12px", color: "var(--gold)" }}>
                  Multistream Status
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {multistreamStatus.endpoints.map((ep, idx) => {
                    const endpoint = endpoints.find((e) => e.id === ep.endpointId);
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: "12px",
                          background: "rgba(255, 255, 255, 0.05)",
                          borderRadius: "8px",
                          border: `1px solid ${getStatusColor(ep.status)}`,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span>{getStatusIcon(ep.status)}</span>
                              <span style={{ fontWeight: 600 }}>{endpoint?.name || ep.platform}</span>
                            </div>
                            {ep.error && (
                              <p style={{ fontSize: "0.85rem", color: "#ef4444", marginTop: "4px", margin: 0 }}>
                                {ep.error}
                              </p>
                            )}
                          </div>
                          <span style={{ color: getStatusColor(ep.status), fontWeight: 600, fontSize: "0.85rem" }}>
                            {ep.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={handleStopLive}
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: loading ? "#666" : "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Stopping..." : "⏹ Stop Stream"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
