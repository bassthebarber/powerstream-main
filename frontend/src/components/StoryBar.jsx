// frontend/src/components/StoryBar.jsx
// Modern social stories bar component
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchStories, createStory } from "../lib/api.js";

export default function StoryBar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewerStory, setViewerStory] = useState(null);
  const [creating, setCreating] = useState(false);

  // User info
  const displayName = user?.name || user?.displayName || user?.email?.split("@")[0] || "Guest";
  const avatarUrl = user?.avatarUrl || user?.avatar;
  const initials = displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchStories();
        if (cancelled) return;
        if (data?.ok && Array.isArray(data.stories)) {
          setStories(data.stories);
        } else if (Array.isArray(data)) {
          setStories(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.log("Stories not available");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateStory = async () => {
    if (!user) return;
    const url = window.prompt("Paste image or video URL for your story:");
    if (!url || !url.trim()) return;
    setCreating(true);
    try {
      const lower = url.toLowerCase();
      const mediaType =
        lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".ogg")
          ? "video"
          : "image";
      const res = await createStory({ mediaUrl: url.trim(), mediaType, caption: "" });
      if (res?.ok && res.story) {
        setStories((prev) => [res.story, ...prev]);
      }
    } catch (err) {
      console.error("Failed to create story:", err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div className="ps-card pf-stories-section">
        <div className="pf-stories-row">
          {/* Your Story */}
          {user && (
            <StoryPill
              label="Your Story"
              isOwn
              initials={initials}
              avatarUrl={avatarUrl}
              onClick={handleCreateStory}
              creating={creating}
            />
          )}

          {/* Loading state */}
          {loading && (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              padding: "0 16px",
              color: "var(--muted)",
              fontSize: 12,
            }}>
              Loading stories…
            </div>
          )}

          {/* Real stories */}
          {!loading && stories.map((story) => (
            <StoryPill
              key={story._id || story.id}
              label={story.user?.name || story.caption || "Story"}
              avatarUrl={story.user?.avatarUrl}
              hasStory={true}
              onClick={() => setViewerStory(story)}
            />
          ))}

          {/* Fallback when no stories - Clickable station badges */}
          {!loading && stories.length === 0 && (
            <>
              {[
                { name: "Southern Power", initials: "SP", slug: "southern-power-network" },
                { name: "No Limit", initials: "NL", slug: "nolimit-east-houston" },
                { name: "Civic Connect", initials: "CC", slug: "civic-connect" },
                { name: "TGT", initials: "TG", slug: "texas-got-talent" },
              ].map((mock, i) => (
                <StoryPill
                  key={`mock-${i}`}
                  label={mock.name}
                  initials={mock.initials}
                  hasStory={true}
                  onClick={() => navigate(`/tv/${mock.slug}/catalog`)}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {viewerStory && (
        <StoryViewer story={viewerStory} onClose={() => setViewerStory(null)} />
      )}
    </>
  );
}

function StoryPill({ label, isOwn, initials, avatarUrl, hasStory = true, viewed = false, onClick, creating }) {
  const displayInitials = initials || (label ? label.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "U");
  const displayName = label?.length > 10 ? label.slice(0, 9) + "…" : label;

  return (
    <button
      type="button"
      className="pf-story-pill"
      onClick={onClick}
      disabled={creating}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: creating ? "default" : "pointer",
        opacity: creating ? 0.6 : 1,
      }}
    >
      <div className={`pf-story-ring ${isOwn ? "pf-story-ring--own" : ""} ${viewed ? "pf-story-ring--viewed" : ""}`}>
        <div className="pf-story-avatar">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={label}
              onError={(e) => {
                e.target.style.display = "none";
                if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <span
            className="pf-story-avatar-initials"
            style={{ display: avatarUrl ? "none" : "flex" }}
          >
            {displayInitials}
          </span>
          {isOwn && <span className="pf-story-add-icon">+</span>}
        </div>
      </div>
      <span className={`pf-story-name ${isOwn ? "pf-story-name--own" : ""}`}>
        {creating ? "Posting…" : isOwn ? "Your Story" : displayName}
      </span>
    </button>
  );
}

function StoryViewer({ story, onClose }) {
  if (!story) return null;
  
  const url = story.mediaUrl;
  const lower = (url || "").toLowerCase();
  const isVideo = lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".ogg") || story.mediaType === "video";
  const userName = story.user?.name || story.caption || "Story";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.95)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1200,
      }}
      onClick={onClose}
    >
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "var(--gold)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            color: "#000",
            fontSize: 14,
            overflow: "hidden",
          }}
        >
          {story.user?.avatarUrl ? (
            <img src={story.user.avatarUrl} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            userName[0]?.toUpperCase()
          )}
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "#fff", fontSize: 14 }}>{userName}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
            {story.createdAt ? new Date(story.createdAt).toLocaleString() : "Just now"}
          </div>
        </div>
      </div>

      {/* Media Content */}
      <div
        style={{
          maxWidth: "90vw",
          maxHeight: "80vh",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 0 40px rgba(230, 184, 0, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <video
            src={url}
            controls
            autoPlay
            playsInline
            style={{ width: "100%", height: "100%", maxHeight: "80vh", objectFit: "contain" }}
          />
        ) : (
          <img
            src={url}
            alt={story.caption || "Story"}
            style={{ width: "100%", height: "100%", maxHeight: "80vh", objectFit: "contain" }}
          />
        )}
      </div>

      {/* Caption */}
      {story.caption && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.7)",
            padding: "12px 24px",
            borderRadius: 999,
            color: "#fff",
            fontSize: 14,
            maxWidth: "80%",
            textAlign: "center",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {story.caption}
        </div>
      )}

      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          border: "none",
          color: "#fff",
          fontSize: 24,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ×
      </button>
    </div>
  );
}
