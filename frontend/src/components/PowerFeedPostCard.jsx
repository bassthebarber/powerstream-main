// frontend/src/components/PowerFeedPostCard.jsx
// Production-ready post card with proper user data and media support
import React, { useState, useMemo } from "react";

export default function PostCard({ post, currentUserId, onReact, onComment }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  
  // Check if current user has liked this post
  const liked = useMemo(() => {
    if (!currentUserId || !post.likes) return false;
    return post.likes.some(id => 
      String(id) === String(currentUserId) || 
      id?.toString() === currentUserId
    );
  }, [post.likes, currentUserId]);

  // Get author info - prefer populated user object, fallback to direct fields
  const author = useMemo(() => {
    // If post has a populated user object
    if (post.user && typeof post.user === "object") {
      return {
        name: post.user.name || post.user.displayName || post.user.email?.split("@")[0] || "User",
        avatarUrl: post.user.avatarUrl || post.user.avatar || null,
        id: post.user._id || post.user.id,
      };
    }
    // Fallback to direct fields on post
    return {
      name: post.authorName || post.username || post.displayName || "User",
      avatarUrl: post.authorAvatarUrl || post.avatarUrl || null,
      id: post.userId || post.authorId,
    };
  }, [post]);

  // Get initials from name
  const initials = useMemo(() => {
    const name = author.name;
    if (!name || name === "User") return "U";
    const parts = name.split(" ");
    const first = parts[0]?.[0] || "";
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase() || name[0]?.toUpperCase() || "U";
  }, [author.name]);

  // Format timestamp
  const timeAgo = useMemo(() => {
    if (!post.createdAt) return "";
    const date = new Date(post.createdAt);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }, [post.createdAt]);

  // Determine media type
  const mediaType = useMemo(() => {
    if (post.mediaType) return post.mediaType;
    if (!post.mediaUrl) return "none";
    const url = post.mediaUrl.toLowerCase();
    if (url.includes(".mp4") || url.includes(".webm") || url.includes(".mov") || url.includes("video")) {
      return "video";
    }
    return "image";
  }, [post.mediaUrl, post.mediaType]);

  // Get comment author info
  const getCommentAuthor = (comment) => {
    if (comment.user && typeof comment.user === "object") {
      return {
        name: comment.user.name || comment.user.email?.split("@")[0] || "User",
        avatarUrl: comment.user.avatarUrl || null,
      };
    }
    return {
      name: comment.authorName || comment.username || "User",
      avatarUrl: comment.authorAvatarUrl || null,
    };
  };

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onComment(commentText);
      setCommentText("");
    }
  };

  return (
    <div className="ps-card" style={{ marginBottom: 0 }}>
      {/* Post Header */}
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        {author.avatarUrl ? (
          <img
            src={author.avatarUrl}
            alt={author.name}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid var(--gold)",
            }}
          />
        ) : (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--gold), #ffda5c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              color: "#000",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            fontWeight: 600, 
            fontSize: 15,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            {author.name}
            {post.isVerified && (
              <span style={{ color: "var(--gold)", fontSize: 14 }}>✓</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            {timeAgo}
          </div>
        </div>
        <button
          style={{
            background: "none",
            border: "none",
            color: "var(--muted)",
            cursor: "pointer",
            padding: 4,
            fontSize: 18,
          }}
        >
          ⋯
        </button>
      </div>

      {/* Post Content */}
      {post.text && (
        <p style={{ 
          marginBottom: 12, 
          whiteSpace: "pre-wrap",
          fontSize: 15,
          lineHeight: 1.5,
          color: "#fff",
        }}>
          {post.text}
        </p>
      )}

      {/* Post Media */}
      {post.mediaUrl && (
        <div style={{
          marginBottom: 12,
          borderRadius: 12,
          overflow: "hidden",
          background: "#0a0a0a",
        }}>
          {mediaType === "video" ? (
            <video
              src={post.mediaUrl}
              controls
              playsInline
              style={{
                width: "100%",
                maxHeight: 500,
                objectFit: "contain",
                display: "block",
              }}
              poster={post.thumbnailUrl}
            />
          ) : (
            <img
              src={post.mediaUrl}
              alt="Post media"
              loading="lazy"
              style={{
                width: "100%",
                maxHeight: 500,
                objectFit: "contain",
                display: "block",
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}
        </div>
      )}

      {/* Engagement Stats */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        marginBottom: 8,
        fontSize: 13,
        color: "var(--muted)",
      }}>
        <span>
          {post.likes?.length || 0} {post.likes?.length === 1 ? "like" : "likes"}
        </span>
        <span>
          {post.comments?.length || 0} {post.comments?.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: "flex", 
        gap: 8,
        marginBottom: showComments ? 12 : 0,
      }}>
        <ActionButton
          onClick={onReact}
          active={liked}
          icon={liked ? "❤️" : "🤍"}
          label="Like"
        />
        <ActionButton
          onClick={() => setShowComments(!showComments)}
          icon="💬"
          label="Comment"
        />
        <ActionButton
          icon="↗️"
          label="Share"
        />
        <ActionButton
          icon="📌"
          label="Save"
          style={{ marginLeft: "auto" }}
        />
      </div>

      {/* Comments Section */}
      {showComments && (
        <div style={{ 
          paddingTop: 12, 
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}>
          {/* Existing Comments */}
          {post.comments?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              {post.comments.slice(-5).map((comment, idx) => {
                const commentAuthor = getCommentAuthor(comment);
                return (
                  <div 
                    key={comment._id || idx} 
                    style={{ 
                      display: "flex",
                      gap: 10,
                      marginBottom: 10,
                      padding: 8,
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 10,
                    }}
                  >
                    {commentAuthor.avatarUrl ? (
                      <img
                        src={commentAuthor.avatarUrl}
                        alt={commentAuthor.name}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "var(--gold)",
                        color: "#000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}>
                        {commentAuthor.name[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ 
                        fontWeight: 600, 
                        fontSize: 13,
                        marginRight: 6,
                      }}>
                        {commentAuthor.name}
                      </span>
                      <span style={{ fontSize: 13, color: "#ddd" }}>
                        {comment.text}
                      </span>
                    </div>
                  </div>
                );
              })}
              {post.comments.length > 5 && (
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--gold)",
                    fontSize: 13,
                    cursor: "pointer",
                    padding: "4px 0",
                  }}
                >
                  View all {post.comments.length} comments
                </button>
              )}
            </div>
          )}

          {/* Comment Input */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              style={{
                flex: 1,
                padding: "10px 14px",
                background: "rgba(15, 15, 16, 0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 999,
                color: "#fff",
                fontSize: 14,
                outline: "none",
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSubmitComment();
                }
              }}
            />
            <button
              onClick={handleSubmitComment}
              disabled={!commentText.trim()}
              style={{
                padding: "10px 18px",
                background: commentText.trim() ? "var(--gold)" : "rgba(255,255,255,0.1)",
                color: commentText.trim() ? "#000" : "var(--muted)",
                border: "none",
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 13,
                cursor: commentText.trim() ? "pointer" : "default",
                transition: "all 0.2s ease",
              }}
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({ onClick, active, icon, label, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 16px",
        background: active ? "rgba(230, 184, 0, 0.15)" : "transparent",
        border: "none",
        borderRadius: 8,
        color: active ? "var(--gold)" : "var(--muted)",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
        transition: "all 0.2s ease",
        ...style,
      }}
    >
      <span>{icon}</span>
      <span className="pf-action-label">{label}</span>
    </button>
  );
}
