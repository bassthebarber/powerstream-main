// frontend/src/components/studio/StudioStatusBanner.jsx
// Shows Recording Studio server status and degrades gracefully
import React, { useState, useEffect } from "react";
import { checkStudioHealth, checkMainApiHealth } from "../../lib/studioApi.js";

export default function StudioStatusBanner({ compact = false }) {
  const [mainApiStatus, setMainApiStatus] = useState("checking");
  const [studioStatus, setStudioStatus] = useState("checking");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkStatuses();
    // Recheck every 30 seconds
    const interval = setInterval(checkStatuses, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkStatuses = async () => {
    try {
      const [main, studio] = await Promise.all([
        checkMainApiHealth(),
        checkStudioHealth(),
      ]);
      setMainApiStatus(main.ok ? "online" : "offline");
      setStudioStatus(studio.ok && studio.online ? "online" : "offline");
    } catch {
      setMainApiStatus("error");
      setStudioStatus("error");
    }
  };

  // If everything is online and we're in compact mode, don't show anything
  if (compact && mainApiStatus === "online" && studioStatus === "online") {
    return null;
  }

  // If main API is offline, show critical error
  if (mainApiStatus === "offline" || mainApiStatus === "error") {
    return (
      <div className="studio-alert studio-alert--error" style={{ marginBottom: 16 }}>
        <span>
          ❌ <strong>Connection Error:</strong> Cannot reach PowerStream API. 
          Please check your connection or try again later.
        </span>
      </div>
    );
  }

  // If Recording Studio is offline, show warning
  if (studioStatus === "offline" || studioStatus === "checking") {
    return (
      <div 
        className="studio-alert studio-alert--warning" 
        style={{ 
          marginBottom: 16,
          background: "rgba(255, 184, 77, 0.1)",
          border: "1px solid rgba(255, 184, 77, 0.3)",
          borderRadius: 8,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🔧</span>
          <div>
            <strong style={{ color: "#FFB84D" }}>Advanced Studio Features Offline</strong>
            <p style={{ margin: "4px 0 0", opacity: 0.8, fontSize: 13 }}>
              Recording, AI beats, and mastering use browser-based fallbacks. 
              {!compact && " Your work is saved locally."}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: "transparent",
            border: "1px solid rgba(255, 184, 77, 0.5)",
            borderRadius: 4,
            padding: "4px 10px",
            color: "#FFB84D",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          {showDetails ? "Hide" : "Details"}
        </button>
      </div>
    );
  }

  // Everything online - show minimal indicator in compact mode
  if (compact) {
    return null;
  }

  return (
    <div 
      style={{ 
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        gap: 8,
        opacity: 0.6,
        fontSize: 12,
      }}
    >
      <span style={{ 
        width: 8, 
        height: 8, 
        borderRadius: "50%", 
        background: "#4CAF50",
        boxShadow: "0 0 6px #4CAF50",
      }} />
      <span>Studio fully operational</span>
    </div>
  );
}

// Simpler hook for components that just need to know the status
export function useStudioStatus() {
  const [status, setStatus] = useState({
    mainApi: "checking",
    recordingStudio: "checking",
    isFullyOperational: false,
    isRecordingStudioOnline: false,
  });

  useEffect(() => {
    const check = async () => {
      try {
        const [main, studio] = await Promise.all([
          checkMainApiHealth(),
          checkStudioHealth(),
        ]);
        setStatus({
          mainApi: main.ok ? "online" : "offline",
          recordingStudio: studio.ok && studio.online ? "online" : "offline",
          isFullyOperational: main.ok && studio.ok && studio.online,
          isRecordingStudioOnline: studio.ok && studio.online,
        });
      } catch {
        setStatus({
          mainApi: "error",
          recordingStudio: "error",
          isFullyOperational: false,
          isRecordingStudioOnline: false,
        });
      }
    };

    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return status;
}

