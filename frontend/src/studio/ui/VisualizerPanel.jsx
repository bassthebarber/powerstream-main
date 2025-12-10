// frontend/src/studio/ui/VisualizerPanel.jsx
// Audio Visualizer Panel with multiple modes

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useStudioAudio } from "../StudioAudioContext.jsx";
import "./VisualizerPanel.css";

const MODES = [
  { key: "waveform", label: "Waveform", icon: "〰️" },
  { key: "spectrum", label: "Spectrum", icon: "📊" },
  { key: "circular", label: "Circular", icon: "🔵" },
  { key: "particles", label: "Particles", icon: "✨" },
  { key: "ball", label: "Ball", icon: "⚽" },
];

const DEFAULT_COLORS = {
  primary: "#d4af37",
  secondary: "#f0d68a",
  background: "#0a0a0a",
  glow: "rgba(212, 175, 55, 0.3)",
};

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

export default function VisualizerPanel({ masterId, audioUrl }) {
  const studioAudio = useStudioAudio();
  const { currentTrack, isPlaying } = studioAudio;
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  
  const [mode, setMode] = useState("spectrum");
  const [isRunning, setIsRunning] = useState(false);
  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [showSettings, setShowSettings] = useState(false);
  const [sensitivity, setSensitivity] = useState(1);
  const [presets, setPresets] = useState([]);
  const [toastMessage, setToastMessage] = useState("");

  // Auto-start visualization when audio is playing
  useEffect(() => {
    if (isPlaying && !isRunning) {
      setIsRunning(true);
      studioAudio.getAudioContext();
      studioAudio.getAnalyser();
    }
  }, [isPlaying, isRunning, studioAudio]);

  // Load saved presets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("studioVisualizerPresets");
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        console.error("[Visualizer] Failed to load presets:", e);
      }
    }
  }, []);

  // Animation loop
  const draw = useCallback(() => {
    if (!canvasRef.current || !isRunning) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, width, height);
    
    // Get audio data
    let frequencyData = new Uint8Array(128);
    let timeDomainData = new Uint8Array(128);
    
    try {
      frequencyData = studioAudio.getFrequencyData();
      timeDomainData = studioAudio.getTimeDomainData();
    } catch (e) {
      // Audio not connected yet
    }
    
    // Apply sensitivity
    const scaledFrequency = new Uint8Array(frequencyData.length);
    for (let i = 0; i < frequencyData.length; i++) {
      scaledFrequency[i] = Math.min(255, frequencyData[i] * sensitivity);
    }
    
    // Draw based on mode
    switch (mode) {
      case "waveform":
        drawWaveform(ctx, timeDomainData, width, height);
        break;
      case "spectrum":
        drawSpectrum(ctx, scaledFrequency, width, height);
        break;
      case "circular":
        drawCircular(ctx, scaledFrequency, width, height);
        break;
      case "particles":
        drawParticles(ctx, scaledFrequency, width, height);
        break;
      case "ball":
        drawBall(ctx, scaledFrequency, width, height);
        break;
      default:
        drawSpectrum(ctx, scaledFrequency, width, height);
    }
    
    animationRef.current = requestAnimationFrame(draw);
  }, [mode, colors, sensitivity, isRunning, studioAudio]);
  
  // Draw waveform
  const drawWaveform = (ctx, data, width, height) => {
    ctx.beginPath();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = colors.glow;
    
    const sliceWidth = width / data.length;
    let x = 0;
    
    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 128.0;
      const y = (v * height) / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  };
  
  // Draw spectrum bars
  const drawSpectrum = (ctx, data, width, height) => {
    const barCount = 64;
    const barWidth = width / barCount - 2;
    const barSpacing = 2;
    
    ctx.shadowBlur = 15;
    ctx.shadowColor = colors.glow;
    
    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor(i * (data.length / barCount));
      const barHeight = (data[dataIndex] / 255) * height * 0.85;
      
      const x = i * (barWidth + barSpacing);
      const y = height - barHeight;
      
      // Gradient for each bar
      const gradient = ctx.createLinearGradient(0, height, 0, y);
      gradient.addColorStop(0, colors.primary);
      gradient.addColorStop(1, colors.secondary);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Bar top cap
      ctx.fillStyle = colors.secondary;
      ctx.fillRect(x, y - 2, barWidth, 2);
    }
  };
  
  // Draw circular visualizer
  const drawCircular = (ctx, data, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) * 0.25;
    
    ctx.shadowBlur = 20;
    ctx.shadowColor = colors.glow;
    
    const bars = 64;
    const angleStep = (Math.PI * 2) / bars;
    
    ctx.beginPath();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 3;
    
    for (let i = 0; i < bars; i++) {
      const dataIndex = Math.floor(i * (data.length / bars));
      const amplitude = (data[dataIndex] / 255) * baseRadius * 0.8;
      const radius = baseRadius + amplitude;
      
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.stroke();
    
    // Inner circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = colors.primary;
    ctx.fill();
  };
  
  // Draw particles
  const drawParticles = (ctx, data, width, height) => {
    // Calculate average energy
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    
    // Spawn new particles based on energy
    if (avg > 50 && particlesRef.current.length < 200) {
      const spawnCount = Math.floor(avg / 40);
      for (let i = 0; i < spawnCount; i++) {
        particlesRef.current.push({
          x: width / 2 + (Math.random() - 0.5) * 100,
          y: height / 2 + (Math.random() - 0.5) * 100,
          vx: (Math.random() - 0.5) * (avg / 20),
          vy: (Math.random() - 0.5) * (avg / 20),
          size: Math.random() * 4 + 2,
          life: 1,
          decay: 0.01 + Math.random() * 0.02,
        });
      }
    }
    
    // Update and draw particles
    particlesRef.current = particlesRef.current.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      
      if (p.life <= 0) return false;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 55, ${p.life})`;
      ctx.fill();
      
      return p.life > 0;
    });
  };
  
  // Draw reactive ball
  const drawBall = (ctx, data, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    const radius = 50 + (avg / 255) * 80;
    
    // Glow
    ctx.shadowBlur = 50;
    ctx.shadowColor = colors.glow;
    
    // Gradient ball
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, colors.secondary);
    gradient.addColorStop(0.7, colors.primary);
    gradient.addColorStop(1, "rgba(212, 175, 55, 0.1)");
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Energy rings
    for (let i = 1; i <= 3; i++) {
      const ringRadius = radius + i * 20 + (avg / 255) * 10 * i;
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(212, 175, 55, ${0.3 / i})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };
  
  // Start/stop visualization
  const toggleVisualization = () => {
    if (isRunning) {
      setIsRunning(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      setIsRunning(true);
      // Initialize audio context (requires user gesture)
      studioAudio.getAudioContext();
      studioAudio.getAnalyser();
    }
  };
  
  // Start animation when running
  useEffect(() => {
    if (isRunning) {
      draw();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, draw]);
  
  // Resize canvas
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        canvasRef.current.width = parent?.clientWidth || 400;
        canvasRef.current.height = 200;
      }
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);
  
  // Save preset
  const savePreset = () => {
    const name = prompt("Enter preset name:", `Preset ${presets.length + 1}`);
    if (!name) return;
    
    const preset = {
      id: Date.now(),
      name,
      mode,
      colors,
      sensitivity,
    };
    
    const newPresets = [...presets, preset];
    setPresets(newPresets);
    localStorage.setItem("studioVisualizerPresets", JSON.stringify(newPresets));
    showToast("Preset saved!");
  };
  
  // Load preset
  const loadPreset = (preset) => {
    setMode(preset.mode);
    setColors(preset.colors);
    setSensitivity(preset.sensitivity);
    showToast(`Loaded: ${preset.name}`);
  };
  
  // Send to PowerStream
  const sendToPowerStream = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/studio/visualizer/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          masterId,
          preset: { mode, colors, sensitivity },
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        showToast("Sent to PowerStream!");
      } else {
        showToast("Failed to send");
      }
    } catch (err) {
      console.error("[Visualizer] Send error:", err);
      showToast("Connection error");
    }
  };
  
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <div className="visualizer-panel">
      <div className="visualizer-header">
        <span className="visualizer-icon">🎨</span>
        <h3>Visualizer</h3>
        <button 
          className="settings-btn"
          onClick={() => setShowSettings(!showSettings)}
        >
          ⚙️
        </button>
      </div>
      
      {/* Canvas */}
      <div className="visualizer-canvas-container">
        <canvas ref={canvasRef} className="visualizer-canvas" />
        {!isRunning && (
          <div className="canvas-overlay">
            <span>Click Start to visualize audio</span>
          </div>
        )}
      </div>
      
      {/* Mode buttons */}
      <div className="visualizer-modes">
        {MODES.map((m) => (
          <button
            key={m.key}
            className={`mode-btn ${mode === m.key ? "active" : ""}`}
            onClick={() => setMode(m.key)}
            title={m.label}
          >
            <span className="mode-icon">{m.icon}</span>
            <span className="mode-label">{m.label}</span>
          </button>
        ))}
      </div>
      
      {/* Controls */}
      <div className="visualizer-controls">
        <button
          className={`control-btn ${isRunning ? "stop" : "start"}`}
          onClick={toggleVisualization}
        >
          {isRunning ? "⏹ Stop" : "▶ Start Visualization"}
        </button>
        
        <button className="control-btn save" onClick={savePreset}>
          💾 Save Preset
        </button>
        
        <button className="control-btn send" onClick={sendToPowerStream}>
          📡 Send to PowerStream
        </button>
      </div>
      
      {/* Settings panel */}
      {showSettings && (
        <div className="visualizer-settings">
          <div className="setting-row">
            <label>Primary Color</label>
            <input
              type="color"
              value={colors.primary}
              onChange={(e) => setColors({ ...colors, primary: e.target.value })}
            />
          </div>
          <div className="setting-row">
            <label>Secondary Color</label>
            <input
              type="color"
              value={colors.secondary}
              onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
            />
          </div>
          <div className="setting-row">
            <label>Sensitivity: {sensitivity.toFixed(1)}</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
            />
          </div>
          
          {/* Saved presets */}
          {presets.length > 0 && (
            <div className="presets-list">
              <label>Saved Presets</label>
              {presets.map((p) => (
                <button
                  key={p.id}
                  className="preset-btn"
                  onClick={() => loadPreset(p)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Current Track Info */}
      {currentTrack && (
        <div className="visualizer-now-playing">
          <span className="now-playing-icon">{isPlaying ? "🎵" : "⏸️"}</span>
          <div className="now-playing-info">
            <span className="now-playing-label">
              {isPlaying ? "Now Visualizing:" : "Paused:"}
            </span>
            <span className="now-playing-title">{currentTrack.title || currentTrack.id}</span>
            {currentTrack.type && (
              <span className="now-playing-type">{currentTrack.type}</span>
            )}
          </div>
        </div>
      )}
      
      {/* Toast */}
      {toastMessage && (
        <div className="visualizer-toast">{toastMessage}</div>
      )}
    </div>
  );
}

