import React, { useEffect, useState } from "react";
import styles from "./fold.module.css";

export default function VideoFoldPage() {
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [allVideos, setAllVideos] = useState([]);

  useEffect(() => {
    // Fetch featured videos
    fetch("/api/video/featured")
      .then(res => res.json())
      .then(data => setFeaturedVideos(data || []))
      .catch(err => console.error("❌ Failed to load featured videos:", err));

    // Fetch all videos
    fetch("/api/video")
      .then(res => res.json())
      .then(data => setAllVideos(data || []))
      .catch(err => console.error("❌ Failed to load all videos:", err));
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🎬 PowerStream Video Fold</h1>

      {/* Featured Section */}
      <section>
        <h2 className={styles.sectionTitle}>🔥 Featured Videos</h2>
        <div className={styles.grid}>
          {featuredVideos.length === 0 && <p>No featured videos available.</p>}
          {featuredVideos.map((vid, i) => (
            <div key={i} className={styles.card}>
              <video controls src={vid.url} />
              <h4>{vid.title}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* All Videos Section */}
      <section>
        <h2 className={styles.sectionTitle}>📁 All Videos</h2>
        <div className={styles.grid}>
          {allVideos.length === 0 && <p>No videos found.</p>}
          {allVideos.map((vid, i) => (
            <div key={i} className={styles.card}>
              <video controls src={vid.url} />
              <h4>{vid.title}</h4>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
