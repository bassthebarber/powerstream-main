import React, { useEffect } from "react";
import styles from "../../styles/Welcome.module.css";

const Welcome = () => {
  useEffect(() => {
    const audio = new Audio("/audio/welcome-voice.mp3");
    audio.volume = 0.8;
    audio.play().catch(() => {
      const btn = document.getElementById("welcome-audio-btn");
      if (btn) btn.style.display = "inline-flex";
    });
  }, []);

  const manualPlay = () => {
    const audio = new Audio("/audio/welcome-voice.mp3");
    audio.volume = 0.8;
    audio.play().catch(() => {});
    const btn = document.getElementById("welcome-audio-btn");
    if (btn) btn.style.display = "none";
  };

  return (
    <div className={styles.container}>
      <img src="/logos/powerstream-logo.png" alt="PowerStream" className={styles.logo} />
      <h1 className={styles.text}>Welcome to PowerStream</h1>
      <button id="welcome-audio-btn" onClick={manualPlay} className={styles.audioBtn} style={{ display: "none" }}>
        ? Play Welcome
      </button>
    </div>
  );
};

export default Welcome;


