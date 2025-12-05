import React, { useState, useRef, useEffect } from "react";
import ReelUploadModal from "./ReelUploadModal.jsx";

const gold = "#ffb84d";

export default function PostForm({ onSubmit }) {
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReelModal, setShowReelModal] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl.trim()) return;
    try {
      setSubmitting(true);
      await onSubmit({
        content: content.trim(),
        mediaUrl: mediaUrl.trim() || null,
      });
      setContent("");
      setMediaUrl("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="ps-card" style={{ marginBottom: 16, position: "relative" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.1rem",
              color: gold,
            }}
          >
            Create Post
          </h2>
          <div ref={menuRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                background: gold,
                color: "#000",
                fontSize: 20,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              +
            </button>
            {showMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: 8,
                  background: "#111",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: 8,
                  minWidth: 160,
                  zIndex: 100,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    textAlign: "left",
                    cursor: "pointer",
                    borderRadius: 8,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(255,255,255,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                  }}
                >
                  <span>📝</span>
                  <span>Create Post</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    setShowReelModal(true);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    textAlign: "left",
                    cursor: "pointer",
                    borderRadius: 8,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(255,255,255,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                  }}
                >
                  <span>🎬</span>
                  <span>Create Reel</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share something with the feed..."
        rows={3}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "#050507",
          color: "#fff",
          resize: "vertical",
          marginBottom: 8,
        }}
      />
      <input
        type="url"
        value={mediaUrl}
        onChange={(e) => setMediaUrl(e.target.value)}
        placeholder="Image or video URL (optional)"
        style={{
          width: "100%",
          padding: 8,
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "#050507",
          color: "#fff",
          marginBottom: 12,
          fontSize: 13,
        }}
      />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={submitting || (!content.trim() && !mediaUrl.trim())}
              style={{
                padding: "8px 18px",
                borderRadius: 999,
                border: "none",
                background: submitting ? "#555" : gold,
                color: "#000",
                fontWeight: 700,
                cursor: submitting ? "default" : "pointer",
              }}
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
      <ReelUploadModal
        isOpen={showReelModal}
        onClose={() => setShowReelModal(false)}
      />
    </>
  );
}



