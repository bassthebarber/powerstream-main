import React, { useState } from "react";
import styles from "./upload.module.css";

export default function ImageUploadForm({ onUploadSuccess }) {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await fetch("/api/upload/image", { method: "POST", body: formData });
      const data = await res.json();
      onUploadSuccess && onUploadSuccess(data.url);
    } catch (err) {
      console.error("Image upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleUpload}>
      <label className={styles.label}>Upload Image</label>
      <input type="file" accept="image/*" onChange={handleFileChange} className={styles.input} />
      <button type="submit" disabled={uploading} className={styles.button}>
        {uploading ? "Uploading..." : "Upload Image"}
      </button>
    </form>
  );
}


