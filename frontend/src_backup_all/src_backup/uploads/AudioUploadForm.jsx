import React, { useState } from "react";
import styles from "./upload.module.css";

export default function AudioUploadForm({ onUploadSuccess }) {
  const [audio, setAudio] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setAudio(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!audio) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", audio);

    try {
      const res = await fetch("/api/upload/audio", { method: "POST", body: formData });
      const data = await res.json();
      onUploadSuccess && onUploadSuccess(data.url);
    } catch (err) {
      console.error("Audio upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleUpload}>
      <label className={styles.label}>Upload Audio</label>
      <input type="file" accept="audio/*" onChange={handleFileChange} className={styles.input} />
      <button type="submit" disabled={uploading} className={styles.button}>
        {uploading ? "Uploading..." : "Upload Audio"}
      </button>
    </form>
  );
}


