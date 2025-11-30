import React from "react";
import styles from "../../styles/TVStations.module.css";

export default function RecordedLibrary({ items = 6 }) {
  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Recorded Content</h3>
      <div className={styles.gridVideos}>
        {Array.from({length:items}, (_,i)=>(
          <div key={i} className={styles.card}>
            <video controls preload="metadata" />
            <div className={styles.meta}>Episode {i+1}</div>
          </div>
        ))}
      </div>
    </section>
  );
}


