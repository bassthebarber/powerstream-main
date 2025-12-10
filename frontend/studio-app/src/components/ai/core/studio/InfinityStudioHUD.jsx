// frontend/src/components/ai/core/studio/InfinityStudioHUD.jsx
import React, { useState, useEffect } from "react";
import "./studio.css";

const InfinityStudioHUD = ({ status, progress, currentTrack }) => {
  const [animation, setAnimation] = useState(false);

  useEffect(() => {
    if (status === "processing") setAnimation(true);
    else setAnimation(false);
  }, [status]);

  return (
    <div className="studioHUD">
      <div className="hud-header">
        <h2>🎧 Infinity Studio HUD</h2>
        <span className={`status ${status}`}>{status.toUpperCase()}</span>
      </div>

      <div className="hud-body">
        <div className="track-display">
          <strong>Track:</strong> {currentTrack || "No track loaded"}
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div
              className={`progress-fill ${animation ? "active" : ""}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-label">{progress}%</span>
        </div>

        <div className="visualizer">
          <div className="wave-bar" />
          <div className="wave-bar" />
          <div className="wave-bar" />
          <div className="wave-bar" />
        </div>
      </div>
    </div>
  );
};

export default InfinityStudioHUD;
