import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { createReel } from "../lib/api.js";

const gold = "#ffb84d";

export default function ReelUploadModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      setError("Video URL is required");
      return;
    }

    if (!user?.id) {
      setError("You must be logged in to create a reel");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const payload = {
        videoUrl: videoUrl.trim(),
        caption: caption.trim() || "",
        username: user.name || user.username || "Guest",
      };

      const result = await createReel(payload);
      if (result?.ok || result?.reel) {
        // Close modal and navigate to PowerReel
        onClose();
        navigate("/powerreel");
      } else {
        setError(result?.message || "Failed to create reel");
      }
    } catch (err) {
      console.error("Error creating reel:", err);
      setError(err.response?.data?.message || "Failed to create reel");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setVideoUrl("");
    setCaption("");
    setError("");
    onClose();
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 500,
          background: "#111",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.1)",
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0, color: gold, fontSize: 20 }}>Create Reel</h2>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: 24,
              cursor: "pointer",
              padding: 0,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 15px",
              borderRadius: 8,
              marginBottom: 16,
              background: "rgba(239,68,68,0.15)",
              border: "1px solid #ef4444",
              color: "#ef4444",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
              }}
            >
              Video URL *
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
              required
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "#050507",
                color: "#fff",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
              }}
            >
              Caption (optional)
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption to your reel..."
              rows={3}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "#050507",
                color: "#fff",
                fontSize: 14,
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "transparent",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !videoUrl.trim()}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                background: submitting || !videoUrl.trim() ? "#555" : gold,
                color: "#000",
                fontWeight: 700,
                cursor: submitting || !videoUrl.trim() ? "default" : "pointer",
              }}
            >
              {submitting ? "Creating..." : "Create Reel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

