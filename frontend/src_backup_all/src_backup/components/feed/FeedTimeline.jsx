import React, { useEffect, useState } from "react";
import styles from "../../styles/Feed.module.css";

export default function FeedTimeline() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch("http://127.0.0.1:5001/api/feed?limit=50")
      .then(r => r.json())
      .then(d => setItems(Array.isArray(d) ? d : []))
      .catch(err => console.error("Feed load error:", err))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  function refresh() { setRefreshKey(k => k + 1); }

  return (
    <div className={styles.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className={styles.sectionTitle}>PowerFeed Timeline</div>
        <button className={styles.btn} onClick={refresh}>Refresh</button>
      </div>

      {loading && <div>Loading…</div>}

      {!loading && items.length === 0 && (
        <div style={{ color: "#aaa" }}>No posts yet.</div>
      )}

      {!loading && items.map(post => (
        <article className={styles.post} key={post.id}>
          <div className={styles.meta}>
            #{post.id} • {new Date(post.created_at || Date.now()).toLocaleString()}
          </div>
          {post.content && <div>{post.content}</div>}
          {post.media_url?.match(/\.mp4(\?.*)?$/i) ? (
            <video className={styles.media} src={post.media_url} controls />
          ) : post.media_url ? (
            <img className={styles.media} src={post.media_url} alt="" />
          ) : null}
        </article>
      ))}
    </div>
  );
}


