import React, { useState } from "react";
import css from "../../styles/Feed.module.css";
import { createFeedPost } from "../../services/feed";

export default function PostForm({ onCreated }) {
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("text");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const post = await createFeedPost({
        authorName: author || "PowerStream",
        content: text,
        mediaUrl: mediaUrl || null,
        mediaType: mediaUrl ? mediaType : "text",
      });
      setText("");
      setMediaUrl("");
      setMediaType("text");
      if (onCreated) onCreated(post);
    } catch (err) {
      console.error(err);
      alert("Couldn't create post");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={css.composer} onSubmit={submit}>
      <div className={css.composerTop}>
        <input
          className={css.author}
          placeholder="Your name (optional)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <textarea
          className={css.input}
          rows={3}
          placeholder="What's happening?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          className={css.input}
          placeholder="Media URL (optional)"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
        />
        <div className={css.actions}>
          <select
            className={css.input}
            style={{ maxWidth: 160 }}
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value)}
            disabled={!mediaUrl}
          >
            <option value="text">Text only</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
          <button className={css.btn} disabled={busy}>
            {busy ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </form>
  );
}


