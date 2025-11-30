import React, { useEffect, useMemo, useState } from "react";
import * as Gram from "../../services/gramApi";
import * as Reel from "../../services/reel";

function ActionRow({ onLike, onCommentClick, liked, likeCount, commentCount, onShare }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 2px" }}>
      <button onClick={onLike} aria-label="Like" title="Like" style={{ fontSize: 20 }}>
        {liked ? "❤️" : "🤍"}
      </button>
      <button onClick={onCommentClick} aria-label="Comment" title="Comment" style={{ fontSize: 20 }}>
        💬
      </button>
      <button onClick={onShare} aria-label="Share" title="Share" style={{ fontSize: 20 }}>
        ↗
      </button>
      <span style={{ marginLeft: 8, opacity: .8, fontSize: 14 }}>
        {likeCount} likes • {commentCount} comments
      </span>
    </div>
  );
}

function Avatar({ url }) {
  const fallback = "/img/avatar-placeholder.png";
  return (
    <img
      src={url || fallback}
      alt=""
      style={{
        width: 36, height: 36, borderRadius: "50%",
        objectFit: "cover", border: "1px solid rgba(255,179,77,.35)"
      }}
    />
  );
}

export default function PowerGramGallery() {
  const [feed, setFeed] = useState([]);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [suggested, setSuggested] = useState([]);

  async function refresh() {
    const rows = await Gram.listPhotos({ limit: 24 });
    setFeed(rows);
    // suggested reels row (like Instagram "Suggested")
    const reels = await Reel.listVideos({ limit: 10 });
    setSuggested(reels);
  }

  useEffect(() => { refresh().catch(console.error); }, []);

  async function onUpload(e) {
    e.preventDefault();
    if (!file) return alert("Pick a photo");
    setBusy(true);
    try {
      await Gram.uploadPhoto(file, caption.trim());
      setFile(null); setCaption("");
      await refresh();
    } catch (e) { alert(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="page">
      <h1>PowerGram</h1>

      {/* Upload bar (like the + action) */}
      <form onSubmit={onUpload} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Write a caption…" style={{ flex: 1, padding: 8 }} />
        <button disabled={busy}>{busy ? "Uploading…" : "Post"}</button>
      </form>

      {/* Suggested reels strip (horizontal) */}
      <section style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <strong>Suggested reels</strong>
        </div>
        <div style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(120px, 160px)", gap: 10, overflowX: "auto", paddingBottom: 10 }}>
          {suggested.map(v => (
            <div key={v.id} style={{ border: "1px solid rgba(255,179,77,.35)", borderRadius: 12, overflow: "hidden" }}>
              <video src={v.media_url} muted loop playsInline style={{ width: "100%", height: 200, objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </section>

      {/* Feed grid with actions (Instagram-like) */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,600px)", justifyContent: "center", gap: 18 }}>
        {feed.map(p => <PostCard key={p.id} post={p} onChanged={refresh} />)}
      </div>
    </div>
  );
}

function PostCard({ post, onChanged }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [commentCount, setCommentCount] = useState(post.comment_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  // simple share
  const share = () => {
    const url = post.media_url;
    if (navigator.share) navigator.share({ url, title: "PowerGram", text: post.caption || "" });
    else {
      navigator.clipboard?.writeText(url);
      alert("Copied link to clipboard");
    }
  };

  const like = async () => {
    try {
      const res = await Gram.toggleLike(post.id);
      setLiked(res.liked);
      setLikeCount(c => c + (res.liked ? 1 : -1));
    } catch (e) { alert(e.message); }
  };

  const sendComment = async (e) => {
    e.preventDefault();
    const text = newComment.trim();
    if (!text) return;
    try {
      await Gram.addComment(post.id, text);
      setNewComment("");
      setCommentCount(c => c + 1);
      onChanged?.();
    } catch (e) { alert(e.message); }
  };

  return (
    <article style={{ border: "1px solid rgba(255,179,77,.35)", borderRadius: 16, overflow: "hidden" }}>
      <header style={{ display: "flex", gap: 10, alignItems: "center", padding: 10 }}>
        <Avatar url={post.avatar_url} />
        <div>
          <div style={{ fontWeight: 600 }}>{post.display_name || "User"}</div>
          <small style={{ opacity: .7 }}>{new Date(post.created_at).toLocaleString()}</small>
        </div>
      </header>

      <img src={post.media_url} alt={post.caption || "photo"} style={{ width: "100%", maxHeight: 640, objectFit: "cover" }} />

      <div style={{ padding: "0 10px 10px" }}>
        <ActionRow
          onLike={like}
          onCommentClick={() => setShowComments(s => !s)}
          liked={liked}
          likeCount={likeCount}
          commentCount={commentCount}
          onShare={share}
        />
        {post.caption ? <p style={{ margin: "6px 2px" }}>{post.caption}</p> : null}

        {/* comment box */}
        <form onSubmit={sendComment} style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment…" style={{ flex: 1, padding: 8 }} />
          <button>Send</button>
        </form>

        {/* light comments list (optional) */}
        {showComments && <Comments postId={post.id} />}
      </div>
    </article>
  );
}

function Comments({ postId }) {
  const [list, setList] = useState([]);
  useEffect(() => {
    Gram.listComments(postId, { limit: 10 }).then(setList).catch(console.error);
  }, [postId]);
  return (
    <div style={{ marginTop: 10 }}>
      {list.map(c => (
        <div key={c.id} style={{ fontSize: 14, opacity: .9, padding: "6px 0", borderTop: "1px dashed rgba(255,179,77,.2)" }}>
          <span style={{ opacity: .7, marginRight: 6 }}>{new Date(c.created_at).toLocaleString()} •</span>
          {c.text}
        </div>
      ))}
    </div>
  );
}


