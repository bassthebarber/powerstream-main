// frontend/src/voice/VoiceModePage.js
import React, { useState } from "react";
import VoiceInputButton from "./VoiceInputButton";
import VoiceCommandHandler from "./VoiceCommandHandler";
import styles from "./voice.module.css";

export default function VoiceModePage() {
  const [lastCommand, setLastCommand] = useState("");

  const handleCommand = (cmd) => {
    setLastCommand(cmd);
    VoiceCommandHandler(cmd);
  };

  return (
    <div className={styles.voiceContainer}>
      <h2 className={styles.title}>🎙️ Voice Mode Activated</h2>
      <VoiceInputButton onCommand={handleCommand} />
      {lastCommand && (
        <p className={styles.lastCommand}>
          Last Command: <strong>{lastCommand}</strong>
        </p>
      )}
    </div>
  );
}


