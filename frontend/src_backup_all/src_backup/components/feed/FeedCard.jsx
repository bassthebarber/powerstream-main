import React from "react";

export default function FeedCard({ title = "Post", text = "What's going on in your world?", media = false }) {
  return (
    <article className="feed-card">
      <div style={{ fontWeight: 800, color: "var(--gold)", marginBottom: 8 }}>{title}</div>

      {media && (
        <div className="tile thumb" style={{ height: 220, marginBottom: 12 }}>
          media / image
        </div>
      )}

      <p style={{ margin: 0 }}>{text}</p>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button className="gold-btn">Like</button>
        <button className="gold-btn">Comment</button>
        <button className="gold-btn">Share</button>
      </div>
    </article>
  );
}


