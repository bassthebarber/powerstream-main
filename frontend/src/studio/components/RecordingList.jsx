// frontend/src/studio/components/RecordingList.jsx
// Studio Recording List with Play/Stop/Delete functionality

import { useState, useRef, useEffect } from "react";
import "./RecordingList.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

export default function RecordingList({ recordings = [], onDeleted, onRefresh }) {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState({});
  const audioRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const play = async (id) => {
    // Stop current audio if playing something else
    if (audioRef.current) {
      audioRef.current.pause();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    // If clicking the same track, just toggle play/pause
    if (playingId === id && audioRef.current) {
      audioRef.current.play();
      startProgressTracking(id);
      return;
    }

    setLoading((prev) => ({ ...prev, [id]: true }));

    try {
      const newAudio = new Audio(`${API_BASE}/api/studio/play/${id}`);
      audioRef.current = newAudio;
      
      newAudio.addEventListener("loadedmetadata", () => {
        setLoading((prev) => ({ ...prev, [id]: false }));
      });

      newAudio.addEventListener("ended", () => {
        setPlayingId(null);
        setProgress((prev) => ({ ...prev, [id]: 0 }));
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      });

      newAudio.addEventListener("error", (e) => {
        console.error("Audio error:", e);
        setLoading((prev) => ({ ...prev, [id]: false }));
        setPlayingId(null);
      });

      await newAudio.play();
      setPlayingId(id);
      setCurrentAudio(newAudio);
      startProgressTracking(id);
    } catch (err) {
      console.error("Playback error:", err);
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const startProgressTracking = (id) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      if (audioRef.current) {
        const current = audioRef.current.currentTime;
        const duration = audioRef.current.duration || 1;
        setProgress((prev) => ({ 
          ...prev, 
          [id]: (current / duration) * 100 
        }));
      }
    }, 100);
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
    setPlayingId(null);
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
    setPlayingId(null);
    setProgress({});
  };

  const deleteRec = async (id) => {
    if (!confirm("Are you sure you want to delete this recording?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/studio/delete/${id}`, {
        method: "DELETE",
      });
      
      const data = await res.json();
      
      if (data.success || res.ok) {
        // Stop if deleting currently playing
        if (playingId === id) {
          stop();
        }
        if (onDeleted) {
          onDeleted(id);
        }
      } else {
        console.error("Delete failed:", data);
        alert("Failed to delete recording");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete recording: " + err.message);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      vocal: "🎤",
      instrument: "🎸",
      beat: "🥁",
      mix: "🎚️",
      master: "💿",
      scratch: "📝",
      final: "✨",
    };
    return icons[type] || "🎵";
  };

  if (!recordings || recordings.length === 0) {
    return (
      <div className="recording-list-empty">
        <div className="empty-icon">🎵</div>
        <p>No recordings yet</p>
        <span>Start recording to see your tracks here</span>
        {onRefresh && (
          <button className="refresh-btn" onClick={onRefresh}>
            🔄 Refresh
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="recording-list">
      <div className="recording-list-header">
        <h3>🎧 Recordings ({recordings.length})</h3>
        {onRefresh && (
          <button className="refresh-btn" onClick={onRefresh}>
            🔄
          </button>
        )}
      </div>

      <div className="recording-items">
        {recordings.map((rec) => (
          <div 
            key={rec._id} 
            className={`recording-item ${playingId === rec._id ? "playing" : ""}`}
          >
            <div className="recording-icon">
              {getTypeIcon(rec.type)}
            </div>

            <div className="recording-info">
              <div className="recording-title">
                {rec.title || rec.filename || "Untitled Recording"}
              </div>
              <div className="recording-meta">
                <span className="duration">
                  {formatDuration(rec.duration)}
                </span>
                {rec.type && (
                  <span className="type-badge">{rec.type}</span>
                )}
                <span className="date">
                  {formatDate(rec.createdAt)}
                </span>
              </div>
              {playingId === rec._id && (
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${progress[rec._id] || 0}%` }}
                  />
                </div>
              )}
            </div>

            <div className="recording-actions">
              {loading[rec._id] ? (
                <button className="action-btn loading" disabled>
                  ⏳
                </button>
              ) : playingId === rec._id ? (
                <button 
                  className="action-btn pause"
                  onClick={pause}
                  title="Pause"
                >
                  ⏸️
                </button>
              ) : (
                <button 
                  className="action-btn play"
                  onClick={() => play(rec._id)}
                  title="Play"
                >
                  ▶️
                </button>
              )}

              <button 
                className="action-btn stop"
                onClick={stop}
                title="Stop"
                disabled={playingId !== rec._id}
              >
                ⏹️
              </button>

              <button 
                className="action-btn delete"
                onClick={() => deleteRec(rec._id)}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

