// frontend/src/studio/ui/RecordPanel.jsx
// Enhanced Recording Panel with full transport controls

import React, { useState, useEffect, useRef, useCallback } from "react";
import { recordingEngine } from "../engine/RecordingEngine.js";
import { useStudioAudio } from "../StudioAudioContext.jsx";
import "./RecordPanel.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

export default function RecordPanel({ 
  projectId,
  onRecordingSaved,
  onLoadRecording,
}) {
  // Get shared audio context
  const { playAudio, stopAudio, setCurrentTrack, currentTrack, isPlaying: isAudioPlaying } = useStudioAudio();
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState("");
  
  // Recordings list
  const [recordings, setRecordings] = useState([]);
  const [loadingRecordings, setLoadingRecordings] = useState(true);
  
  // Playback state
  const [playingId, setPlayingId] = useState(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const audioRef = useRef(null);
  
  // Take counter
  const [takeNumber, setTakeNumber] = useState(1);
  
  // Duration timer
  const durationIntervalRef = useRef(null);
  
  // Set up recording engine callbacks
  useEffect(() => {
    recordingEngine.onStart = () => {
      setIsRecording(true);
      setError("");
    };
    
    recordingEngine.onStop = (blob, dur) => {
      setIsRecording(false);
      setIsPaused(false);
      setDuration(dur);
    };
    
    recordingEngine.onLevelUpdate = (lvl) => {
      setLevel(lvl);
    };
    
    recordingEngine.onError = (msg) => {
      setError(msg);
      setIsRecording(false);
    };
    
    return () => {
      recordingEngine.destroy();
    };
  }, []);
  
  // Load recordings on mount
  useEffect(() => {
    loadRecordings();
  }, []);
  
  // Duration timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      durationIntervalRef.current = setInterval(() => {
        setDuration(recordingEngine.getCurrentDuration());
      }, 100);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
    
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isRecording, isPaused]);
  
  // Load recordings from backend
  const loadRecordings = async () => {
    try {
      setLoadingRecordings(true);
      const res = await fetch(`${API_BASE}/api/studio/library?tab=recordings&limit=20`);
      const data = await res.json();
      
      if (data.success) {
        setRecordings(data.items || []);
        // Set take number based on existing recordings
        setTakeNumber((data.items?.length || 0) + 1);
      }
    } catch (err) {
      console.error("[RecordPanel] Load error:", err);
    } finally {
      setLoadingRecordings(false);
    }
  };
  
  // Start recording
  const handleRecord = async () => {
    setError("");
    setDuration(0);
    setLevel(0);
    await recordingEngine.start();
  };
  
  // Stop recording
  const handleStop = async () => {
    const blob = await recordingEngine.stop();
    
    if (blob) {
      // Upload to backend
      const result = await recordingEngine.upload(blob, {
        title: `Take ${takeNumber}`,
        takeNumber,
        type: "vocal",
        projectId,
      });
      
      if (result.success) {
        const newRecording = result.recording;
        setRecordings([newRecording, ...recordings]);
        setTakeNumber((prev) => prev + 1);
        
        // Update shared audio context with the new recording
        setCurrentTrack({
          id: newRecording._id,
          title: newRecording.title,
          audioUrl: newRecording.audioUrl,
          type: "recording",
        });
        
        if (onRecordingSaved) {
          onRecordingSaved(newRecording);
        }
      } else {
        setError(result.error || "Failed to save recording");
      }
    }
  };
  
  // Pause/resume recording
  const handlePauseResume = () => {
    if (isPaused) {
      recordingEngine.resume();
      setIsPaused(false);
    } else {
      recordingEngine.pause();
      setIsPaused(true);
    }
  };
  
  // Play recording using shared audio context
  const handlePlay = (recording) => {
    // If already playing this recording, stop it
    if (playingId === recording._id) {
      stopAudio();
      setPlayingId(null);
      setPlaybackProgress(0);
      return;
    }
    
    // Update shared context and play
    setCurrentTrack({
      id: recording._id,
      title: recording.title,
      audioUrl: recording.audioUrl,
      type: "recording",
    });
    
    playAudio(recording.audioUrl, {
      id: recording._id,
      title: recording.title,
      type: "recording",
    });
    
    setPlayingId(recording._id);
    
    // Also notify parent if callback provided
    if (onLoadRecording) {
      onLoadRecording(recording);
    }
  };
  
  // Stop playback
  const handleStopPlayback = () => {
    stopAudio();
    setPlayingId(null);
    setPlaybackProgress(0);
  };
  
  // Sync playingId with shared context
  useEffect(() => {
    if (!isAudioPlaying && playingId) {
      setPlayingId(null);
      setPlaybackProgress(0);
    }
  }, [isAudioPlaying, playingId]);
  
  // Delete recording
  const handleDelete = async (recording) => {
    if (!window.confirm(`Delete "${recording.title}"?`)) return;
    
    const result = await recordingEngine.deleteRecording(recording._id);
    
    if (result.success) {
      setRecordings(recordings.filter((r) => r._id !== recording._id));
      
      if (playingId === recording._id) {
        handleStopPlayback();
      }
    } else {
      setError(result.error || "Failed to delete recording");
    }
  };
  
  // Load into studio
  const handleLoadIntoStudio = (recording) => {
    if (onLoadRecording) {
      onLoadRecording(recording);
    }
  };
  
  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
  };
  
  // Format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="record-panel">
      <div className="record-header">
        <span className="record-icon">🎙️</span>
        <h3>Recording Studio</h3>
        <span className="take-badge">Take {takeNumber}</span>
      </div>
      
      {error && (
        <div className="record-error">
          ⚠️ {error}
          <button onClick={() => setError("")}>✕</button>
        </div>
      )}
      
      {/* Level Meter */}
      <div className="level-meter-container">
        <div className="level-meter">
          <div 
            className="level-fill" 
            style={{ 
              width: `${level * 100}%`,
              backgroundColor: level > 0.8 ? "#ef4444" : level > 0.5 ? "#f59e0b" : "#10b981",
            }} 
          />
        </div>
        <div className="level-labels">
          <span>-∞</span>
          <span>-12</span>
          <span>-6</span>
          <span>0dB</span>
        </div>
      </div>
      
      {/* Duration Display */}
      <div className="duration-display">
        <span className={`time ${isRecording ? "recording" : ""}`}>
          {formatDuration(duration)}
        </span>
        {isRecording && (
          <span className="recording-indicator">
            <span className="rec-dot" />
            {isPaused ? "PAUSED" : "REC"}
          </span>
        )}
      </div>
      
      {/* Transport Controls */}
      <div className="transport-controls">
        {!isRecording ? (
          <button 
            className="transport-btn record"
            onClick={handleRecord}
          >
            <span className="btn-icon">⏺</span>
            <span className="btn-label">Record</span>
          </button>
        ) : (
          <>
            <button 
              className="transport-btn pause"
              onClick={handlePauseResume}
            >
              <span className="btn-icon">{isPaused ? "▶" : "⏸"}</span>
              <span className="btn-label">{isPaused ? "Resume" : "Pause"}</span>
            </button>
            
            <button 
              className="transport-btn stop"
              onClick={handleStop}
            >
              <span className="btn-icon">⏹</span>
              <span className="btn-label">Stop & Save</span>
            </button>
          </>
        )}
      </div>
      
      {/* Recordings List */}
      <div className="recordings-section">
        <div className="recordings-header">
          <h4>Recent Recordings</h4>
          <button className="refresh-btn" onClick={loadRecordings}>
            🔄
          </button>
        </div>
        
        {loadingRecordings ? (
          <div className="recordings-loading">Loading...</div>
        ) : recordings.length === 0 ? (
          <div className="recordings-empty">
            <span>🎤</span>
            <p>No recordings yet</p>
            <p className="hint">Hit Record to create your first take!</p>
          </div>
        ) : (
          <div className="recordings-list">
            {recordings.map((rec) => (
              <div 
                key={rec._id} 
                className={`recording-item ${playingId === rec._id ? "playing" : ""}`}
              >
                <div className="recording-info">
                  <span className="recording-title">{rec.title}</span>
                  <span className="recording-meta">
                    <span>{formatDuration(rec.durationSeconds || 0)}</span>
                    <span>{formatDate(rec.createdAt)}</span>
                  </span>
                </div>
                
                {playingId === rec._id && (
                  <div className="playback-progress">
                    <div 
                      className="progress-bar"
                      style={{ width: `${playbackProgress}%` }}
                    />
                  </div>
                )}
                
                <div className="recording-actions">
                  <button
                    className={`action-btn play ${playingId === rec._id ? "active" : ""}`}
                    onClick={() => handlePlay(rec)}
                    title={playingId === rec._id ? "Stop" : "Play"}
                  >
                    {playingId === rec._id ? "⏹" : "▶"}
                  </button>
                  
                  <button
                    className="action-btn load"
                    onClick={() => handleLoadIntoStudio(rec)}
                    title="Load in Studio"
                  >
                    📥
                  </button>
                  
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(rec)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

