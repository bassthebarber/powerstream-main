// frontend/src/pages/RecordingStudio.jsx
// PowerStream Recording Studio - Full Integration Page

import React, { useState, useCallback } from "react";
import { StudioAudioProvider, useStudioAudio } from "../studio/StudioAudioContext.jsx";
import RecordPanel from "../studio/ui/RecordPanel.jsx";
import LibraryPanel from "../studio/ui/LibraryPanel.jsx";
import AICoachPanel from "../studio/ui/AICoachPanel.jsx";
import VisualizerPanel from "../studio/ui/VisualizerPanel.jsx";
import BeatGeneratorPanel from "../studio/ui/BeatGeneratorPanel.jsx";
import ExportPanel from "../studio/ui/ExportPanel.jsx";
import "./RecordingStudio.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

// Inner component that uses the shared audio context
function RecordingStudioInner() {
  // Get shared audio context
  const { currentTrack, isPlaying } = useStudioAudio();
  
  // Active panel for mobile view
  const [activePanel, setActivePanel] = useState("record");
  
  // Current project
  const [currentProject, setCurrentProject] = useState(null);
  
  // Handle recording saved (logging only, shared context handles the rest)
  const handleRecordingSaved = useCallback((recording) => {
    console.log("[RecordingStudio] Recording saved:", recording);
  }, []);
  
  // Handle load recording from library or record panel
  const handleLoadRecording = useCallback((recording) => {
    console.log("[RecordingStudio] Loading recording:", recording);
  }, []);
  
  // Handle load master
  const handleLoadMaster = useCallback((master) => {
    console.log("[RecordingStudio] Loading master:", master);
  }, []);
  
  // Handle load beat
  const handleLoadBeat = useCallback((beat) => {
    console.log("[RecordingStudio] Loading beat:", beat);
  }, []);
  
  // Handle AI feedback
  const handleFeedbackReceived = useCallback((feedback) => {
    console.log("[RecordingStudio] AI Feedback received:", feedback);
  }, []);

  // Panel tabs for mobile
  const panels = [
    { key: "record", label: "Record", icon: "🎙️" },
    { key: "library", label: "Library", icon: "📚" },
    { key: "beats", label: "Beats", icon: "🎹" },
    { key: "export", label: "Export", icon: "💾" },
    { key: "coach", label: "AI Coach", icon: "🤖" },
    { key: "visualizer", label: "Visualizer", icon: "🌊" },
  ];

  return (
    <div className="recording-studio-page">
      <header className="studio-header">
        <div className="studio-branding">
          <span className="studio-logo">🎵</span>
          <div className="studio-title">
            <h1>Recording Studio</h1>
            <span className="studio-subtitle">PowerStream Audio Engine</span>
          </div>
        </div>
        
        {currentProject && (
          <div className="current-project">
            <span className="project-label">Project:</span>
            <span className="project-name">{currentProject.title}</span>
          </div>
        )}
        
        <div className="studio-actions">
          <button className="studio-btn secondary">
            📂 Projects
          </button>
          <button className="studio-btn primary">
            ➕ New Session
          </button>
        </div>
      </header>
      
      {/* Mobile Panel Tabs */}
      <div className="mobile-tabs">
        {panels.map((panel) => (
          <button
            key={panel.key}
            className={`mobile-tab ${activePanel === panel.key ? "active" : ""}`}
            onClick={() => setActivePanel(panel.key)}
          >
            <span className="tab-icon">{panel.icon}</span>
            <span className="tab-label">{panel.label}</span>
          </button>
        ))}
      </div>
      
      <main className="studio-grid">
        {/* Left Column - Recording & Beats */}
        <div className={`studio-column left ${["record", "beats"].includes(activePanel) ? "mobile-active" : ""}`}>
          <div className={activePanel === "record" ? "mobile-active" : ""}>
            <RecordPanel
              projectId={currentProject?._id}
              onRecordingSaved={handleRecordingSaved}
              onLoadRecording={handleLoadRecording}
            />
          </div>
          
          <div className={activePanel === "beats" ? "mobile-active" : ""}>
            <BeatGeneratorPanel />
          </div>
        </div>
        
        {/* Center Column - Library, Visualizer & Export */}
        <div className={`studio-column center ${["library", "visualizer", "export"].includes(activePanel) ? "mobile-active" : ""}`}>
          <div className={activePanel === "library" ? "mobile-active" : ""}>
            <LibraryPanel
              onLoadMaster={handleLoadMaster}
              onLoadRecording={handleLoadRecording}
              onLoadBeat={handleLoadBeat}
            />
          </div>
          
          <div className={activePanel === "visualizer" ? "mobile-active" : ""}>
            <VisualizerPanel />
          </div>
          
          <div className={activePanel === "export" ? "mobile-active" : ""}>
            <ExportPanel />
          </div>
        </div>
        
        {/* Right Column - AI Coach */}
        <div className={`studio-column right ${activePanel === "coach" ? "mobile-active" : ""}`}>
          <AICoachPanel onFeedbackReceived={handleFeedbackReceived} />
        </div>
      </main>
      
      {/* Footer Status */}
      <footer className="studio-footer">
        <div className="status-item">
          <span className={`status-dot ${isPlaying ? "playing" : "online"}`} />
          <span>{isPlaying ? "Playing" : "Engine Ready"}</span>
        </div>
        <div className="status-item">
          <span>🎚️ 44.1kHz / 24-bit</span>
        </div>
        <div className="status-item">
          <span>📡 Connected to Cloud</span>
        </div>
        {currentTrack && (
          <div className="status-item current-track">
            <span>🎵 {currentTrack.title || "Unknown"}</span>
          </div>
        )}
      </footer>
    </div>
  );
}

// Main export with provider wrapper
export default function RecordingStudio() {
  return (
    <StudioAudioProvider>
      <RecordingStudioInner />
    </StudioAudioProvider>
  );
}

