// frontend/src/components/GramModal.jsx
// Instagram-style photo modal/lightbox
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../lib/api.js";

const gold = "#ffb84d";

export default function GramModal({ gram, onClose, onUpdate, onLike }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const [likesCount, setLikesCount] = useState(
    Array.isArray(gram.likes) ? gram.likes.length : 0
  );
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState(gram.comments || []);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Get author info
  const author = useMemo(() => {
    if (gram.user && typeof gram.user === "object") {
      return {
        id: gram.user._id || gram.user.id,
        name: gram.user.name || gram.user.displayName || gram.user.email?.split("@")[0] || "User",
        avatarUrl: gram.user.avatarUrl || gram.user.avatar,
      };
    }
    return {
      id: gram.userId || gram.authorId,
      name: gram.username || gram.authorName || "User",
      avatarUrl: gram.avatarUrl || gram.authorAvatarUrl,
    };
  }, [gram]);

  // Navigate to profile
  const goToProfile = () => {
    if (author.id) {
      onClose();
      navigate(`/profile/${author.id}`);
    }
  };

  const authorInitials = useMemo(() => {
    return author.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";
  }, [author.name]);

  // Format timestamp
  const timeAgo = useMemo(() => {
    if (!gram.createdAt) return "";
    const date = new Date(gram.createdAt);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  }, [gram.createdAt]);

  useEffect(() => {
    if (userId && Array.isArray(gram.likes)) {
      setLiked(gram.likes.some((id) => String(id) === String(userId)));
    }
  }, [userId, gram.likes]);

  useEffect(() => {
    // Close on escape key
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleToggleLike = async () => {
    if (!gram._id && !gram.id) return;
    if (!userId) return;

    // Use external onLike if provided
    if (onLike) {
      onLike();
      setLiked(!liked);
      setLikesCount(prev => liked ? prev - 1 : prev + 1);
      return;
    }

    try {
      const res = await api.post(`/powergram/${gram._id || gram.id}/like`);
      if (res.data?.ok) {
        setLiked(!!res.data.liked);
        if (typeof res.data.likesCount === "number") {
          setLikesCount(res.data.likesCount);
        } else {
          setLikesCount(prev => liked ? prev - 1 : prev + 1);
        }
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !userId) return;
    
    setSubmitting(true);
    try {
      const res = await api.post(`/gram/${gram._id || gram.id}/comments`, { 
        text: commentText.trim() 
      });
      if (res.data?.ok && res.data.comment) {
        setComments(prev => [...prev, res.data.comment]);
      } else if (res.data?.comments) {
        setComments(res.data.comments);
      }
      setCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="gm-backdrop" onClick={onClose}>
      <div className="gm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="gm-close" onClick={onClose}>×</button>
        
        {/* Image Section */}
        <div className="gm-image-section">
          <img
            src={gram.imageUrl || gram.mediaUrl}
            alt={gram.caption || "Photo"}
            className="gm-image"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>

        {/* Details Section */}
        <div className="gm-details">
          {/* Header with author */}
          <div className="gm-header">
            <div className="gm-author" onClick={goToProfile} style={{ cursor: author.id ? "pointer" : "default" }}>
              {author.avatarUrl ? (
                <img src={author.avatarUrl} alt={author.name} className="gm-avatar" />
              ) : (
                <div className="gm-avatar gm-avatar--initials">{authorInitials}</div>
              )}
              <div className="gm-author-info">
                <span className="gm-author-name">{author.name}</span>
                {gram.location && (
                  <span className="gm-location">{gram.location}</span>
                )}
              </div>
            </div>
            <span className="gm-time">{timeAgo}</span>
          </div>

          {/* Caption */}
          {gram.caption && (
            <div className="gm-caption">
              <span className="gm-caption-author">{author.name}</span>
              <span className="gm-caption-text">{gram.caption}</span>
            </div>
          )}

          {/* Comments */}
          <div className="gm-comments">
            {comments.length === 0 ? (
              <div className="gm-no-comments">No comments yet</div>
            ) : (
              comments.map((comment, idx) => {
                const commentAuthor = comment.user?.name || comment.username || "User";
                return (
                  <div key={comment._id || idx} className="gm-comment">
                    <span className="gm-comment-author">{commentAuthor}</span>
                    <span className="gm-comment-text">{comment.text}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Actions */}
          <div className="gm-actions">
            <div className="gm-action-buttons">
              <button 
                className={`gm-action-btn ${liked ? "gm-action-btn--active" : ""}`}
                onClick={handleToggleLike}
                disabled={!userId}
              >
                {liked ? "❤️" : "🤍"}
              </button>
              <button className="gm-action-btn">💬</button>
              <button className="gm-action-btn">↗️</button>
              <button className="gm-action-btn gm-action-btn--right">🔖</button>
            </div>
            <div className="gm-likes-count">
              {likesCount} {likesCount === 1 ? "like" : "likes"}
            </div>
          </div>

          {/* Comment Input */}
          {userId && (
            <div className="gm-comment-input">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                onKeyPress={(e) => e.key === "Enter" && handleSubmitComment()}
              />
              <button 
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || submitting}
              >
                {submitting ? "..." : "Post"}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .gm-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          z-index: 1100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .gm-modal {
          display: flex;
          max-width: 1000px;
          max-height: 90vh;
          width: 100%;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
        
        .gm-close {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #fff;
          font-size: 24px;
          cursor: pointer;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        
        .gm-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .gm-image-section {
          flex: 1;
          min-width: 0;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .gm-image {
          width: 100%;
          height: 100%;
          max-height: 90vh;
          object-fit: contain;
        }
        
        .gm-details {
          width: 340px;
          flex-shrink: 0;
          background: #111;
          display: flex;
          flex-direction: column;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .gm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .gm-author {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .gm-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .gm-avatar--initials {
          background: linear-gradient(135deg, ${gold}, #e6a000);
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
        }
        
        .gm-author-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .gm-author-name {
          font-weight: 600;
          font-size: 14px;
          color: #fff;
        }
        
        .gm-location {
          font-size: 12px;
          color: #888;
        }
        
        .gm-time {
          font-size: 12px;
          color: #888;
        }
        
        .gm-caption {
          padding: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 14px;
          line-height: 1.5;
        }
        
        .gm-caption-author {
          font-weight: 600;
          color: #fff;
          margin-right: 6px;
        }
        
        .gm-caption-text {
          color: #ddd;
        }
        
        .gm-comments {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .gm-no-comments {
          color: #666;
          font-size: 14px;
          text-align: center;
          padding: 20px;
        }
        
        .gm-comment {
          font-size: 14px;
          line-height: 1.4;
        }
        
        .gm-comment-author {
          font-weight: 600;
          color: #fff;
          margin-right: 6px;
        }
        
        .gm-comment-text {
          color: #ddd;
        }
        
        .gm-actions {
          padding: 12px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .gm-action-buttons {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }
        
        .gm-action-btn {
          background: none;
          border: none;
          font-size: 22px;
          cursor: pointer;
          padding: 4px;
          transition: transform 0.15s;
        }
        
        .gm-action-btn:hover {
          transform: scale(1.1);
        }
        
        .gm-action-btn--active {
          animation: gm-like-pop 0.3s ease;
        }
        
        .gm-action-btn--right {
          margin-left: auto;
        }
        
        .gm-action-btn:disabled {
          opacity: 0.5;
          cursor: default;
        }
        
        @keyframes gm-like-pop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        
        .gm-likes-count {
          font-weight: 600;
          font-size: 14px;
          color: #fff;
        }
        
        .gm-comment-input {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          gap: 10px;
        }
        
        .gm-comment-input input {
          flex: 1;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 14px;
          outline: none;
        }
        
        .gm-comment-input input::placeholder {
          color: #666;
        }
        
        .gm-comment-input button {
          background: none;
          border: none;
          color: ${gold};
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 0.2s;
        }
        
        .gm-comment-input button:not(:disabled) {
          opacity: 1;
        }
        
        .gm-comment-input button:disabled {
          cursor: default;
        }
        
        @media (max-width: 768px) {
          .gm-modal {
            flex-direction: column;
            max-height: 95vh;
          }
          
          .gm-details {
            width: 100%;
            max-height: 45vh;
            border-left: none;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .gm-image-section {
            max-height: 50vh;
          }
          
          .gm-comments {
            max-height: 150px;
          }
        }
      `}</style>
    </div>
  );
}
