// frontend/src/pages/studio/StudioVisualizerPage.jsx
// Audio Visualizer - Real-time visualization
import React, { useState, useRef, useEffect } from "react";
import "../../styles/studio-unified.css";

const PRESETS = [
  { id: "waveform", name: "Waveform", icon: "〰️", desc: "Classic audio wave" },
  { id: "spectrum", name: "Spectrum", icon: "📊", desc: "Frequency analyzer" },
  { id: "bars", name: "Bars", icon: "📶", desc: "Vertical bars" },
  { id: "circular", name: "Circular", icon: "🔘", desc: "Radial visualizer" },
  { id: "particles", name: "Particles", icon: "✨", desc: "Particle effects" },
  { id: "custom", name: "Custom", icon: "🎨", desc: "Your saved preset" },
];

export default function StudioVisualizerPage() {
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [activePreset, setActivePreset] = useState("waveform");
  const [sensitivity, setSensitivity] = useState(70);
  const [color, setColor] = useState("#ffb84d");
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, height);

      // Add subtle grid
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (isActive) {
        const sens = sensitivity / 100;
        
        if (activePreset === "waveform") {
          // Waveform visualization
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, height / 2);
          
          for (let x = 0; x < width; x++) {
            const y = height / 2 + Math.sin(x * 0.02 + Date.now() * 0.003) * (50 + Math.random() * 50 * sens);
            ctx.lineTo(x, y);
          }
          ctx.stroke();
          
          // Add glow effect
          ctx.shadowColor = color;
          ctx.shadowBlur = 20;
          ctx.stroke();
          ctx.shadowBlur = 0;
          
        } else if (activePreset === "spectrum" || activePreset === "bars") {
          // Spectrum / Bars visualization
          const bars = 64;
          const barWidth = width / bars - 2;
          
          for (let i = 0; i < bars; i++) {
            const barHeight = (Math.random() * height * 0.6 + 20) * sens;
            const x = i * (barWidth + 2);
            
            // Gradient
            const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, adjustBrightness(color, 0.5));
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);
            
            // Reflection
            ctx.fillStyle = `${color}20`;
            ctx.fillRect(x, height, barWidth, barHeight * 0.3);
          }
          
        } else if (activePreset === "circular") {
          // Circular visualizer
          const centerX = width / 2;
          const centerY = height / 2;
          const baseRadius = 80;
          const points = 64;
          
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          
          for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const radius = baseRadius + Math.random() * 60 * sens;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          
          ctx.closePath();
          ctx.shadowColor = color;
          ctx.shadowBlur = 20;
          ctx.stroke();
          ctx.shadowBlur = 0;
          
        } else if (activePreset === "particles") {
          // Particles
          for (let i = 0; i < 100; i++) {
            const x = Math.random() * width;
            const y = height - Math.random() * height * sens;
            const size = Math.random() * 4 + 1;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `${color}${Math.floor(Math.random() * 155 + 100).toString(16)}`;
            ctx.fill();
          }
        }
      } else {
        // Idle state - subtle animation
        ctx.fillStyle = "#888";
        ctx.font = "16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Press Start to begin visualization", width / 2, height / 2);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, activePreset, sensitivity, color]);

  return (
    <div>
      {/* Header */}
      <div className="studio-header">
        <h1 className="studio-header-title">🌈 Visualizer</h1>
        <p className="studio-header-subtitle">
          Create stunning audio visualizations for your tracks
        </p>
      </div>

      {/* Main Visualizer */}
      <div className="studio-card studio-card--highlight" style={{ marginBottom: 24 }}>
        <div style={{
          background: "#0a0a0a",
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 20,
          border: isActive ? "1px solid rgba(255,184,77,0.3)" : "1px solid rgba(255,255,255,0.1)",
          boxShadow: isActive ? "0 0 30px rgba(255,184,77,0.1)" : "none",
          transition: "all 0.3s ease"
        }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>

        {/* Main Controls */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            className={`studio-btn ${isActive ? "studio-btn--danger" : "studio-btn--primary"}`}
            onClick={() => setIsActive(!isActive)}
            style={{ minWidth: 160 }}
          >
            {isActive ? "⏹ Stop" : "▶ Start"} Visualization
          </button>
          <button className="studio-btn studio-btn--secondary">
            🎬 Render Video
          </button>
          <button className="studio-btn studio-btn--secondary">
            💾 Save Preset
          </button>
          <button className="studio-btn studio-btn--outline">
            📤 Send to PowerStream
          </button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="studio-grid studio-grid--2" style={{ marginBottom: 24 }}>
        {/* Presets */}
        <div className="studio-card">
          <div className="studio-card-header">
            <h3 className="studio-card-title">Presets</h3>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setActivePreset(preset.id)}
                style={{
                  padding: 16,
                  background: activePreset === preset.id 
                    ? "rgba(255,184,77,0.15)" 
                    : "rgba(255,255,255,0.03)",
                  border: activePreset === preset.id 
                    ? "1px solid rgba(255,184,77,0.5)" 
                    : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>{preset.icon}</div>
                <div style={{ 
                  fontSize: 13, 
                  fontWeight: 600, 
                  color: activePreset === preset.id ? "#ffb84d" : "#fff",
                  marginBottom: 4
                }}>
                  {preset.name}
                </div>
                <div style={{ fontSize: 11, color: "#888" }}>{preset.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="studio-card">
          <div className="studio-card-header">
            <h3 className="studio-card-title">Settings</h3>
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <label className="studio-label" style={{ margin: 0 }}>Sensitivity</label>
              <span style={{ color: "#ffb84d", fontWeight: 700 }}>{sensitivity}%</span>
            </div>
            <input
              type="range"
              className="studio-slider"
              min="10"
              max="100"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseInt(e.target.value))}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="studio-label">Color</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["#ffb84d", "#ff4d94", "#4d94ff", "#4dff94", "#ff4444", "#ffffff"].map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: c,
                    border: color === c ? "3px solid #fff" : "1px solid rgba(255,255,255,0.2)",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  background: "transparent"
                }}
              />
            </div>
          </div>

          <div className="studio-card-desc" style={{ marginTop: 20 }}>
            💡 Tip: Use "Render Video" to create a video file synced to your audio for sharing on PowerStream.
          </div>
        </div>
      </div>
    </div>
  );
}

function adjustBrightness(hex, factor) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  const newR = Math.min(255, Math.floor(r * factor));
  const newG = Math.min(255, Math.floor(g * factor));
  const newB = Math.min(255, Math.floor(b * factor));
  
  return `rgb(${newR}, ${newG}, ${newB})`;
}
