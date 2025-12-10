import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  likeReelPost,
  fetchReelComments,
  createReelComment,
} from "../lib/api.js";
import CommentsList from "./CommentsList.jsx";
import CommentForm from "./CommentForm.jsx";

const gold = "#ffb84d";

export default function ReelCard({ reel, autoPlay = true }) {
  if (!reel) return null;

  const { user } = useAuth();
  const userId = user?.id;
  const createdAt = reel.createdAt ? new Date(reel.createdAt) : null;

  const [likesCount, setLikesCount] = useState(
    Array.isArray(reel.likes) ? reel.likes.length : 0
  );
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  useEffect(() => {
    if (userId && Array.isArray(reel.likes)) {
      setLiked(reel.likes.some((id) => String(id) === String(userId)));
    } else {
      setLiked(false);
    }
  }, [userId, reel.likes]);

  useEffect(() => {
    setLikesCount(Array.isArray(reel.likes) ? reel.likes.length : 0);
  }, [reel.likes]);

  const handleToggleLike = async () => {
    if (!reel._id && !reel.id) return;
    if (!userId) return;

    try {
      const res = await likeReelPost(reel._id || reel.id);
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
    if (next && comments.length === 0 && (reel._id || reel.id)) {
      try {
        setCommentsLoading(true);
        const res = await fetchReelComments(reel._id || reel.id);
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
    if (!userId || !text.trim() || (!reel._id && !reel.id)) return;
    try {
      const res = await createReelComment(reel._id || reel.id, { text });
      if (res?.ok && Array.isArray(res.comments)) {
        setComments(res.comments);
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  return (
    <>
      <section
        style={{
          position: "relative",
          height: "100vh",
          maxHeight: "900px",
          scrollSnapAlign: "center",
          overflow: "hidden",
          borderRadius: 24,
          marginBottom: 16,
          background: "#000",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <video
          src={reel.videoUrl}
          controls
          muted
          loop
          autoPlay={autoPlay}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: 16,
            background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
            color: "#fff",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                {reel.username || "Guest"}
              </div>
              {createdAt && (
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {createdAt.toLocaleString()}
                </div>
              )}
            </div>
          </div>
          {reel.caption && (
            <div style={{ fontSize: 14, marginTop: 8 }}>{reel.caption}</div>
          )}
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 12,
              alignItems: "center",
            }}
          >
            <button
              onClick={handleToggleLike}
              disabled={!userId}
              style={{
                background: "none",
                border: "none",
                color: liked ? gold : "#fff",
                cursor: userId ? "pointer" : "default",
                fontSize: 16,
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{liked ? "❤️" : "🤍"}</span>
              <span style={{ fontSize: 13 }}>{likesCount}</span>
            </button>
            <button
              onClick={handleToggleComments}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: 16,
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>💬</span>
              <span style={{ fontSize: 13 }}>
                {comments.length > 0 ? comments.length : reel.comments?.length || 0}
              </span>
            </button>
            <span style={{ fontSize: 13, opacity: 0.8 }}>
              🔁 Share
            </span>
          </div>
        </div>
      </section>

      {/* Comments Bottom Sheet */}
      {showComments && (
        <div
          onClick={handleToggleComments}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 1000,
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxHeight: "70vh",
              background: "#111",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              flexDirection: "column",
              padding: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3 style={{ margin: 0, color: gold, fontSize: 18 }}>Comments</h3>
              <button
                onClick={handleToggleComments}
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
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                marginBottom: 16,
                minHeight: 200,
              }}
            >
              <CommentsList comments={comments} loading={commentsLoading} />
            </div>
            {userId && <CommentForm onSubmit={handleAddComment} />}
          </div>
        </div>
      )}
    </>
  );
}



