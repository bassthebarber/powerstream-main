import React, { useState } from "react";
import styles from "../../styles/TVStations.module.css";

export default function LivePanel() {
  const [hlsUrl, setHlsUrl] = useState("");
  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Go Live (HLS)</h3>
      <div className={styles.row}>
        <input
          className={styles.input}
          placeholder="Paste your HLS .m3u8 URL (signed by backend)"
          value={hlsUrl}
          onChange={(e)=>setHlsUrl(e.target.value)}
          size={48}
        />
        <button className={styles.btn} onClick={()=>{ /* open/connect */ }}>Connect</button>
      </div>
      <div className={styles.note}>Use HLS.js/Video.js in prod; this built-in player handles simple cases.</div>
      <div style={{marginTop:8}} className={styles.card}>
        <video controls playsInline src={hlsUrl} style={{ width:"100%", height:360, background:"#000", borderRadius:10 }} />
      </div>
    </section>
  );
}


