import React from "react";

const gold = "#ffb84d";

export default function CommentsList({ comments, loading }) {
  if (loading) {
    return (
      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
        Loading comments…
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
        No comments yet. Be the first to comment.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
      {comments.map((c, idx) => {
        const createdAt = c.createdAt ? new Date(c.createdAt) : null;
        return (
          <div
            key={c.id || c._id || idx}
            style={{
              padding: "6px 10px",
              borderRadius: 10,
              background: "rgba(15,15,15,0.9)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: gold }}>
              {c.authorName || "User"}
            </div>
            <div style={{ fontSize: 12, color: "#e5e5e5" }}>{c.text}</div>
            {createdAt && (
              <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>
                {createdAt.toLocaleString()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}






