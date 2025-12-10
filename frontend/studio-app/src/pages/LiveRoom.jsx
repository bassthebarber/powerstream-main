// frontend/studio-app/src/pages/LiveRoom.jsx
// Live Room Recording UI with headphone monitoring
// POWERSTREAM AI STUDIO – LIVE ROOM & ENGINEER CONTRACT MODE

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getLiveRoom,
  startLiveRecording,
  stopLiveRecording,
  startLiveSession,
  endLiveSession,
  updateLiveRoomSettings,
  uploadTake,
} from "../lib/studioApi.js";

/**
 * LiveRoom - Real-time recording session with headphone monitoring
 * 
 * Features:
 * - Live audio input from microphone
 * - Beat playback in sync with recording
 * - Real-time headphone monitoring (hear yourself + beat)
 * - Track recording and management
 */
export default function LiveRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // Session state
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [trackType, setTrackType] = useState("vocal");

  // Audio state
  const [micActive, setMicActive] = useState(false);
  const [monitorEnabled, setMonitorEnabled] = useState(true);
  const [inputLevel, setInputLevel] = useState(0);
  const [beatPlaying, setBeatPlaying] = useState(false);
  const [monitorVolume, setMonitorVolume] = useState(0.5);
  const [beatVolume, setBeatVolume] = useState(0.8);

  // Refs
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const analyserRef = useRef(null);
  const gainNodeRef = useRef(null);
  const beatAudioRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const levelAnimationRef = useRef(null);

  // Track types for selection
  const trackTypes = [
    { id: "vocal", label: "Vocal" },
    { id: "verse", label: "Verse" },
    { id: "hook", label: "Hook" },
    { id: "adlib", label: "Ad-lib" },
    { id: "bridge", label: "Bridge" },
  ];

  // Load session data
  useEffect(() => {
    loadSession();
    return () => cleanup();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const data = await getLiveRoom(sessionId);
      setSession(data.session);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cleanup = () => {
    stopRecording();
    stopMicrophone();
    if (beatAudioRef.current) {
      beatAudioRef.current.pause();
    }
    if (levelAnimationRef.current) {
      cancelAnimationFrame(levelAnimationRef.current);
    }
  };

  // Initialize microphone and audio context
  const initMicrophone = async () => {
    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();

      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false, // We want the raw signal
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 48000,
        },
      });
      mediaStreamRef.current = stream;

      // Create nodes
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      const gainNode = audioContextRef.current.createGain();

      analyser.fftSize = 256;
      analyserRef.current = analyser;
      gainNodeRef.current = gainNode;

      // Connect: mic -> analyser -> gain -> destination (speakers)
      source.connect(analyser);
      analyser.connect(gainNode);
      
      // Only connect to speakers if monitoring is enabled
      if (monitorEnabled) {
        gainNode.connect(audioContextRef.current.destination);
      }

      gainNode.gain.value = monitorVolume;

      setMicActive(true);

      // Start level metering
      startLevelMeter();

    } catch (err) {
      console.error("Microphone init error:", err);
      setError("Could not access microphone. Please check permissions.");
    }
  };

  const stopMicrophone = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setMicActive(false);
  };

  // Toggle headphone monitoring
  const toggleMonitor = useCallback(() => {
    if (!gainNodeRef.current || !audioContextRef.current) return;

    if (monitorEnabled) {
      // Disconnect from speakers
      gainNodeRef.current.disconnect();
    } else {
      // Connect to speakers
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
    setMonitorEnabled(!monitorEnabled);
  }, [monitorEnabled]);

  // Update monitor volume
  const updateMonitorVolume = useCallback((value) => {
    setMonitorVolume(value);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = value;
    }
  }, []);

  // Level meter animation
  const startLevelMeter = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setInputLevel(average / 255); // Normalize to 0-1
      levelAnimationRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  };

  // Start recording
  const startRecording = async () => {
    if (!mediaStreamRef.current) {
      await initMicrophone();
    }

    if (!mediaStreamRef.current) return;

    try {
      // Get track info from backend
      const trackData = await startLiveRecording(sessionId, trackType);
      setCurrentTrackId(trackData.trackId);

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      
      const recorder = new MediaRecorder(mediaStreamRef.current, { mimeType });
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => handleRecordingComplete();

      recorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);

      // Start beat playback
      if (session?.currentBeat?.url && beatAudioRef.current) {
        beatAudioRef.current.currentTime = 0;
        beatAudioRef.current.play();
        setBeatPlaying(true);
      }

    } catch (err) {
      console.error("Start recording error:", err);
      setError(err.message);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    // Stop beat
    if (beatAudioRef.current) {
      beatAudioRef.current.pause();
      setBeatPlaying(false);
    }

    setIsRecording(false);
  };

  // Handle recording complete - upload and save
  const handleRecordingComplete = async () => {
    if (recordedChunksRef.current.length === 0) return;

    try {
      // Create blob from chunks
      const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
      const file = new File([blob], `take_${Date.now()}.webm`, { type: "audio/webm" });

      // Upload to server
      const uploadResult = await uploadTake(file, {
        trackTitle: `${trackType} - Take ${(session?.tracks?.length || 0) + 1}`,
      });

      // Save track to session
      await stopLiveRecording(sessionId, currentTrackId, uploadResult.url || uploadResult.assetUrl, {
        trackType,
        trackName: `${trackType} - Take ${(session?.tracks?.length || 0) + 1}`,
        duration: recordingTime,
        fileSize: blob.size,
        format: "webm",
      });

      // Reload session to get updated tracks
      loadSession();

    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to save recording: " + err.message);
    }
  };

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Render loading state
  if (loading) {
    return (
      <div className="live-room-loading">
        <div className="spinner"></div>
        <p>Loading live room...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="live-room-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/studio")}>Back to Studio</button>
      </div>
    );
  }

  return (
    <div className="live-room">
      <style>{`
        .live-room {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          color: #fff;
          padding: 2rem;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .live-room-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #333;
        }

        .room-info h1 {
          font-size: 1.5rem;
          color: #d4af37;
          margin: 0;
        }

        .room-code {
          font-size: 0.875rem;
          color: #888;
          font-family: monospace;
          background: #222;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          margin-top: 0.25rem;
          display: inline-block;
        }

        .room-status {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .room-status.live { background: #22c55e; color: #000; }
        .room-status.pending { background: #f59e0b; color: #000; }
        .room-status.paused { background: #3b82f6; }

        .recording-area {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 900px) {
          .recording-area { grid-template-columns: 1fr; }
        }

        .main-controls {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 2rem;
        }

        .waveform-display {
          height: 100px;
          background: #0a0a0a;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .level-meter {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: #333;
        }

        .level-fill {
          height: 100%;
          background: linear-gradient(90deg, #22c55e, #d4af37, #ef4444);
          transition: width 0.05s linear;
        }

        .recording-timer {
          font-size: 3rem;
          font-family: monospace;
          text-align: center;
          color: #d4af37;
          margin: 1rem 0;
        }

        .recording-timer.active {
          color: #ef4444;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .record-button {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 4px solid #d4af37;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          transition: all 0.2s;
        }

        .record-button:hover {
          transform: scale(1.05);
          border-color: #fff;
        }

        .record-button .inner {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #ef4444;
          transition: all 0.2s;
        }

        .record-button.recording .inner {
          width: 30px;
          height: 30px;
          border-radius: 4px;
          background: #d4af37;
        }

        .track-type-selector {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }

        .track-type-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #444;
          border-radius: 20px;
          background: transparent;
          color: #888;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .track-type-btn:hover {
          border-color: #666;
          color: #fff;
        }

        .track-type-btn.active {
          border-color: #d4af37;
          background: #d4af371a;
          color: #d4af37;
        }

        .audio-controls {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .control-section {
          margin-bottom: 1.5rem;
        }

        .control-section h3 {
          font-size: 0.875rem;
          color: #888;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .monitor-toggle {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: #222;
          border-radius: 8px;
          cursor: pointer;
        }

        .monitor-toggle .icon {
          font-size: 1.5rem;
        }

        .monitor-toggle.active {
          background: #d4af371a;
          border: 1px solid #d4af37;
        }

        .volume-slider {
          width: 100%;
          margin-top: 0.75rem;
          accent-color: #d4af37;
        }

        .beat-player {
          background: #222;
          border-radius: 8px;
          padding: 1rem;
        }

        .beat-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .beat-info .title {
          font-size: 0.875rem;
          color: #d4af37;
        }

        .play-beat-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          background: #d4af37;
          color: #000;
          cursor: pointer;
          font-weight: 500;
        }

        .tracks-list {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 2rem;
        }

        .tracks-list h2 {
          font-size: 1rem;
          color: #d4af37;
          margin-bottom: 1rem;
        }

        .track-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: #222;
          border-radius: 8px;
          margin-bottom: 0.5rem;
        }

        .track-item .type-badge {
          padding: 0.25rem 0.5rem;
          background: #d4af371a;
          color: #d4af37;
          border-radius: 4px;
          font-size: 0.75rem;
          text-transform: uppercase;
        }

        .track-item .name {
          flex: 1;
          font-size: 0.875rem;
        }

        .track-item .duration {
          font-size: 0.75rem;
          color: #888;
          font-family: monospace;
        }

        .track-item audio {
          height: 32px;
        }

        .no-tracks {
          text-align: center;
          color: #666;
          padding: 2rem;
        }

        .live-room-loading,
        .live-room-error {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #0a0a0a;
          color: #fff;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #333;
          border-top-color: #d4af37;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Header */}
      <div className="live-room-header">
        <div className="room-info">
          <h1>🎙️ {session?.name || "Live Room"}</h1>
          <div className="room-code">Room: {session?.roomCode}</div>
        </div>
        <div className={`room-status ${session?.status}`}>
          {session?.status?.toUpperCase()}
        </div>
      </div>

      {/* Recording Area */}
      <div className="recording-area">
        {/* Main Controls */}
        <div className="main-controls">
          {/* Waveform / Level Display */}
          <div className="waveform-display">
            <span style={{ color: "#666" }}>
              {micActive ? "🎤 Microphone Active" : "Click to enable microphone"}
            </span>
            <div className="level-meter">
              <div className="level-fill" style={{ width: `${inputLevel * 100}%` }} />
            </div>
          </div>

          {/* Recording Timer */}
          <div className={`recording-timer ${isRecording ? "active" : ""}`}>
            {formatTime(recordingTime)}
          </div>

          {/* Record Button */}
          <button
            className={`record-button ${isRecording ? "recording" : ""}`}
            onClick={isRecording ? stopRecording : startRecording}
            title={isRecording ? "Stop Recording" : "Start Recording"}
          >
            <div className="inner" />
          </button>

          {/* Track Type Selector */}
          <div className="track-type-selector">
            {trackTypes.map(type => (
              <button
                key={type.id}
                className={`track-type-btn ${trackType === type.id ? "active" : ""}`}
                onClick={() => setTrackType(type.id)}
                disabled={isRecording}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Controls */}
        <div className="audio-controls">
          {/* Microphone Controls */}
          <div className="control-section">
            <h3>Microphone</h3>
            {!micActive ? (
              <button className="play-beat-btn" onClick={initMicrophone}>
                🎤 Enable Microphone
              </button>
            ) : (
              <div>
                <div
                  className={`monitor-toggle ${monitorEnabled ? "active" : ""}`}
                  onClick={toggleMonitor}
                >
                  <span className="icon">{monitorEnabled ? "🎧" : "🔇"}</span>
                  <span>{monitorEnabled ? "Monitor ON" : "Monitor OFF"}</span>
                </div>
                <input
                  type="range"
                  className="volume-slider"
                  min="0"
                  max="1"
                  step="0.05"
                  value={monitorVolume}
                  onChange={(e) => updateMonitorVolume(parseFloat(e.target.value))}
                  disabled={!monitorEnabled}
                />
                <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.25rem" }}>
                  Monitor Volume: {Math.round(monitorVolume * 100)}%
                </div>
              </div>
            )}
          </div>

          {/* Beat Player */}
          <div className="control-section">
            <h3>Beat</h3>
            {session?.currentBeat?.url ? (
              <div className="beat-player">
                <div className="beat-info">
                  <span className="title">{session.currentBeat.name || "Loaded Beat"}</span>
                </div>
                <audio
                  ref={beatAudioRef}
                  src={session.currentBeat.url}
                  loop
                  onPlay={() => setBeatPlaying(true)}
                  onPause={() => setBeatPlaying(false)}
                />
                <button
                  className="play-beat-btn"
                  onClick={() => {
                    if (beatPlaying) {
                      beatAudioRef.current.pause();
                    } else {
                      beatAudioRef.current.play();
                    }
                  }}
                >
                  {beatPlaying ? "⏸ Pause" : "▶ Play"} Beat
                </button>
                <input
                  type="range"
                  className="volume-slider"
                  min="0"
                  max="1"
                  step="0.05"
                  value={beatVolume}
                  onChange={(e) => {
                    const vol = parseFloat(e.target.value);
                    setBeatVolume(vol);
                    if (beatAudioRef.current) beatAudioRef.current.volume = vol;
                  }}
                />
                <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.25rem" }}>
                  Beat Volume: {Math.round(beatVolume * 100)}%
                </div>
              </div>
            ) : (
              <div style={{ color: "#666", fontSize: "0.875rem" }}>
                No beat loaded. Select a beat from the library.
              </div>
            )}
          </div>

          {/* Session Settings */}
          <div className="control-section">
            <h3>Session</h3>
            <div style={{ fontSize: "0.875rem", color: "#888" }}>
              <div>BPM: {session?.settings?.bpm || 120}</div>
              <div>Key: {session?.settings?.key || "C minor"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracks List */}
      <div className="tracks-list">
        <h2>Recorded Takes ({session?.tracks?.length || 0})</h2>
        {session?.tracks?.length > 0 ? (
          session.tracks.map((track, idx) => (
            <div key={track.trackId || idx} className="track-item">
              <span className="type-badge">{track.type}</span>
              <span className="name">{track.name}</span>
              <span className="duration">
                {track.duration ? formatTime(track.duration) : "--:--"}
              </span>
              {track.url && (
                <audio controls src={track.url} />
              )}
            </div>
          ))
        ) : (
          <div className="no-tracks">
            No tracks recorded yet. Hit the record button to start!
          </div>
        )}
      </div>
    </div>
  );
}




