import React from "react";
import styles from "./upload.module.css";

export default function UploadSuccessModal({ url, onClose }) {
  if (!url) return null;

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <h3>✅ Upload Successful!</h3>
        <p>Your file has been uploaded.</p>
        <a href={url} target="_blank" rel="noopener noreferrer">
          View File
        </a>
        <button onClick={onClose} className={styles.button}>Close</button>
      </div>
    </div>
  );
}


