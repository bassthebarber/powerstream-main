// frontend/studio-app/src/pages/Visualizer.jsx
// Audio Visualizer - Real-time frequency visualization

import React, { useEffect, useRef, useState } from "react";
import "../styles/studio.css";

export default function Visualizer() {
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);

  const [status, setStatus] = useState("idle"); // idle | active | error
  const [errorMsg, setErrorMsg] = useState("");
  const [visualizerMode, setVisualizerMode] = useState("bars"); // bars | wave | circle

  // Color schemes
  const colorSchemes = {
    gold: { primary: "#e6b800", secondary: "#c9a000", bg: "#000" },
    purple: { primary: "#8855ff", secondary: "#6633cc", bg: "#0a0014" },
    fire: { primary: "#ff5500", secondary: "#ff0044", bg: "#0a0500" },
    ocean: { primary: "#00bbff", secondary: "#0066ff", bg: "#000a14" },
  };
  const [colorScheme, setColorScheme] = useState("gold");

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const startVisualizer = async () => {
    setStatus("active");
    setErrorMsg("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      sourceRef.current = audioCtxRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      sourceRef.current.connect(analyserRef.current);

      draw();
    } catch (err) {
      console.error("Microphone access error:", err);
      setErrorMsg("Microphone access denied. Please allow mic permissions.");
      setStatus("error");
    }
  };

  const stopVisualizer = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    setStatus("idle");
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;

    const ctx = canvas.getContext("2d");
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const colors = colorSchemes[colorScheme];

    const render = () => {
      animationRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (visualizerMode === "bars") {
        drawBars(ctx, canvas, dataArray, bufferLength, colors);
      } else if (visualizerMode === "wave") {
        drawWave(ctx, canvas, dataArray, bufferLength, colors);
      } else if (visualizerMode === "circle") {
        drawCircle(ctx, canvas, dataArray, bufferLength, colors);
      }
    };

    render();
  };

  const drawBars = (ctx, canvas, dataArray, bufferLength, colors) => {
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
      
      // Gradient fill
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
      gradient.addColorStop(0, colors.secondary);
      gradient.addColorStop(1, colors.primary);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
      
      // Glow effect
      ctx.shadowColor = colors.primary;
      ctx.shadowBlur = 10;
      
      x += barWidth;
    }
    ctx.shadowBlur = 0;
  };

  const drawWave = (ctx, canvas, dataArray, bufferLength, colors) => {
    ctx.lineWidth = 3;
    ctx.strokeStyle = colors.primary;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 15;
    
    ctx.beginPath();
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  const drawCircle = (ctx, canvas, dataArray, bufferLength, colors) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.4;

    for (let i = 0; i < bufferLength; i++) {
      const angle = (i / bufferLength) * Math.PI * 2;
      const amplitude = (dataArray[i] / 255) * radius;
      
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + amplitude);
      const y2 = centerY + Math.sin(angle) * (radius + amplitude);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.shadowColor = colors.primary;
      ctx.shadowBlur = 8;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  };

  // Restart visualizer when mode or color changes
  useEffect(() => {
    if (status === "active") {
      draw();
    }
  }, [visualizerMode, colorScheme]);

  return (
    <div className="studio-page">
      {/* Header */}
      <div className="studio-header">
        <div>
          <h1 className="studio-title">Audio Visualizer</h1>
          <p className="studio-subtitle">Real-time Frequency Visualization</p>
        </div>
        <div className="studio-badge">
          {status === "active" ? "🎵 Live" : "⏸️ Idle"}
        </div>
      </div>

      {errorMsg && (
        <div className="studio-status studio-status--error" style={{ marginBottom: 20 }}>
          {errorMsg}
        </div>
      )}

      {/* Controls */}
      <div className="studio-panel" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          {/* Start/Stop */}
          {status !== "active" ? (
            <button 
              className="studio-btn studio-btn--gold"
              onClick={startVisualizer}
            >
              ▶️ Start Visualizer
            </button>
          ) : (
            <button 
              className="studio-btn"
              onClick={stopVisualizer}
              style={{ background: "rgba(255,68,85,0.2)", color: "#ff4455" }}
            >
              ⏹️ Stop
            </button>
          )}

          {/* Mode Selector */}
          <div className="studio-field" style={{ margin: 0 }}>
            <label className="studio-label" style={{ marginBottom: 4 }}>Mode</label>
            <select
              className="studio-select"
              value={visualizerMode}
              onChange={(e) => setVisualizerMode(e.target.value)}
              style={{ minWidth: 120 }}
            >
              <option value="bars">Bars</option>
              <option value="wave">Wave</option>
              <option value="circle">Circle</option>
            </select>
          </div>

          {/* Color Scheme */}
          <div className="studio-field" style={{ margin: 0 }}>
            <label className="studio-label" style={{ marginBottom: 4 }}>Colors</label>
            <select
              className="studio-select"
              value={colorScheme}
              onChange={(e) => setColorScheme(e.target.value)}
              style={{ minWidth: 120 }}
            >
              <option value="gold">Gold</option>
              <option value="purple">Purple</option>
              <option value="fire">Fire</option>
              <option value="ocean">Ocean</option>
            </select>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div 
        className="studio-panel studio-panel--glow"
        style={{ 
          padding: 0, 
          overflow: "hidden",
          background: colorSchemes[colorScheme].bg,
        }}
      >
        <canvas
          ref={canvasRef}
          width={1200}
          height={400}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            borderRadius: 12,
          }}
        />
      </div>

      {/* Instructions */}
      {status === "idle" && (
        <div className="studio-panel" style={{ marginTop: 24, textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>🎤</div>
          <h3 style={{ margin: "0 0 8px", color: "#f4f4f7" }}>Ready to Visualize</h3>
          <p style={{ color: "#888", margin: 0 }}>
            Click "Start Visualizer" to see your audio come to life. 
            Make sure to allow microphone access when prompted.
          </p>
        </div>
      )}
    </div>
  );
}
