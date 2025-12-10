// frontend/src/voice/VoiceInputButton.js
import React, { useState } from "react";
import { startSpeechDetection } from "../utils/speech-detect";
import styles from "./voice.module.css";

export default function VoiceInputButton({ onCommand }) {
  const [listening, setListening] = useState(false);

  const handleClick = () => {
    setListening(true);
    const recognition = startSpeechDetection(
      (text) => {
        if (onCommand) onCommand(text);
        setListening(false);
      },
      (err) => {
        console.error("Voice error:", err);
        setListening(false);
      }
    );
  };

  return (
    <button className={listening ? styles.buttonActive : styles.button} onClick={handleClick}>
      {listening ? "Listening..." : "🎤 Speak Command"}
    </button>
  );
}


