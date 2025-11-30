// src/components/PowerGram/PowerGram.jsx
import React, { useEffect, useState, useRef } from "react";
import styles from "../../styles/powergram.module.css";
import {
  listGramPosts,
  createGramPost,
  addGramComment,
  toggleGramLike,
  getUserId,
} from "../../services/gramApi";
import { uploadPhoto, listGram } from "../services/gram";
// on mount: const rows = await listGram();
// on submit: await uploadPhoto({ file, caption });

export default function PowerGram() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [text, setText] = useState("");
  const fileRef = useRef(null);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    (async () => {
      setUid(await getUserId());
      await refresh();
    })();
  }, []);

  async function refresh() {
    setLoading(true);
    const rows = await listGramPosts({});
    setPosts(rows);
    setLoading(false);
  }

  async function onPost() {
    if (!uid) { alert("Sign in first."); return; }
    if (!text.trim() && !fileRef.current?.files?.length) { return; }
    setPosting(true);
    const file = fileRef.current?.files?.[0] || null;
    await createGramPost({ userId: uid, text, media: file });
    setText("");
    if (fileRef.current) fileRef.current.value = "";
    setPosting(false);
    await refresh();
  }

  async function onLike(id) {
    if (!uid) { alert("Sign in first."); return; }
    await toggleGramLike({ postId: id, userId: uid });
    await refresh();
  }

  async function onComment(id) {
    if (!uid) { alert("Sign in first."); return; }
    const t = prompt("Add a comment:");
    if (!t) return;
    await addGramComment({ postId: id, userId: uid, text: t });
    await refresh();
  }

  return (
    <div className="page">
      <h1>PowerGram</h1>

      <div className={styles.composer}>
        <textarea
          className={styles.input}
          placeholder="Say something…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className={styles.row}>
          <input type="file" ref={fileRef} accept="image/*,video/*" />
          <button className="btn" disabled={posting} onClick={onPost}>
            {posting ? "Posting…" : "Post"}
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ opacity: 0.7 }}>Loading…</p>
      ) : posts.length === 0 ? (
        <p>No posts yet. Be the first to share.</p>
      ) : (
        <div className={styles.grid}>
          {posts.map((post) => (
            <div key={post.id} className={styles.card}>
              {post.media_url ? (
                post.media_type === "video" ? (
                  <video className={styles.media} src={post.media_url} controls />
                ) : (
                  <img className={styles.media} src={post.media_url} alt="" />
                )
              ) : null}
              <div className={styles.body}>
                <div className={styles.meta}>
                  <span>{new Date(post.created_at).toLocaleString()}</span>
                </div>
                <p>{post.text}</p>
                <div className={styles.actions}>
                  <button className="btn ghost" onClick={() => onLike(post.id)}>
                    ❤️ {post.like_count}
                  </button>
                  <button className="btn ghost" onClick={() => onComment(post.id)}>
                    💬 {post.comment_count}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


