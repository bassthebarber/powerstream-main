// frontend/studio-app/src/pages/BeatStore.jsx
// Beat Store - Marketplace View with Filters and Preview
// Wired to Library, Beat Player, and Record Booth

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/studio.css";
import { STUDIO_API_BASE } from "../config/api.js";

// Use centralized API config
const STUDIO_API = STUDIO_API_BASE;

const GENRES = [
  { value: "", label: "All Genres" },
  { value: "trap", label: "Trap" },
  { value: "drill", label: "Drill" },
  { value: "rnb", label: "R&B" },
  { value: "hiphop", label: "Hip-Hop" },
  { value: "southern", label: "Southern" },
  { value: "gospel", label: "Gospel" },
  { value: "pop", label: "Pop" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
];

export default function BeatStore() {
  const navigate = useNavigate();
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [bpmMin, setBpmMin] = useState(60);
  const [bpmMax, setBpmMax] = useState(180);
  const [sortBy, setSortBy] = useState("newest");

  // Currently playing
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null);

  // Fetch beats from Beat Store API
  useEffect(() => {
    fetchBeats();
  }, [genre, sortBy]);

  const fetchBeats = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (genre) params.append("genre", genre);
      if (sortBy) params.append("sort", sortBy);
      if (bpmMin) params.append("bpmMin", bpmMin);
      if (bpmMax) params.append("bpmMax", bpmMax);
      if (search) params.append("search", search);

      // Use new Beat Store API endpoint
      const res = await fetch(`${STUDIO_API}/api/studio/beats?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load beats");
      }

      setBeats(data.beats || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      // Use stub data if API fails
      setBeats(STUB_BEATS);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Play/pause beat preview
  const togglePlay = (beat) => {
    if (playingId === beat._id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = beat.previewUrl;
        audioRef.current.play();
      }
      setPlayingId(beat._id);
    }
  };

  // Add to library
  const addToLibrary = async (beat) => {
    try {
      await fetch(`${STUDIO_API}/api/studio/beats/${beat._id}/add-to-library`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      showToast(`"${beat.title}" added to library!`, "success");
    } catch (err) {
      console.error("Add error:", err);
      showToast("Failed to add to library", "error");
    }
  };

  // Use this beat in Record Booth
  const useThisBeat = (beat) => {
    // Log the play
    fetch(`${STUDIO_API}/api/studio/beats/${beat._id}/play`, { method: "POST" }).catch(() => {});

    // Navigate to Record Booth with beat preloaded
    navigate("/recordboot", {
      state: {
        backingTrack: {
          id: beat._id,
          name: beat.title,
          title: beat.title,
          bpm: beat.bpm,
          key: beat.key,
          audioUrl: beat.previewUrl || beat.fileUrl,
          genre: beat.genre,
          mood: beat.mood,
          duration: beat.duration,
          producer: beat.producer,
        },
        fromBeatStore: true,
      },
    });
  };

  // Open in Beat Player
  const openInBeatPlayer = (beat) => {
    navigate("/player", {
      state: {
        beat: {
          id: beat._id,
          name: beat.title,
          bpm: beat.bpm,
          key: beat.key,
          audioUrl: beat.previewUrl || beat.fileUrl,
          pattern: beat.pattern,
          genre: beat.genre,
          mood: beat.mood,
        },
      },
    });
  };

  // Filter beats by search
  const filteredBeats = beats.filter(beat => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      beat.title?.toLowerCase().includes(searchLower) ||
      beat.producer?.toLowerCase().includes(searchLower) ||
      beat.tags?.some(t => t.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="studio-page">
      {/* Toast Notification */}
      {toast && (
        <div 
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            padding: "16px 24px",
            borderRadius: 12,
            background: toast.type === "success" 
              ? "linear-gradient(135deg, rgba(0,200,100,0.95), rgba(0,150,80,0.95))"
              : "linear-gradient(135deg, rgba(255,68,85,0.95), rgba(200,50,60,0.95))",
            color: "#fff",
            fontWeight: 600,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            zIndex: 9999,
            animation: "slideIn 0.3s ease-out",
          }}
        >
          {toast.type === "success" ? "✅" : "❌"} {toast.message}
        </div>
      )}

      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        onEnded={() => setPlayingId(null)}
        style={{ display: "none" }}
      />

      {/* Header */}
      <div className="studio-header">
        <div>
          <h1 className="studio-title">Beat Store</h1>
          <p className="studio-subtitle">Browse & License Premium Beats · No Limit East Houston Collection</p>
        </div>
        <div className="studio-badge">AI Curated</div>
      </div>

      {/* Search & Filters */}
      <div className="studio-panel" style={{ marginBottom: 24 }}>
        <div className="studio-grid" style={{ gridTemplateColumns: "1fr auto auto auto", gap: 16, alignItems: "end" }}>
          {/* Search */}
          <div className="studio-field" style={{ margin: 0 }}>
            <label className="studio-label">Search</label>
            <input
              type="text"
              className="studio-input"
              placeholder="Search beats, producers, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Genre Filter */}
          <div className="studio-field" style={{ margin: 0, minWidth: 150 }}>
            <label className="studio-label">Genre</label>
            <select
              className="studio-select"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              {GENRES.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          {/* BPM Range */}
          <div className="studio-field" style={{ margin: 0 }}>
            <label className="studio-label">BPM: {bpmMin} - {bpmMax}</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="number"
                className="studio-input"
                value={bpmMin}
                onChange={(e) => setBpmMin(Number(e.target.value))}
                style={{ width: 70 }}
              />
              <input
                type="number"
                className="studio-input"
                value={bpmMax}
                onChange={(e) => setBpmMax(Number(e.target.value))}
                style={{ width: 70 }}
              />
            </div>
          </div>

          {/* Sort */}
          <div className="studio-field" style={{ margin: 0, minWidth: 150 }}>
            <label className="studio-label">Sort By</label>
            <select
              className="studio-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="studio-status studio-status--error" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="studio-panel" style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: "2rem", marginBottom: 16 }}>🎵</div>
          <div style={{ color: "#888" }}>Loading beats...</div>
        </div>
      ) : filteredBeats.length === 0 ? (
        <div className="studio-panel" style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: "2rem", marginBottom: 16 }}>🔍</div>
          <div style={{ color: "#888" }}>No beats found. Try adjusting your filters.</div>
        </div>
      ) : (
        /* Beat Cards Grid */
        <div className="studio-grid studio-grid--auto">
          {filteredBeats.map(beat => (
            <div key={beat._id} className="studio-panel" style={{ padding: 0, overflow: "hidden" }}>
              {/* Beat Header */}
              <div style={{ 
                padding: "16px 20px", 
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                background: "linear-gradient(135deg, rgba(230,184,0,0.05), transparent)"
              }}>
                <h3 style={{ 
                  margin: "0 0 4px", 
                  fontSize: "1rem", 
                  fontWeight: 700, 
                  color: "#f4f4f7" 
                }}>
                  {beat.title}
                </h3>
                <div style={{ fontSize: "0.85rem", color: "#888" }}>
                  by {beat.producer}
                </div>
              </div>

              {/* Beat Info */}
              <div style={{ padding: 20 }}>
                <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                  <div className="studio-card" style={{ flex: 1, textAlign: "center", padding: 12 }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#e6b800" }}>{beat.bpm}</div>
                    <div style={{ fontSize: "0.7rem", color: "#888" }}>BPM</div>
                  </div>
                  <div className="studio-card" style={{ flex: 1, textAlign: "center", padding: 12 }}>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "#e6b800" }}>{beat.key}</div>
                    <div style={{ fontSize: "0.7rem", color: "#888" }}>KEY</div>
                  </div>
                </div>

                {/* Tags */}
                {beat.tags && beat.tags.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                    {beat.tags.map((tag, i) => (
                      <span 
                        key={i}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          background: "rgba(230,184,0,0.1)",
                          border: "1px solid rgba(230,184,0,0.2)",
                          color: "#e6b800",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className={`studio-btn ${playingId === beat._id ? "studio-btn--gold" : ""}`}
                    onClick={() => togglePlay(beat)}
                    style={{ flex: 1 }}
                  >
                    {playingId === beat._id ? "⏹ Stop" : "▶️ Play"}
                  </button>
                  <button
                    className="studio-btn studio-btn--outline"
                    onClick={() => openInBeatPlayer(beat)}
                    title="Open in Beat Player"
                  >
                    🎹
                  </button>
                  <button
                    className="studio-btn studio-btn--outline"
                    onClick={() => addToLibrary(beat)}
                    title="Add to Library"
                  >
                    📚
                  </button>
                </div>

                {/* Use This Beat Button */}
                <button
                  className="studio-btn studio-btn--gold"
                  style={{ width: "100%", marginTop: 12 }}
                  onClick={() => useThisBeat(beat)}
                >
                  🎙️ Use This Beat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Stub data for when API is unavailable
const STUB_BEATS = [
  {
    _id: "1",
    title: "No Limit East Houston Type Beat",
    producer: "Studio AI",
    bpm: 140,
    key: "C minor",
    tags: ["trap", "south", "bounce"],
    previewUrl: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
  },
  {
    _id: "2",
    title: "Southern Soul Vibes",
    producer: "PowerHarmony",
    bpm: 85,
    key: "G major",
    tags: ["soul", "rnb", "smooth"],
    previewUrl: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
  },
  {
    _id: "3",
    title: "Drill Energy",
    producer: "Studio AI",
    bpm: 145,
    key: "F# minor",
    tags: ["drill", "dark", "aggressive"],
    previewUrl: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
  },
  {
    _id: "4",
    title: "Gospel Keys",
    producer: "PowerHarmony",
    bpm: 75,
    key: "Bb major",
    tags: ["gospel", "uplifting", "piano"],
    previewUrl: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
  },
];
