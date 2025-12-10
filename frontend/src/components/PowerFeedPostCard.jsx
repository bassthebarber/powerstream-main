// frontend/src/components/PowerFeedPostCard.jsx
// Production-ready post card with proper user data, media support, and share functionality
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function PostCard({ post, currentUserId, onReact, onComment }) {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
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

  const handleShareToLine = () => {
    // Share to PowerLine (chat)
    const postUrl = `${window.location.origin}/post/${post._id}`;
    navigate("/powerline", { state: { sharePost: { url: postUrl, text: post.text, postId: post._id } } });
    setShowShareMenu(false);
  };

  const handleShareToReel = () => {
    // Share to PowerReel
    if (post.mediaUrl && mediaType === "video") {
      navigate("/powerreel", { state: { mode: "create", prefillMedia: post.mediaUrl } });
    } else {
      navigate("/powerreel", { state: { mode: "create" } });
    }
    setShowShareMenu(false);
  };

  const handleShareToGram = () => {
    // Share to PowerGram
    if (post.mediaUrl) {
      navigate("/powergram", { state: { mode: "create", prefillMedia: post.mediaUrl, prefillCaption: post.text } });
    } else {
      navigate("/powergram");
    }
    setShowShareMenu(false);
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard?.writeText(postUrl);
    setShowShareMenu(false);
    // TODO: Show toast notification
  };

  return (
    <div className="ps-card pf-post-card">
      {/* Post Header */}
      <div className="pf-post-header">
        {author.avatarUrl ? (
          <img
            src={author.avatarUrl}
            alt={author.name}
            className="pf-post-avatar"
            onClick={() => author.id && navigate(`/profile/${author.id}`)}
            style={{ cursor: author.id ? "pointer" : "default" }}
          />
        ) : (
          <div 
            className="pf-post-avatar pf-post-avatar--initials"
            onClick={() => author.id && navigate(`/profile/${author.id}`)}
            style={{ cursor: author.id ? "pointer" : "default" }}
          >
            {initials}
          </div>
        )}
        <div className="pf-post-author">
          <div 
            className="pf-post-author-name"
            onClick={() => author.id && navigate(`/profile/${author.id}`)}
            style={{ cursor: author.id ? "pointer" : "default" }}
          >
            {author.name}
            {post.isVerified && (
              <span className="pf-verified-badge">✓</span>
            )}
          </div>
          <div className="pf-post-time">{timeAgo}</div>
        </div>
        <button className="pf-post-menu-btn">⋯</button>
      </div>

      {/* Post Content */}
      {post.text && (
        <p className="pf-post-text">{post.text}</p>
      )}

      {/* Post Media */}
      {post.mediaUrl && (
        <div className="pf-post-media">
          {mediaType === "video" ? (
            <video
              src={post.mediaUrl}
              controls
              playsInline
              className="pf-post-video"
              poster={post.thumbnailUrl}
            />
          ) : (
            <img
              src={post.mediaUrl}
              alt="Post media"
              loading="lazy"
              className="pf-post-image"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}
        </div>
      )}

      {/* Engagement Stats */}
      <div className="pf-post-stats">
        <span>
          {post.likes?.length || 0} {post.likes?.length === 1 ? "like" : "likes"}
        </span>
        <span>
          {post.comments?.length || 0} {post.comments?.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="pf-post-actions">
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
        <div className="pf-share-container">
          <ActionButton
            onClick={() => setShowShareMenu(!showShareMenu)}
            icon="↗️"
            label="Share"
          />
          {showShareMenu && (
            <div className="pf-share-menu">
              <button onClick={handleShareToLine} className="pf-share-item">
                <span>💬</span>
                <span>Share to PowerLine</span>
              </button>
              <button onClick={handleShareToReel} className="pf-share-item">
                <span>🎬</span>
                <span>Share to PowerReel</span>
              </button>
              <button onClick={handleShareToGram} className="pf-share-item">
                <span>📸</span>
                <span>Share to PowerGram</span>
              </button>
              <button onClick={handleCopyLink} className="pf-share-item">
                <span>🔗</span>
                <span>Copy Link</span>
              </button>
            </div>
          )}
        </div>
        <ActionButton
          icon="📌"
          label="Save"
          style={{ marginLeft: "auto" }}
        />
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="pf-post-comments">
          {/* Existing Comments */}
          {post.comments?.length > 0 && (
            <div className="pf-comments-list">
              {post.comments.slice(-5).map((comment, idx) => {
                const commentAuthor = getCommentAuthor(comment);
                return (
                  <div key={comment._id || idx} className="pf-comment">
                    {commentAuthor.avatarUrl ? (
                      <img
                        src={commentAuthor.avatarUrl}
                        alt={commentAuthor.name}
                        className="pf-comment-avatar"
                      />
                    ) : (
                      <div className="pf-comment-avatar pf-comment-avatar--initials">
                        {commentAuthor.name[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div className="pf-comment-content">
                      <span className="pf-comment-author">{commentAuthor.name}</span>
                      <span className="pf-comment-text">{comment.text}</span>
                    </div>
                  </div>
                );
              })}
              {post.comments.length > 5 && (
                <button className="pf-view-all-comments">
                  View all {post.comments.length} comments
                </button>
              )}
            </div>
          )}

          {/* Comment Input */}
          <div className="pf-comment-input-container">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="pf-comment-input"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSubmitComment();
                }
              }}
            />
            <button
              onClick={handleSubmitComment}
              disabled={!commentText.trim()}
              className={`pf-comment-submit ${commentText.trim() ? "pf-comment-submit--active" : ""}`}
            >
              Post
            </button>
          </div>
        </div>
      )}

      <style>{`
        .pf-post-card {
          margin-bottom: 0;
        }

        .pf-post-header {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .pf-post-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--gold);
          flex-shrink: 0;
        }

        .pf-post-avatar--initials {
          background: linear-gradient(135deg, var(--gold), #ffda5c);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #000;
          font-size: 16px;
        }

        .pf-post-author {
          flex: 1;
          min-width: 0;
        }

        .pf-post-author-name {
          font-weight: 600;
          font-size: 15px;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pf-verified-badge {
          color: var(--gold);
          font-size: 14px;
        }

        .pf-post-time {
          font-size: 12px;
          color: var(--muted);
        }

        .pf-post-menu-btn {
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          padding: 4px;
          font-size: 18px;
        }

        .pf-post-text {
          margin-bottom: 12px;
          white-space: pre-wrap;
          font-size: 15px;
          line-height: 1.5;
          color: #fff;
        }

        .pf-post-media {
          margin-bottom: 12px;
          border-radius: 12px;
          overflow: hidden;
          background: #0a0a0a;
        }

        .pf-post-video,
        .pf-post-image {
          width: 100%;
          max-height: 500px;
          object-fit: contain;
          display: block;
        }

        .pf-post-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-top: 1px solid rgba(255,255,255,0.08);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 8px;
          font-size: 13px;
          color: var(--muted);
        }

        .pf-post-actions {
          display: flex;
          gap: 8px;
        }

        .pf-share-container {
          position: relative;
        }

        .pf-share-menu {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 8px;
          background: #1a1a1f;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 8px;
          min-width: 180px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          z-index: 50;
        }

        .pf-share-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .pf-share-item:hover {
          background: rgba(255,255,255,0.08);
        }

        .pf-post-comments {
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .pf-comments-list {
          margin-bottom: 12px;
        }

        .pf-comment {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
          padding: 8px;
          background: rgba(255,255,255,0.03);
          border-radius: 10px;
        }

        .pf-comment-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }

        .pf-comment-avatar--initials {
          background: var(--gold);
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
        }

        .pf-comment-content {
          flex: 1;
          min-width: 0;
        }

        .pf-comment-author {
          font-weight: 600;
          font-size: 13px;
          margin-right: 6px;
        }

        .pf-comment-text {
          font-size: 13px;
          color: #ddd;
        }

        .pf-view-all-comments {
          background: none;
          border: none;
          color: var(--gold);
          font-size: 13px;
          cursor: pointer;
          padding: 4px 0;
        }

        .pf-comment-input-container {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .pf-comment-input {
          flex: 1;
          padding: 10px 14px;
          background: rgba(15, 15, 16, 0.9);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          color: #fff;
          font-size: 14px;
          outline: none;
        }

        .pf-comment-submit {
          padding: 10px 18px;
          background: rgba(255,255,255,0.1);
          color: var(--muted);
          border: none;
          border-radius: 999px;
          font-weight: 600;
          font-size: 13px;
          cursor: default;
          transition: all 0.2s ease;
        }

        .pf-comment-submit--active {
          background: var(--gold);
          color: #000;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function ActionButton({ onClick, active, icon, label, style }) {
  return (
    <button
      onClick={onClick}
      className={`pf-action-btn ${active ? "pf-action-btn--active" : ""}`}
      style={style}
    >
      <span>{icon}</span>
      <span className="pf-action-label">{label}</span>

      <style>{`
        .pf-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--muted);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .pf-action-btn:hover {
          background: rgba(255,255,255,0.05);
        }

        .pf-action-btn--active {
          background: rgba(230, 184, 0, 0.15);
          color: var(--gold);
        }

        @media (max-width: 600px) {
          .pf-action-label {
            display: none;
          }
        }
      `}</style>
    </button>
  );
}
