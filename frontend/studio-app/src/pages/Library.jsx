// frontend/studio-app/src/pages/Library.jsx
// Library - Central Vault with Tabs for Recordings, Beats, Mixdowns
// Uses real database queries via studioApi
// UPGRADED: Beat actions - open in player, send to record/mix, TV export

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/studio.css";
import { 
  getLibraryRecordings, 
  getLibraryBeats, 
  getLibraryMixes 
} from "../lib/studioApi.js";
import { useStudioSession } from "../context/StudioSessionContext.jsx";
import TVExportModal from "../components/TVExportModal.jsx";

const TABS = [
  { id: "recordings", label: "🎙️ Recordings", icon: "🎙️" },
  { id: "beats", label: "🥁 Beats", icon: "🥁" },
  { id: "mixdowns", label: "🎚️ Mixdowns", icon: "🎚️" },
];

export default function Library() {
  const navigate = useNavigate();
  const { loadBeat } = useStudioSession();
  
  const [activeTab, setActiveTab] = useState("recordings");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playingId, setPlayingId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // TV Export Modal
  const [tvModalOpen, setTvModalOpen] = useState(false);
  const [tvExportItem, setTvExportItem] = useState(null);
  
  const audioRef = useRef(null);

  // Fetch items based on active tab
  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    setItems([]);

    try {
      let data = [];
      
      switch (activeTab) {
        case "recordings":
          data = await getLibraryRecordings({ limit: 50 });
          break;
        case "beats":
          data = await getLibraryBeats({ limit: 50 });
          break;
        case "mixdowns":
          data = await getLibraryMixes({ limit: 50 });
          break;
      }

      setItems(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Play/pause audio
  const togglePlay = (item) => {
    if (playingId === item._id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current && item.url) {
        audioRef.current.src = item.url;
        audioRef.current.play().catch(err => {
          console.error("Play error:", err);
          setPlayingId(null);
        });
      }
      setPlayingId(item._id);
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get item type badge color
  const getTypeBadge = (type) => {
    const colors = {
      recording: { bg: "rgba(0,200,100,0.15)", color: "#00c864" },
      beat: { bg: "rgba(230,184,0,0.15)", color: "#e6b800" },
      mixdown: { bg: "rgba(68,136,255,0.15)", color: "#4488ff" },
    };
    return colors[type] || colors.recording;
  };

  // Open beat in Beat Player
  const openInBeatPlayer = (item) => {
    loadBeat({
      id: item._id,
      name: item.name || item.title,
      bpm: item.bpm,
      key: item.key,
      style: item.style || item.genre,
      mood: item.mood,
      audioUrl: item.url || item.audioUrl,
      pattern: item.pattern,
    });
    navigate("/player", {
      state: {
        beat: {
          id: item._id,
          name: item.name || item.title,
          bpm: item.bpm,
          key: item.key,
          audioUrl: item.url || item.audioUrl,
          pattern: item.pattern,
        },
      },
    });
  };

  // Send item to Record Booth
  const sendToRecordBooth = (item) => {
    navigate("/recordboot", {
      state: {
        backingTrack: {
          name: item.name || item.title,
          bpm: item.bpm,
          audioUrl: item.url || item.audioUrl,
        },
      },
    });
  };

  // Send item to Mix Room
  const sendToMixRoom = (item) => {
    navigate("/mix", {
      state: {
        beat: {
          name: item.name || item.title,
          bpm: item.bpm,
          audioUrl: item.url || item.audioUrl,
        },
      },
    });
  };

  // Open in Beat Lab for editing
  const openInBeatLab = (item) => {
    navigate("/beat-lab", {
      state: {
        beat: {
          id: item._id,
          name: item.name || item.title,
          bpm: item.bpm,
          key: item.key,
          mood: item.mood || item.style,
          audioUrl: item.url || item.audioUrl,
          pattern: item.pattern,
        },
      },
    });
  };

  return (
    <div className="studio-page">
      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        onEnded={() => setPlayingId(null)}
        style={{ display: "none" }}
      />

      {/* Header */}
      <div className="studio-header">
        <div>
          <h1 className="studio-title">Library</h1>
          <p className="studio-subtitle">Central Vault · All Your Studio Assets</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <span className="studio-badge" style={{ 
            background: "rgba(0,200,100,0.15)", 
            color: "#00c864",
            border: "1px solid rgba(0,200,100,0.3)"
          }}>
            {items.length} Items
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="studio-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`studio-tab ${activeTab === tab.id ? "studio-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="studio-status studio-status--error" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Content */}
      <div className="studio-panel">
        {loading ? (
          <div style={{ textAlign: "center", padding: 48, color: "#888" }}>
            <div style={{ fontSize: "2rem", marginBottom: 16 }}>📂</div>
            Loading {activeTab}...
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48, color: "#888" }}>
            <div style={{ fontSize: "2rem", marginBottom: 16 }}>
              {activeTab === "recordings" ? "🎙️" : activeTab === "beats" ? "🥁" : "🎚️"}
            </div>
            <div style={{ marginBottom: 16 }}>No {activeTab} found in the library.</div>
            <Link 
              to={activeTab === "recordings" ? "/recordboot" : activeTab === "beats" ? "/beat-lab" : "/mix"}
              className="studio-btn studio-btn--gold"
            >
              Create {activeTab === "recordings" ? "Recording" : activeTab === "beats" ? "Beat" : "Mix"}
            </Link>
          </div>
        ) : (
          <div className="studio-grid studio-grid--auto">
            {items.map((item, index) => (
              <div key={item._id || index} className="studio-card">
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <h4 style={{ margin: "0 0 4px", fontSize: "1rem", fontWeight: 700, color: "#f4f4f7" }}>
                      {item.name || item.title || `Untitled ${activeTab.slice(0, -1)}`}
                    </h4>
                    <div style={{ fontSize: "0.8rem", color: "#888" }}>
                      {formatDate(item.createdAt)}
                      {item.artistName && ` · ${item.artistName}`}
                    </div>
                  </div>
                  <span 
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      ...getTypeBadge(item.type || activeTab.slice(0, -1)),
                    }}
                  >
                    {item.type || activeTab.slice(0, -1)}
                  </span>
                </div>

                {/* Metadata */}
                {(item.bpm || item.key || item.duration || item.loudness) && (
                  <div style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: "0.85rem", color: "#888" }}>
                    {item.bpm && <span>{item.bpm} BPM</span>}
                    {item.key && <span>{item.key}</span>}
                    {item.duration && <span>{Math.round(item.duration)}s</span>}
                    {item.loudness && <span>{item.loudness.toFixed(1)} LUFS</span>}
                  </div>
                )}

                {/* AI Score (for recordings) */}
                {item.aiScore && (
                  <div className="studio-card" style={{ padding: 8, marginBottom: 12, textAlign: "center" }}>
                    <div style={{ fontSize: "0.7rem", color: "#888" }}>AI Score</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#e6b800" }}>{item.aiScore}</div>
                  </div>
                )}

                {/* Waveform placeholder */}
                <div 
                  style={{
                    height: 40,
                    background: item.url 
                      ? "linear-gradient(90deg, rgba(230,184,0,0.1), rgba(230,184,0,0.3), rgba(230,184,0,0.1))"
                      : "rgba(255,255,255,0.05)",
                    borderRadius: 8,
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {playingId === item._id && (
                    <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 20 }}>
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          style={{
                            width: 3,
                            background: "#e6b800",
                            borderRadius: 2,
                            animation: `waveform 0.5s ease-in-out ${i * 0.1}s infinite alternate`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {!item.url && (
                    <span style={{ fontSize: "0.75rem", color: "#555" }}>No audio</span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    className={`studio-btn studio-btn--sm ${playingId === item._id ? "studio-btn--gold" : ""}`}
                    onClick={() => togglePlay(item)}
                    disabled={!item.url}
                    style={{ flex: 1, minWidth: 80 }}
                  >
                    {playingId === item._id ? "⏹ Stop" : "▶️ Play"}
                  </button>
                  
                  {/* Beat-specific actions */}
                  {activeTab === "beats" && (
                    <>
                      <button
                        className="studio-btn studio-btn--sm studio-btn--outline"
                        onClick={() => openInBeatPlayer(item)}
                        title="Open in Beat Player"
                      >
                        🎹
                      </button>
                      <button
                        className="studio-btn studio-btn--sm"
                        onClick={() => openInBeatLab(item)}
                        title="Edit in Beat Lab"
                      >
                        ✏️
                      </button>
                    </>
                  )}
                  
                  {/* Send to Mix (for recordings and beats) */}
                  {activeTab !== "mixdowns" && (
                    <button
                      className="studio-btn studio-btn--sm studio-btn--outline"
                      onClick={() => sendToMixRoom(item)}
                      title="Send to Mix Room"
                    >
                      🎚️
                    </button>
                  )}
                  
                  {/* Send to Record Booth (for beats) */}
                  {activeTab === "beats" && (
                    <button
                      className="studio-btn studio-btn--sm"
                      onClick={() => sendToRecordBooth(item)}
                      title="Use as backing track"
                    >
                      🎙️
                    </button>
                  )}
                  
                  {/* Voice Training Sample (for recordings) */}
                  {activeTab === "recordings" && (
                    <button
                      className="studio-btn studio-btn--sm"
                      onClick={() => navigate("/voice-studio", { 
                        state: { 
                          preSelectSample: item._id,
                          sampleTitle: item.name || item.title 
                        } 
                      })}
                      title="Use for AI Voice Training"
                      style={{ background: "rgba(156,39,176,0.2)", border: "1px solid rgba(156,39,176,0.4)" }}
                    >
                      🗣️
                    </button>
                  )}
                  
                  {/* TV Export */}
                  <button
                    className="studio-btn studio-btn--sm"
                    onClick={() => {
                      setTvExportItem({
                        _id: item._id,
                        title: item.name || item.title,
                        name: item.name || item.title,
                        type: item.type || activeTab.slice(0, -1),
                        artistName: item.artistName,
                        bpm: item.bpm,
                        key: item.key,
                        duration: item.duration,
                        fileUrl: item.url || item.audioUrl,
                      });
                      setTvModalOpen(true);
                    }}
                    disabled={!item.url}
                    title="Send to PowerStream TV"
                    style={{ 
                      background: "rgba(156,39,176,0.2)", 
                      border: "1px solid rgba(156,39,176,0.4)" 
                    }}
                  >
                    📺
                  </button>
                  
                  {/* Download */}
                  <button
                    className="studio-btn studio-btn--sm"
                    onClick={() => {
                      if (item.url) {
                        const a = document.createElement("a");
                        a.href = item.url;
                        a.download = item.name || "download";
                        a.click();
                      }
                    }}
                    disabled={!item.url}
                    title="Download"
                  >
                    ⬇️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TV Export Modal */}
      <TVExportModal
        isOpen={tvModalOpen}
        onClose={() => {
          setTvModalOpen(false);
          setTvExportItem(null);
        }}
        item={tvExportItem}
        onSuccess={(result) => {
          console.log("TV Export success:", result);
        }}
      />

      {/* CSS for waveform animation */}
      <style>{`
        @keyframes waveform {
          from { height: 5px; }
          to { height: 20px; }
        }
      `}</style>
    </div>
  );
}
