import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../lib/api.js";

const gold = "#ffb84d";

export default function GramUploadForm({ onUploaded }) {
  const { user } = useAuth();
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    try {
      setLoading(true);
      await api.post("/powergram", {
        userId: String(user?.id || "guest"),
        username: user?.name || user?.email || "Guest",
        imageUrl: imageUrl.trim(),
        caption: caption.trim(),
      });
      setImageUrl("");
      setCaption("");
      if (onUploaded) onUploaded();
    } catch (err) {
      console.error("Error uploading gram:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="ps-card"
      style={{ marginBottom: 16 }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: 12,
          fontSize: "1.1rem",
          color: gold,
        }}
      >
        Share a Photo
      </h2>
      <input
        type="url"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="Image URL"
        required
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "#050507",
          color: "#fff",
          marginBottom: 8,
        }}
      />
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Caption (optional)"
        rows={2}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "#050507",
          color: "#fff",
          resize: "vertical",
          marginBottom: 12,
          fontSize: 13,
        }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="submit"
          disabled={loading || !imageUrl.trim()}
          style={{
            padding: "8px 18px",
            borderRadius: 999,
            border: "none",
            background: loading ? "#555" : gold,
            color: "#000",
            fontWeight: 700,
            cursor: loading ? "default" : "pointer",
          }}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </form>
  );
}






