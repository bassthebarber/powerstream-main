import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { listReel, uploadVideo, toggleLikeReel, recordView } from "../../services/reel";
import { createClient } from "@supabase/supabase-js";

// OPTIONAL: if you already centralize this client, delete these 2 lines and import your client instead.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnon);

// ----------------------------------
// Small UI helpers
// ----------------------------------
function Avatar({ url, size = 36 }) {
  const src = url || "/img/avatar-placeholder.png";
  return (
    <img
      src={src}
      alt=""
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "1px solid rgba(255,179,77,.35)",
        objectFit: "cover",
      }}
    />
  );
}

function LikeButton({ post, onToggle }) {
  const [busy, setBusy] = useState(false);
  const liked = useMemo(() => Boolean(post?.liked_by_me), [post]);

  return (
    <button
      disabled={busy}
      onClick={async () => {
        try {
          setBusy(true);
          await onToggle(post);
        } finally {
          setBusy(false);
        }
      }}
      style={{
        border: "1px solid rgba(255,179,77,.35)",
        padding: "6px 10px",
        borderRadius: 10,
        background: liked ? "rgba(255,179,77,.15)" : "transparent",
        color: liked ? "#ffb34d" : "#ddd",
      }}
    >
      ♥ {post?.like_count ?? 0}
    </button>
  );
}

// ----------------------------------
// Single Reel Card – auto play/pause + view tracking
// ----------------------------------
function ReelCard({ post, onLike }) {
  const vref = useRef(null);
  const seenRef = useRef(false);

  useEffect(() => {
    const el = vref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      async (entries) => {
        entries.forEach(async (e) => {
          if (e.isIntersecting) {
            el.play().catch(() => {});
            // count a view once per mount/scroll pass
            if (!seenRef.current) {
              seenRef.current = true;
              try { await recordView(post.id); } catch {}
            }
          } else {
            el.pause();
          }
        });
      },
      { threshold: 0.6 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [post?.id]);

  return (
    <article
      style={{
        width: "100%",
        maxWidth: 520,
        margin: "0 auto 24px",
        border: "1px solid rgba(255,179,77,.2)",
        borderRadius: 16,
        overflow: "hidden",
        background: "rgba(255,255,255,.02)",
      }}
    >
      <header style={{ display: "flex", gap: 10, alignItems: "center", padding: 12 }}>
        <Avatar url={post?.avatar_url} />
        <div style={{ lineHeight: 1.2 }}>
          <strong style={{ color: "#fff" }}>{post?.display_name || "User"}</strong>
          <div style={{ color: "#aaa", fontSize: 12 }}>
            {new Date(post?.created_at).toLocaleString()}
          </div>
        </div>
      </header>

      <div style={{ aspectRatio: "9/16", background: "#000" }}>
        {/* If you use HLS later, swap <video> for your HLS player */}
        <video
          ref={vref}
          src={post?.media_url}
          playsInline
          controls
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {post?.caption && (
        <p style={{ padding: "10px 12px", color: "#ddd" }}>{post.caption}</p>
      )}

      <footer
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: 12,
        }}
      >
        <LikeButton post={post} onToggle={onLike} />
        <div style={{ color: "#aaa", fontSize: 12 }}>
          Views: {post?.views_count ?? 0}
        </div>
      </footer>
    </article>
  );
}

// ----------------------------------
// Upload form
// ----------------------------------
function UploadForm({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!file) return setErr("Pick a video first.");
    try {
      setBusy(true);
      await uploadVideo({ file, caption });
      setCaption("");
      setFile(null);
      onUploaded?.();
    } catch (e2) {
      setErr(e2.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      style={{
        maxWidth: 520,
        margin: "0 auto 18px",
        padding: 12,
        border: "1px solid rgba(255,179,77,.25)",
        borderRadius: 16,
      }}
    >
      <div style={{ display: "grid", gap: 8 }}>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <input
          placeholder="Add a caption…"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 10,
            border: "1px solid rgba(255,179,77,.25)",
            background: "transparent",
            color: "#fff",
          }}
        />
        <button
          disabled={busy}
          type="submit"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,179,77,.35)",
            background: busy ? "rgba(255,179,77,.12)" : "transparent",
            color: "#ffb34d",
            fontWeight: 600,
          }}
        >
          {busy ? "Uploading…" : "Upload video"}
        </button>
        {err && <div style={{ color: "#ff7676" }}>{err}</div>}
      </div>
    </form>
  );
}

// ----------------------------------
// MAIN PAGE
// ----------------------------------
export default function PowerReel() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listReel({ limit: 30 }); // service handles anon/rls
      setPosts(rows || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const likeToggle = async (post) => {
    try {
      await toggleLikeReel(post.id);
      // optimistic refresh: re-pull list to get like_count/liked_by_me
      load();
    } catch {}
  };

  return (
    <div style={{ padding: "16px 12px 80px" }}>
      {/* Optional: hide if you only want uploads for signed-in users */}
      <AuthGate>
        <UploadForm onUploaded={load} />
      </AuthGate>

      {loading && (
        <div style={{ color: "#aaa", textAlign: "center", padding: 20 }}>
          Loading Reels…
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div style={{ color: "#aaa", textAlign: "center", padding: 20 }}>
          No reels yet. Be first to upload!
        </div>
      )}

      <div style={{ display: "grid", gap: 18 }}>
        {posts.map((p) => (
          <ReelCard key={p.id} post={p} onLike={likeToggle} />
        ))}
      </div>
    </div>
  );
}

// Gate section to show upload only when signed in (simple inline gate)
function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setUser(s?.user || null)
    );
    return () => sub?.subscription?.unsubscribe();
  }, []);
  if (!user) return null;
  return children;
}


