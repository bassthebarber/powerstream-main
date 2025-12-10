import React, { useState } from "react";
import styles from "./upload.module.css";

export default function VideoUploadForm({ onUploadSuccess }) {
  const [video, setVideo] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setVideo(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!video) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", video);

    try {
      const res = await fetch("/api/upload/video", { method: "POST", body: formData });
      const data = await res.json();
      onUploadSuccess && onUploadSuccess(data.url);
    } catch (err) {
      console.error("Video upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleUpload}>
      <label className={styles.label}>Upload Video</label>
      <input type="file" accept="video/*" onChange={handleFileChange} className={styles.input} />
      <button type="submit" disabled={uploading} className={styles.button}>
        {uploading ? "Uploading..." : "Upload Video"}
      </button>
    </form>
  );
}


