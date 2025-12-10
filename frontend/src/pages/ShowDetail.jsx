import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchShowById } from "../lib/api.js";
import StreamPlayer from "../components/StreamPlayer.jsx";
import { getLivepeerPlaybackUrl } from "../lib/livepeer.js";
import api from "../lib/api.js";

const gold = "#ffb84d";

export default function ShowDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [streamUrl, setStreamUrl] = useState(null);
  const [playbackId, setPlaybackId] = useState("");
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (id) {
      loadShow();
    }
  }, [id]);

  useEffect(() => {
    if (show?.stationId) {
      fetchStationStream();
      checkIfLive();
    }
  }, [show]);

  const loadShow = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchShowById(id);
      if (data?.ok && data.show) {
        setShow(data.show);
      } else {
        setError("Show not found");
      }
    } catch (err) {
      console.error("Error loading show:", err);
      setError("Failed to load show details");
    } finally {
      setLoading(false);
    }
  };

  const fetchStationStream = async () => {
    if (!show?.stationId) return;

    try {
      const stationId = show.stationId._id || show.stationId;
      const slug = show.stationId.slug;

      // Try to fetch station details to get stream info
      let res;
      try {
        res = await api.get(`/tv-stations/${slug}`);
      } catch {
        res = await api.get(`/tv-stations/${stationId}`);
      }

      const station = res.data?.station || res.data;
      if (station) {
        const pid =
          station.ingest?.playbackId ||
          station.playbackId ||
          station.livepeerPlaybackId ||
          "";
        if (pid) {
          setPlaybackId(pid);
          setStreamUrl(getLivepeerPlaybackUrl(pid));
        } else {
          const backendStreamUrl =
            station.liveStreamUrl || station.playbackUrl || null;
          if (backendStreamUrl) {
            setStreamUrl(backendStreamUrl);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching station stream:", err);
    }
  };

  const checkIfLive = () => {
    if (!show) return false;
    const now = new Date();
    const start = new Date(show.startTime);
    const end = new Date(show.endTime);
    const isCurrentlyLive = now >= start && now <= end;
    setIsLive(isCurrentlyLive);
    return isCurrentlyLive;
  };

  useEffect(() => {
    if (show) {
      checkIfLive();
      // Check every 30 seconds if show is live
      const interval = setInterval(() => {
        checkIfLive();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [show]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = () => {
    if (!show) return "";
    const start = new Date(show.startTime);
    const end = new Date(show.endTime);
    const minutes = Math.round((end - start) / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="ps-page">
        <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
          Loading show details...
        </div>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="ps-page">
        <div
          style={{
            padding: "20px",
            borderRadius: 8,
            background: "rgba(239,68,68,0.15)",
            border: "1px solid #ef4444",
            color: "#ef4444",
            marginBottom: 16,
          }}
        >
          {error || "Show not found"}
        </div>
        <Link to="/tv-guide" style={{ color: gold }}>
          ← Back to TV Guide
        </Link>
      </div>
    );
  }

  const station = show.stationId;
  const isCurrentlyLive = isLive;

  return (
    <div className="ps-page">
      <header style={{ marginBottom: 24 }}>
        <Link
          to="/tv-guide"
          style={{
            color: gold,
            textDecoration: "none",
            fontSize: 14,
            marginBottom: 16,
            display: "inline-block",
          }}
        >
          ← Back to TV Guide
        </Link>
        <h1 style={{ color: gold, marginBottom: 8 }}>{show.title}</h1>
        {show.description && (
          <p className="ps-subtitle" style={{ marginBottom: 16 }}>
            {show.description}
          </p>
        )}
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        {/* Main Content */}
        <div>
          {/* Live Stream Section */}
          {isCurrentlyLive && (streamUrl || playbackId) ? (
            <section style={{ marginBottom: 32 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <h2 style={{ margin: 0, color: gold }}>🔴 Live Now</h2>
                <span
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    padding: "6px 12px",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  LIVE
                </span>
              </div>
              <StreamPlayer
                streamUrl={streamUrl}
                playbackId={playbackId}
                stationId={station?._id}
                autoPlay={true}
              />
            </section>
          ) : (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ marginBottom: 16, color: gold }}>Show Information</h2>
              {show.thumbnailUrl && (
                <img
                  src={show.thumbnailUrl}
                  alt={show.title}
                  style={{
                    width: "100%",
                    maxHeight: 400,
                    objectFit: "cover",
                    borderRadius: 12,
                    marginBottom: 16,
                  }}
                />
              )}
              <div
                style={{
                  background: "#111",
                  padding: 20,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
                  {show.description || "No description available."}
                </p>
              </div>
            </section>
          )}

          {/* Schedule Information */}
          <section>
            <h2 style={{ marginBottom: 16, color: gold }}>Schedule</h2>
            <div
              style={{
                background: "#111",
                padding: 20,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                    Start Time
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>
                    {formatTime(show.startTime)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                    End Time
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>
                    {formatTime(show.endTime)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                    Duration
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{formatDuration()}</div>
                </div>
                {show.category && (
                  <div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                      Category
                    </div>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        background: "rgba(255,184,77,0.1)",
                        color: gold,
                        borderRadius: 4,
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {show.category}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside>
          <div
            style={{
              background: "#111",
              padding: 20,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              position: "sticky",
              top: 20,
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 16, color: gold }}>Station</h3>
            {station && (
              <div>
                {station.logoUrl && (
                  <img
                    src={station.logoUrl}
                    alt={station.name}
                    style={{
                      width: "100%",
                      maxWidth: 120,
                      borderRadius: 8,
                      marginBottom: 12,
                    }}
                  />
                )}
                <h4 style={{ margin: 0, marginBottom: 8 }}>{station.name}</h4>
                <Link
                  to={`/tv-stations/${station.slug || station._id}`}
                  style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    background: gold,
                    color: "#000",
                    borderRadius: 6,
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: 14,
                    marginTop: 8,
                  }}
                >
                  View Station →
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

