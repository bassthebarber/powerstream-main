import React from "react";
import styles from "../../styles/TVStations.module.css";

export default function UploadPanel() {
  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Upload</h3>
      <div className={styles.row}>
        <input className={styles.input} type="file" accept="video/*" multiple />
        <button className={styles.btn}>Upload Video</button>
      </div>
      <div className={styles.row} style={{marginTop:8}}>
        <input className={styles.input} type="file" accept="audio/*" multiple />
        <button className={styles.btn}>Upload Audio</button>
      </div>
      <div className={styles.note}>POST /api/upload → returns file URLs for your library.</div>
    </section>
  );
}


