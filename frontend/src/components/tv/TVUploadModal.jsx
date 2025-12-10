// frontend/src/components/tv/TVUploadModal.jsx
// Upload modal for TV station videos
import React, { useState, useRef } from "react";
import styles from "./TVStation.module.css";
import api from "../../lib/api";

const TVUploadModal = ({ 
  open, 
  onClose, 
  stationSlug, 
  stationName,
  onUploaded 
}) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  if (!open) return null;

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-fill title from filename
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
      setError(null);
    }
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith("video/")) {
      setFile(droppedFile);
      if (!title) {
        setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
      }
      setError(null);
    } else {
      setError("Please drop a valid video file");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Reset form
  const resetForm = () => {
    setFile(null);
    setTitle("");
    setDescription("");
    setError(null);
    setUploadProgress(0);
  };

  // Handle close
  const handleClose = () => {
    if (!isUploading) {
      resetForm();
      onClose();
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select a video file");
      return;
    }

    if (!stationSlug) {
      setError("Station not specified");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(10);

      const formData = new FormData();
      formData.append("video", file); // Backend expects "video" field
      formData.append("title", title || file.name);
      formData.append("description", description);
      formData.append("station", stationSlug); // Backend expects "station" field

      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 180000, // 180 seconds for large videos
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(Math.min(10 + percent * 0.8, 90));
        }
      });

      setUploadProgress(100);

      // Backend returns { success, video, videoUrl, thumbnail, duration }
      if (res.data?.success || res.data?.video || res.data?.videoUrl) {
        const uploadedVideo = res.data.video || {
          _id: res.data.publicId || Date.now().toString(),
          title: title,
          videoUrl: res.data.videoUrl,
          url: res.data.videoUrl,
          thumbnailUrl: res.data.thumbnail,
          thumbnail: res.data.thumbnail,
          duration: res.data.duration || 0,
          description: description,
        };
        if (onUploaded) {
          onUploaded(uploadedVideo);
        }
        resetForm();
        onClose();
      } else {
        throw new Error(res.data?.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Upload failed. Please try again."
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Format file size
  const formatSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalTitleRow}>
          <div className={styles.modalTitle}>
            📤 Upload to {stationName || "Station"}
          </div>
          <button 
            className={styles.modalClose} 
            type="button" 
            onClick={handleClose}
            disabled={isUploading}
          >
            ✕
          </button>
        </div>

        <form className={styles.modalBody} onSubmit={handleSubmit}>
          {/* File Drop Zone */}
          <div
            className={styles.dropZone}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={isUploading}
            />
            {file ? (
              <div className={styles.filePreview}>
                <div className={styles.fileIcon}>🎬</div>
                <div className={styles.fileName}>{file.name}</div>
                <div className={styles.fileSize}>{formatSize(file.size)}</div>
              </div>
            ) : (
              <div className={styles.dropZoneText}>
                <div className={styles.dropZoneIcon}>📁</div>
                <p>Drag & drop a video file here</p>
                <p className={styles.smallNote}>or click to browse</p>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div>
            <label className={styles.modalLabel}>Title</label>
            <input
              className={styles.modalInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title..."
              disabled={isUploading}
              maxLength={100}
            />
          </div>

          {/* Description Input */}
          <div>
            <label className={styles.modalLabel}>Description</label>
            <textarea
              className={styles.modalTextarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description for viewers..."
              disabled={isUploading}
              maxLength={500}
              rows={3}
            />
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className={styles.progressText}>
                Uploading... {uploadProgress}%
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              ⚠️ {error}
            </div>
          )}

          {/* Footer Buttons */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.modalSecondary}
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.modalPrimary}
              disabled={isUploading || !file}
            >
              {isUploading ? "Uploading…" : "Upload Video"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TVUploadModal;
