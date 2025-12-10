// frontend/studio-app/src/pages/RecordPage.jsx
// Quick Record Page - Simple Recording Booth

import React, { useEffect, useRef, useState } from "react";
import "../styles/studio.css";
import { UPLOAD_API } from "../config/api.js";

export default function RecordPage() {
  const [status, setStatus] = useState("idle"); // idle | ready | recording | stopped | uploading
  const [audioURL, setAudioURL] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [meterLevel, setMeterLevel] = useState(0);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  // Initialize microphone on mount
  useEffect(() => {
    initMicrophone();
    return () => {
      cleanup();
    };
  }, []);

  const initMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup audio analyser for level meter
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start level meter animation
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateMeter = () => {
        analyser.getByteTimeDomainData(dataArray);
        let peak = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const val = Math.abs(dataArray[i] - 128);
          if (val > peak) peak = val;
        }
        setMeterLevel(Math.min(100, (peak / 128) * 100));
        animationRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();

      // Setup MediaRecorder
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setStatus("stopped");
      };
      mediaRecorderRef.current = recorder;

      setStatus("ready");
    } catch (err) {
      console.error("Mic error:", err);
      setErrorMsg("Microphone access denied. Please allow permissions.");
      setStatus("idle");
    }
  };

  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
  };

  const startRecording = () => {
    if (!mediaRecorderRef.current) return;
    chunksRef.current = [];
    mediaRecorderRef.current.start();
    setStatus("recording");
    setAudioURL("");
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
  };

  const discardRecording = () => {
    chunksRef.current = [];
    setAudioURL("");
    setStatus("ready");
  };

  const uploadRecording = async () => {
    if (!audioURL) return;

    setStatus("uploading");
    setErrorMsg("");

    try {
      const blob = await fetch(audioURL).then(r => r.blob());
      const file = new File([blob], `recording_${Date.now()}.webm`, { type: "audio/webm" });

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${UPLOAD_API}/file`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      console.log("Upload success:", data);
      
      setStatus("ready");
      setAudioURL("");
      chunksRef.current = [];
      alert("✅ Recording uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMsg("Upload failed. Please try again.");
      setStatus("stopped");
    }
  };

  const getMeterColor = () => {
    if (meterLevel > 80) return "#ff4455";
    if (meterLevel > 50) return "#e6b800";
    return "#00c864";
  };

  return (
    <div className="studio-page">
      {/* Header */}
      <div className="studio-header">
        <div>
          <h1 className="studio-title">Quick Record</h1>
          <p className="studio-subtitle">Simple Recording Booth · No AI Analysis</p>
        </div>
        <div className="studio-badge">
          {status === "recording" ? "🔴 Recording" : status === "ready" ? "🟢 Ready" : "⚪ Idle"}
        </div>
      </div>

      {errorMsg && (
        <div className="studio-status studio-status--error" style={{ marginBottom: 20 }}>
          {errorMsg}
        </div>
      )}

      <div className="studio-grid studio-grid--2">
        {/* Left - Recording Controls */}
        <div className="studio-panel studio-panel--glow">
          <h3 className="studio-card-title">🎙️ Microphone</h3>

          {/* Level Meter */}
          <div className="studio-card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: "0.85rem", color: "#888" }}>Input Level</span>
              <span style={{ fontSize: "0.85rem", color: getMeterColor(), fontWeight: 600 }}>
                {Math.round(meterLevel)}%
              </span>
            </div>
            <div className="studio-meter" style={{ height: 20 }}>
              <div 
                className="studio-meter-fill"
                style={{ 
                  width: `${meterLevel}%`, 
                  background: getMeterColor(),
                  transition: "width 0.05s ease",
                }}
              />
            </div>
          </div>

          {/* Recording Button */}
          <div style={{ textAlign: "center", padding: 20 }}>
            {status === "recording" ? (
              <button
                className="studio-btn studio-btn--lg"
                onClick={stopRecording}
                style={{ 
                  width: 120, 
                  height: 120, 
                  borderRadius: "50%",
                  background: "#ff4455",
                  fontSize: "2rem",
                }}
              >
                ⏹️
              </button>
            ) : (
              <button
                className="studio-btn studio-btn--gold studio-btn--lg"
                onClick={startRecording}
                disabled={status !== "ready" && status !== "stopped"}
                style={{ 
                  width: 120, 
                  height: 120, 
                  borderRadius: "50%",
                  fontSize: "2rem",
                }}
              >
                🎙️
              </button>
            )}
            <div style={{ marginTop: 12, color: "#888", fontSize: "0.9rem" }}>
              {status === "recording" ? "Click to stop" : "Click to record"}
            </div>
          </div>

          {/* Status */}
          <div 
            className={`studio-status ${
              status === "recording" ? "studio-status--processing" : 
              status === "ready" ? "studio-status--success" : 
              "studio-status--idle"
            }`}
            style={{ justifyContent: "center" }}
          >
            {status === "idle" && "Initializing microphone..."}
            {status === "ready" && "Ready to record"}
            {status === "recording" && "Recording in progress..."}
            {status === "stopped" && "Recording complete"}
            {status === "uploading" && "Uploading..."}
          </div>
        </div>

        {/* Right - Playback & Actions */}
        <div className="studio-panel">
          <h3 className="studio-card-title">🔊 Playback</h3>

          {audioURL ? (
            <>
              {/* Audio Player */}
              <div className="studio-card" style={{ marginBottom: 20 }}>
                <audio 
                  controls 
                  src={audioURL} 
                  style={{ width: "100%" }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  className="studio-btn studio-btn--gold"
                  onClick={uploadRecording}
                  disabled={status === "uploading"}
                  style={{ flex: 1 }}
                >
                  {status === "uploading" ? "⏳ Uploading..." : "⬆️ Upload"}
                </button>
                <button
                  className="studio-btn"
                  onClick={discardRecording}
                  disabled={status === "uploading"}
                  style={{ 
                    background: "rgba(255,68,85,0.2)", 
                    color: "#ff4455",
                  }}
                >
                  🗑️ Discard
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: 40, color: "#555" }}>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>🎵</div>
              <p>No recording yet</p>
              <p style={{ fontSize: "0.85rem" }}>
                Press the record button to start
              </p>
            </div>
          )}

          {/* Tips */}
          <div className="studio-card" style={{ marginTop: 20 }}>
            <div style={{ fontWeight: 700, color: "#e6b800", marginBottom: 8 }}>💡 Tips</div>
            <ul style={{ margin: 0, paddingLeft: 20, color: "#888", fontSize: "0.85rem", lineHeight: 1.8 }}>
              <li>Keep your mic 6-12 inches from your mouth</li>
              <li>Avoid clipping (red meter)</li>
              <li>Use headphones to prevent feedback</li>
              <li>For AI coaching, use <a href="/recordboot" style={{ color: "#e6b800" }}>Record Boot</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
