import React, { useState } from "react";

export default function CommentForm({ onSubmit }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginTop: 8,
        display: "flex",
        gap: 6,
        alignItems: "center",
      }}
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment…"
        style={{
          flex: 1,
          padding: "6px 10px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "#050505",
          color: "#fff",
          fontSize: 12,
        }}
      />
      <button
        type="submit"
        disabled={submitting || !text.trim()}
        style={{
          padding: "6px 12px",
          borderRadius: 999,
          border: "none",
          background: submitting || !text.trim() ? "#4b5563" : "#ffb84d",
          color: "#000",
          fontSize: 12,
          fontWeight: 600,
          cursor: submitting || !text.trim() ? "default" : "pointer",
        }}
      >
        Post
      </button>
    </form>
  );
}






