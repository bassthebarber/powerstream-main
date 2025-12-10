import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  likeFeedPost,
  fetchFeedComments,
  createFeedComment,
} from "../lib/api.js";
import CommentsList from "./CommentsList.jsx";
import CommentForm from "./CommentForm.jsx";
import TipButton from "./TipButton.jsx";
import "../styles/theme.css";

export default function PostCard({ post }) {
  const createdAt = post.createdAt ? new Date(post.createdAt) : null;
  const { user } = useAuth();
  const userId = user?.id;

  const [likesCount, setLikesCount] = useState(
    Array.isArray(post.likes) ? post.likes.length : 0
  );
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  useEffect(() => {
    if (userId && Array.isArray(post.likes)) {
      setLiked(post.likes.some((id) => String(id) === String(userId)));
    } else {
      setLiked(false);
    }
  }, [userId, post.likes]);

  const handleToggleLike = async () => {
    if (!post._id && !post.id) return;
    if (!userId) return; // must be logged in

    try {
      const res = await likeFeedPost(post._id || post.id);
      if (res?.ok) {
        setLiked(!!res.liked);
        if (typeof res.likesCount === "number") {
          setLikesCount(res.likesCount);
        }
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleToggleComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0 && (post._id || post.id)) {
      try {
        setCommentsLoading(true);
        const res = await fetchFeedComments(post._id || post.id);
        if (Array.isArray(res?.comments)) {
          setComments(res.comments);
        }
      } catch (err) {
        console.error("Error loading comments:", err);
      } finally {
        setCommentsLoading(false);
      }
    }
  };

  const handleAddComment = async (text) => {
    if (!userId || !text.trim() || (!post._id && !post.id)) return;
    try {
      const res = await createFeedComment(post._id || post.id, { text });
      if (res?.ok && res.comment) {
        setComments((prev) => [...prev, res.comment]);
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  return (
    <div className="ps-card" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "var(--ps-gold)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            color: "#000",
          }}
        >
          {post.authorName?.[0]?.toUpperCase() || "G"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{post.authorName || "Guest"}</div>
          {createdAt && (
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {createdAt.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {post.content && (
        <p style={{ marginBottom: 8, whiteSpace: "pre-wrap" }}>{post.content}</p>
      )}

      {/* Media (image or video) */}
      {renderMedia(post)}

      {/* Actions */}
      <div
        style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={handleToggleLike}
            style={{
              border: "none",
              background: "transparent",
              color: liked ? "var(--ps-gold)" : "var(--ps-text-muted)",
              cursor: userId ? "pointer" : "default",
              fontWeight: liked ? 600 : 500,
            }}
          >
            {liked ? "♥ Liked" : "♡ Like"}
          </button>
          <button
            type="button"
            onClick={handleToggleComments}
            style={{
              border: "none",
              background: "transparent",
              color: "var(--ps-text-muted)",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            💬 Comment
          </button>
          {userId && (post._id || post.id) && (
            <TipButton
              postId={post._id || post.id}
              postAuthorName={post.authorName}
              onSuccess={() => {
                // Optionally refresh post data or show success message
              }}
            />
          )}
        </div>
        <div style={{ fontSize: 11, opacity: 0.8 }}>
          {likesCount > 0 ? `${likesCount} like${likesCount === 1 ? "" : "s"}` : "0 likes"}
        </div>
      </div>

      {showComments && (
        <div style={{ marginTop: 6 }}>
          <CommentsList comments={comments} loading={commentsLoading} />
          {user && <CommentForm onSubmit={handleAddComment} />}
        </div>
      )}
    </div>
  );
}

function renderMedia(post) {
  const url = post.mediaUrl || post.image;
  if (!url) return null;

  const lower = url.toLowerCase();
  const isVideo =
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".ogg") ||
    lower.includes("youtube.com") ||
    lower.includes("vimeo.com");

  if (isVideo) {
    return (
      <video
        src={url}
        controls
        style={{
          width: "100%",
          borderRadius: 8,
          marginTop: 4,
          maxHeight: 400,
          objectFit: "cover",
          background: "#000",
        }}
      />
    );
  }

  return (
    <img
      src={url}
      alt="Post"
      style={{
        width: "100%",
        borderRadius: 8,
        marginTop: 4,
        maxHeight: 400,
        objectFit: "cover",
      }}
    />
  );
}
