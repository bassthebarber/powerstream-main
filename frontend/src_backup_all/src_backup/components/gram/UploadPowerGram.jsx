// frontend/src/components/PowerGram/UploadPowerGram.jsx

import React, { useState } from "react";
import styles from "./UploadPowerGram.module.css";
import { supabase } from "../../supabaseClient";

const UploadPowerGram = ({ user }) => {
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleUpload = async () => {
    if (!imageFile || !caption || !user) {
      alert("All fields are required.");
      return;
    }

    setUploading(true);
    const filename = `${user.id}-${Date.now()}-${imageFile.name}`;

    const { data: storageData, error: storageError } = await supabase.storage
      .from("gram_uploads")
      .upload(filename, imageFile);

    if (storageError) {
      console.error("Storage upload error:", storageError);
      setUploading(false);
      return;
    }

    const imageUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/gram_uploads/${filename}`;

    const { error: dbError } = await supabase
      .from("gram_posts")
      .insert([
        {
          user_id: user.id,
          caption: caption,
          image_url: imageUrl,
        },
      ]);

    if (dbError) {
      console.error("Database insert error:", dbError);
    } else {
      setSuccessMessage("Upload successful!");
      setCaption("");
      setImageFile(null);
    }

    setUploading(false);
  };

  return (
    <div className={styles.uploadContainer}>
      <h2>Upload to PowerGram</h2>

      {successMessage && <p className={styles.success}>{successMessage}</p>}

      <textarea
        className={styles.captionInput}
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />

      <input
        className={styles.fileInput}
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0])}
      />

      <button
        className={styles.uploadButton}
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload Now"}
      </button>
    </div>
  );
};

export default UploadPowerGram;


