// frontend/src/components/powerreel/ReelSidebar.jsx
// TikTok-style sidebar with action buttons
import React, { useMemo } from "react";

export default function ReelSidebar({ reel, onLike, onComment, onShare, userId }) {
  const isLiked = userId && (
    reel.likes?.includes(userId) || 
    reel.likes?.some(id => String(id) === userId)
  );

  // Get author info
  const author = useMemo(() => {
    if (reel?.user && typeof reel.user === "object") {
      return {
        name: reel.user.name || reel.user.displayName || "User",
        avatarUrl: reel.user.avatarUrl || reel.user.avatar,
      };
    }
    return {
      name: reel?.authorName || reel?.username || "User",
      avatarUrl: reel?.avatarUrl || reel?.authorAvatarUrl,
    };
  }, [reel]);

  const initials = author.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";

  return (
    <div className="pr-sidebar">
      {/* Author avatar */}
      <div className="pr-sidebar-avatar">
        {author.avatarUrl ? (
          <img src={author.avatarUrl} alt={author.name} />
        ) : (
          <span>{initials}</span>
        )}
        <div className="pr-follow-badge">+</div>
      </div>

      {/* Like */}
      <button 
        className={`pr-sidebar-btn ${isLiked ? "pr-sidebar-btn--active" : ""}`}
        onClick={(e) => { e.stopPropagation(); onLike?.(); }}
      >
        <span className="pr-sidebar-icon">{isLiked ? "❤️" : "🤍"}</span>
        <span className="pr-sidebar-count">{reel.likes?.length || 0}</span>
      </button>

      {/* Comments */}
      <button 
        className="pr-sidebar-btn"
        onClick={(e) => { e.stopPropagation(); onComment?.(); }}
      >
        <span className="pr-sidebar-icon">💬</span>
        <span className="pr-sidebar-count">{reel.comments?.length || 0}</span>
      </button>

      {/* Share */}
      <button 
        className="pr-sidebar-btn"
        onClick={(e) => { e.stopPropagation(); onShare?.(); }}
      >
        <span className="pr-sidebar-icon">↗️</span>
        <span className="pr-sidebar-count">Share</span>
      </button>

      {/* Save */}
      <button className="pr-sidebar-btn">
        <span className="pr-sidebar-icon">🔖</span>
      </button>
    </div>
  );
}
