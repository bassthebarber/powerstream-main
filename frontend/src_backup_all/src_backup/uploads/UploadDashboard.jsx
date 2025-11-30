import React, { useState } from "react";
import VideoUploadForm from "./VideoUploadForm";
import ImageUploadForm from "./ImageUploadForm";
import AudioUploadForm from "./AudioUploadForm";
import UploadSuccessModal from "./UploadSuccessModal";
import styles from "./upload.module.css";

export default function UploadDashboard() {
  const [successUrl, setSuccessUrl] = useState("");

  return (
    <div className={styles.dashboard}>
      <h2>📤 Upload Dashboard</h2>
      <VideoUploadForm onUploadSuccess={setSuccessUrl} />
      <ImageUploadForm onUploadSuccess={setSuccessUrl} />
      <AudioUploadForm onUploadSuccess={setSuccessUrl} />
      <UploadSuccessModal url={successUrl} onClose={() => setSuccessUrl("")} />
    </div>
  );
}


