// frontend/src/pages/studio/StudioPlayerPage.jsx
// Modern Audio Player Interface
import React, { useState, useRef, useEffect } from "react";
import "../../styles/studio-unified.css";

const DEMO_TRACKS = [
  { id: 1, title: "Summer Vibes Beat", artist: "PowerStream AI", duration: 185, src: null },
  { id: 2, title: "Trap Soul Type Beat", artist: "Beat Lab", duration: 210, src: null },
  { id: 3, title: "Vocal Session - Take 3", artist: "Studio Recording", duration: 156, src: null },
];

export default function StudioPlayerPage() {
  const [playlist, setPlaylist] = useState(DEMO_TRACKS);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const audioRef = useRef(null);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (!currentTrack && playlist.length > 0) {
      setCurrentTrack(playlist[0]);
      setDuration(playlist[0].duration);
    }
    setIsPlaying(!isPlaying);
  };

  const handleTrackSelect = (track) => {
    setCurrentTrack(track);
    setDuration(track.duration);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (!currentTrack) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
    handleTrackSelect(playlist[prevIndex]);
  };

  const handleNext = () => {
    if (!currentTrack) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const nextIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
    handleTrackSelect(playlist[nextIndex]);
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
  };

  // Simulate playback progress
  useEffect(() => {
    let interval;
    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            if (repeat) {
              return 0;
            } else {
              handleNext();
              return 0;
            }
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, duration, repeat]);

  return (
    <div>
      {/* Header */}
      <div className="studio-header">
        <h1 className="studio-header-title">🔊 Player</h1>
        <p className="studio-header-subtitle">Playback and preview your tracks</p>
      </div>

      {/* Main Player Card */}
      <div className="studio-card studio-card--highlight" style={{ marginBottom: 24 }}>
        {/* Album Art / Visualizer Area */}
        <div style={{ 
          width: 200, 
          height: 200, 
          margin: "0 auto 24px",
          background: currentTrack 
            ? "linear-gradient(135deg, rgba(255,184,77,0.3), rgba(255,184,77,0.1))"
            : "rgba(255,255,255,0.05)",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
          boxShadow: isPlaying ? "0 0 40px rgba(255,184,77,0.3)" : "none",
          transition: "all 0.3s ease"
        }}>
          {currentTrack ? (isPlaying ? "🎵" : "⏸") : "🎶"}
        </div>

        {/* Track Info */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 4 }}>
            {currentTrack?.title || "No track selected"}
          </h2>
          <p style={{ color: "#888", fontSize: 14 }}>
            {currentTrack?.artist || "Select a track to play"}
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: 24 }}>
          <input
            type="range"
            className="studio-slider"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            style={{ width: "100%" }}
          />
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            fontSize: 12, 
            color: "#888",
            marginTop: 8 
          }}>
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 24 }}>
          <button 
            className={`studio-btn ${shuffle ? "studio-btn--secondary" : "studio-btn--outline"}`}
            style={{ width: 44, height: 44, padding: 0, borderRadius: "50%" }}
            onClick={() => setShuffle(!shuffle)}
          >
            🔀
          </button>
          
          <button 
            className="studio-btn studio-btn--outline"
            style={{ width: 48, height: 48, padding: 0, borderRadius: "50%", fontSize: 18 }}
            onClick={handlePrev}
          >
            ⏮
          </button>
          
          <button 
            className="studio-btn studio-btn--primary"
            style={{ 
              width: 72, 
              height: 72, 
              padding: 0, 
              borderRadius: "50%", 
              fontSize: 28,
              boxShadow: "0 0 30px rgba(255,184,77,0.4)"
            }}
            onClick={handlePlayPause}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          
          <button 
            className="studio-btn studio-btn--outline"
            style={{ width: 48, height: 48, padding: 0, borderRadius: "50%", fontSize: 18 }}
            onClick={handleNext}
          >
            ⏭
          </button>
          
          <button 
            className={`studio-btn ${repeat ? "studio-btn--secondary" : "studio-btn--outline"}`}
            style={{ width: 44, height: 44, padding: 0, borderRadius: "50%" }}
            onClick={() => setRepeat(!repeat)}
          >
            🔁
          </button>
        </div>

        {/* Volume */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 300, margin: "0 auto" }}>
          <span>🔈</span>
          <input
            type="range"
            className="studio-slider"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            style={{ flex: 1 }}
          />
          <span>🔊</span>
          <span style={{ fontSize: 12, color: "#888", width: 40 }}>{volume}%</span>
        </div>
      </div>

      {/* Playlist */}
      <div className="studio-card">
        <div className="studio-card-header">
          <h3 className="studio-card-title">📋 Playlist</h3>
          <span style={{ color: "#888", fontSize: 13 }}>{playlist.length} tracks</span>
        </div>

        {playlist.length === 0 ? (
          <div className="studio-empty" style={{ padding: 32 }}>
            <div className="studio-empty-icon">🎵</div>
            <p className="studio-empty-title">No tracks in playlist</p>
            <p className="studio-empty-desc">Upload or generate beats to add them here</p>
          </div>
        ) : (
          <div className="studio-file-list">
            {playlist.map((track, idx) => (
              <div 
                key={track.id} 
                className="studio-file-item"
                style={{ 
                  cursor: "pointer",
                  background: currentTrack?.id === track.id ? "rgba(255,184,77,0.1)" : undefined,
                  borderColor: currentTrack?.id === track.id ? "rgba(255,184,77,0.4)" : undefined
                }}
                onClick={() => handleTrackSelect(track)}
              >
                <div className="studio-file-info">
                  <span style={{ 
                    width: 32, 
                    height: 32, 
                    background: currentTrack?.id === track.id && isPlaying 
                      ? "linear-gradient(135deg, #ffb84d, #ffda5c)" 
                      : "rgba(255,255,255,0.1)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: currentTrack?.id === track.id && isPlaying ? "#000" : "#fff"
                  }}>
                    {currentTrack?.id === track.id && isPlaying ? "▶" : idx + 1}
                  </span>
                  <div>
                    <div className="studio-file-name" style={{ 
                      color: currentTrack?.id === track.id ? "#ffb84d" : "#fff"
                    }}>
                      {track.title}
                    </div>
                    <div className="studio-file-size">{track.artist}</div>
                  </div>
                </div>
                <span style={{ color: "#888", fontSize: 13 }}>{formatTime(track.duration)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
