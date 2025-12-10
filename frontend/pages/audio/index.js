// frontend/pages/audio/index.js
import React, { useEffect, useState } from "react";
import Head from "next/head"; // If using Next.js
import styles from "./audio.module.css";

export default function AudioIndex() {
  const [audioList, setAudioList] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5001";

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/audio`);
        const data = await res.json();
        setAudioList(data || []);
      } catch (err) {
        console.error("❌ Failed to load audio files:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAudio();
  }, [API_BASE]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Audio Library - PowerStream</title>
      </Head>

      <h1 className={styles.title}>🎵 PowerStream Audio Library</h1>

      {loading && <p>Loading audio files...</p>}

      {!loading && audioList.length === 0 && (
        <p className={styles.empty}>No audio files found.</p>
      )}

      <div className={styles.grid}>
        {audioList.map((audio, index) => (
          <div key={index} className={styles.card}>
            <audio controls src={audio.url} />
            <p className={styles.filename}>
              {audio.title || audio.filename || `Track ${index + 1}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
