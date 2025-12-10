import { useEffect, useRef, useState, useCallback } from "react";
import { normalizeAudioUrl, validateAudioUrl } from "./services/beatPlayerService.js";
import useAudioMonitor from "./hooks/useAudioMonitor.js";

export default function BeatPlayer() {
  // Get URL from query params
  const urlParam = new URLSearchParams(location.search).get("url") || "";
  const [beatUrl, setBeatUrl] = useState("");
  const [urlInput, setUrlInput] = useState(urlParam);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [recording, setRecording] = useState(false);
  const mediaRec = useRef(null);
  const chunks = useRef([]);
  
  // Audio monitor hook for "hear yourself"
  const monitor = useAudioMonitor();
  
  // Load beat URL
  const loadBeat = useCallback(async (url) => {
    if (!url) return;
    
    setLoading(true);
    setError("");
    
    try {
      const normalizedUrl = normalizeAudioUrl(url);
      
      // Validate the URL
      const validation = await validateAudioUrl(normalizedUrl);
      if (!validation.valid) {
        setError(`Invalid audio URL: ${validation.error}`);
        setLoading(false);
        return;
      }
      
      setBeatUrl(normalizedUrl);
      
      // Also load into monitor for simultaneous playback
      await monitor.loadBeat(normalizedUrl);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [monitor]);
  
  // Load initial URL from params
  useEffect(() => {
    if (urlParam) {
      loadBeat(urlParam);
    }
  }, [urlParam]);
  
  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleError = (e) => {
      console.error("Audio error:", e);
      setError("Failed to load audio. Check the URL and try again.");
    };
    
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("error", handleError);
    
    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("error", handleError);
    };
  }, [beatUrl]);
  
  // Auto-play when beat loads
  useEffect(() => {
    if (beatUrl && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [beatUrl]);
  
  // Start recording with monitoring
  async function startRec() {
    try {
      // Start monitoring (hear yourself)
      await monitor.startMonitoring();
      
      // Get mic stream for recording
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        }
      });
      
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      chunks.current = [];
      
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      
      mr.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `vocal-take-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(a.href);
      };
      
      mediaRec.current = mr;
      mr.start();
      setRecording(true);
      
      // Start beat playback
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error("Recording start error:", err);
      setError("Failed to start recording. Check microphone permissions.");
    }
  }
  
  function stopRec() {
    mediaRec.current?.stop();
    monitor.stopMonitoring();
    setRecording(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }
  
  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="page-wrap" style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <h1 className="h1" style={{ marginBottom: 8 }}>🎧 Beat Player</h1>
      <p style={{ color: "#888", marginBottom: 24 }}>
        Load a beat and record vocals on top. You'll hear yourself + the beat in real-time.
      </p>
      
      {/* Error display */}
      {error && (
        <div style={{
          padding: 12,
          background: "rgba(255,0,0,0.1)",
          border: "1px solid rgba(255,0,0,0.3)",
          borderRadius: 8,
          color: "#ff6b6b",
          marginBottom: 16,
        }}>
          ⚠️ {error}
          <button onClick={() => setError("")} style={{ float: "right", background: "none", border: "none", color: "inherit", cursor: "pointer" }}>×</button>
        </div>
      )}
      
      {/* Beat URL input */}
      <div className="card" style={{ background: "#1a1a1f", padding: 20, borderRadius: 12, marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 8, fontSize: 12, color: "#888" }}>BEAT URL</label>
        <div style={{ display: "flex", gap: 12 }}>
          <input
            className="input"
            style={{ flex: 1, padding: 12, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }}
            placeholder="Paste beat URL or /api/beats/download/filename.mp3"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadBeat(urlInput)}
          />
          <button
            onClick={() => loadBeat(urlInput)}
            disabled={loading}
            style={{ padding: "12px 24px", background: "var(--gold, #ffb84d)", color: "#000", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
          >
            {loading ? "Loading..." : "Load Beat"}
          </button>
        </div>
      </div>
      
      {/* Player */}
      {beatUrl && (
        <div className="card" style={{ background: "#1a1a1f", padding: 20, borderRadius: 12, marginBottom: 16 }}>
          <audio ref={audioRef} src={beatUrl} style={{ display: "none" }} loop />
          
          {/* Progress bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888", marginBottom: 4 }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div
              style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, cursor: "pointer" }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                if (audioRef.current) audioRef.current.currentTime = pct * duration;
              }}
            >
              <div style={{ width: `${(currentTime / duration) * 100 || 0}%`, height: "100%", background: "var(--gold, #ffb84d)", borderRadius: 3 }} />
            </div>
          </div>
          
          {/* Controls */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 16 }}>
            <button
              onClick={() => isPlaying ? audioRef.current?.pause() : audioRef.current?.play()}
              style={{ padding: "12px 24px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer" }}
            >
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
            <button
              onClick={() => { if (audioRef.current) audioRef.current.currentTime = 0; }}
              style={{ padding: "12px 24px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer" }}
            >
              ⏮ Restart
            </button>
          </div>
        </div>
      )}
      
      {/* Recording controls */}
      <div className="card" style={{ background: "#1a1a1f", padding: 20, borderRadius: 12 }}>
        <h3 style={{ marginBottom: 16 }}>🎤 Record Vocals</h3>
        
        {/* Monitor level */}
        {monitor.isMonitoring && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>MIC LEVEL</div>
            <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4 }}>
              <div style={{
                width: `${monitor.micLevel * 100}%`,
                height: "100%",
                background: monitor.micLevel > 0.8 ? "#ef4444" : monitor.micLevel > 0.5 ? "#f59e0b" : "#22c55e",
                borderRadius: 4,
                transition: "width 50ms",
              }} />
            </div>
          </div>
        )}
        
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {!recording ? (
            <button
              className="btn green"
              onClick={startRec}
              disabled={!beatUrl}
              style={{
                padding: "14px 28px",
                background: beatUrl ? "#22c55e" : "#666",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                cursor: beatUrl ? "pointer" : "not-allowed",
              }}
            >
              🎙 Start Recording
            </button>
          ) : (
            <button
              className="btn"
              onClick={stopRec}
              style={{
                padding: "14px 28px",
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                cursor: "pointer",
                animation: "pulse 1s infinite",
              }}
            >
              ⏹ Stop & Download
            </button>
          )}
          
          {/* Monitor toggle */}
          <button
            onClick={() => monitor.isMonitoring ? monitor.stopMonitoring() : monitor.startMonitoring()}
            style={{
              padding: "14px 28px",
              background: monitor.isMonitoring ? "rgba(255,184,77,0.2)" : "rgba(255,255,255,0.1)",
              color: monitor.isMonitoring ? "#ffb84d" : "#fff",
              border: `1px solid ${monitor.isMonitoring ? "#ffb84d" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            🎧 {monitor.isMonitoring ? "Monitoring ON" : "Monitor (Hear Yourself)"}
          </button>
        </div>
        
        {!beatUrl && (
          <p style={{ textAlign: "center", color: "#888", marginTop: 16, fontSize: 13 }}>
            Load a beat above to start recording
          </p>
        )}
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
