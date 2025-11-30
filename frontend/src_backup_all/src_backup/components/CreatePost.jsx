import React, { useState } from "react";
import styles from "../../styles/Feed.module.css";

export default function CreatePost({ onPosted }) {
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!content && !mediaUrl) return;
    setBusy(true);
    try {
      const res = await fetch("http://127.0.0.1:5001/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, media_url: mediaUrl })
      });
      if (!res.ok) throw new Error(await res.text());
      setContent(""); setMediaUrl("");
      onPosted && onPosted();
    } catch (err) {
      console.error("CreatePost error", err);
      alert("Post failed: " + err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.sectionTitle}>What’s on your mind?</div>
      <form onSubmit={submit}>
        <textarea
          className={styles.text}
          placeholder="Say something to your PowerFeed…"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginTop: 10 }}>
          <input
            className={styles.input}
            placeholder="Media URL (jpg, png, mp4 …)"
            value={mediaUrl}
            onChange={e => setMediaUrl(e.target.value)}
          />
          <button className={styles.btn} disabled={busy}>{busy ? "Posting…" : "Post"}</button>
        </div>
      </form>
    </div>
  );
}


