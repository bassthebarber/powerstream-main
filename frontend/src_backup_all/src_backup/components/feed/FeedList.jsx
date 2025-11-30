import React, { useEffect, useState } from "react";
import css from "../../styles/Feed.module.css";
import { fetchFeedPosts } from "../../services/feed";

function PostCard({ post }) {
  return (
    <article className={css.card}>
      <header className={css.cardHead}>
        <strong>{post.author_name || "PowerStream"}</strong>
        <time>{new Date(post.created_at).toLocaleString()}</time>
      </header>

      {post.media_type !== "text" && post.media_url && (
        <div className={css.mediaWrap}>
          {post.media_type === "image" ? (
            <img src={post.media_url} alt="" />
          ) : (
            <video src={post.media_url} controls playsInline />
          )}
        </div>
      )}

      {post.content && <p className={css.body}>{post.content}</p>}
    </article>
  );
}

export default function FeedList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const rows = await fetchFeedPosts(25);
        setPosts(rows);
      } catch (e) {
        console.error("Couldn't load feed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className={css.loading}>Loading feed…</div>;
  if (!posts.length) return <div className={css.empty}>Be the first to post.</div>;

  return (
    <section className={css.list}>
      {posts.map(p => <PostCard key={p.id} post={p} />)}
    </section>
  );
}


