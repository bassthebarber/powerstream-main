// frontend/src/pages/VoiceApp.jsx
import React, { useEffect, useState } from "react";
import startVoiceRecognition from "../utils/voiceRecognition";
import commandMap from "../utils/aiCommandMap";

export default function VoiceApp() {
  const [lastHeard, setLastHeard] = useState("");

  useEffect(() => {
    const handleCommand = async (transcript) => {
      setLastHeard(transcript);
      const key = transcript.toLowerCase();
      const action = commandMap[key];
      if (action) {
        try {
          await action();
        } catch (e) {
          alert(`❌ Command failed: ${e.message}`);
        }
      } else {
        console.log("Unrecognized command:", transcript);
      }
    };

    const stop = startVoiceRecognition(handleCommand);
    return () => stop && stop();
  }, []);

  return (
    <div style={{ padding: 16, color: "#e8e8e8", background: "#0a0a0a", minHeight: "100vh" }}>
      <h2>🎤 Voice Control Active</h2>
      <p>Speak a command like “build powerfeed”, “open gram”, “log in”, “open copilot”.</p>
      <p style={{ opacity: 0.8, marginTop: 6 }}>
        Tip: Voice works best in Chrome (Web Speech API). The browser will ask for mic permission.
      </p>
      <div style={{ marginTop: 12, fontFamily: "monospace" }}>
        Last heard: {lastHeard || "—"}
      </div>
    </div>
  );
}


