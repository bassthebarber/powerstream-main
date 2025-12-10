import React from "react";
import styles from "./stream.module.css";

export default function ProfileStream() {
  return (
    <div className={styles.container}>
      <h2>🎥 Live Stream</h2>
      <video width="100%" height="auto" controls>
        <source src="/sample-stream.mp4" type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>
    </div>
  );
}
