import React, { useRef, useState } from "react";
import { uploadAvatar } from "../lib/api.js";

export default function AvatarUpload({ onUpdated }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSelect = () => {
    inputRef.current?.click();
  };

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const data = await uploadAvatar(formData);
      if (onUpdated && data?.user) {
        onUpdated(data.user);
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setError("Failed to upload avatar. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={handleSelect}
        disabled={loading}
        style={{
          padding: "6px 12px",
          borderRadius: 999,
          border: "1px solid rgba(255,184,77,0.6)",
          background: "transparent",
          color: "#ffb84d",
          fontSize: 12,
          cursor: loading ? "default" : "pointer",
        }}
      >
        {loading ? "Uploading..." : "Change Avatar"}
      </button>
      {error && (
        <div style={{ marginTop: 4, fontSize: 11, color: "#f97373" }}>
          {error}
        </div>
      )}
    </div>
  );
}



