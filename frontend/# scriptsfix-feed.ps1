# scripts/fix-feed.ps1
# Rewrites the Feed + Stories stack in a PowerStream project (Vite + React + Supabase)
# Run from repo root:  powershell -ExecutionPolicy Bypass -File .\scripts\fix-feed.ps1

$ErrorActionPreference = "Stop"

# ---- paths ----
$root = "frontend"
$stylesDir = "$root/src/styles"
$servicesDir = "$root/src/services"
$hooksDir = "$root/src/hooks"
$componentsDir = "$root/src/components/feed"
$pagesDir = "$root/src/pages"

# Make sure folders exist
New-Item -ItemType Directory -Force -Path $stylesDir, $servicesDir, $hooksDir, $componentsDir, $pagesDir | Out-Null

# ---------- services/feed.js ----------
@'
import { supabase } from "../supabaseClient";

export async function fetchPosts(limit = 50) {
  const { data, error } = await supabase
    .from("feed_posts")
    .select("id, author, body, media_url, media_type, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function createPost({ author, body, media_url = null, media_type = null }) {
  const { data, error } = await supabase
    .from("feed_posts")
    .insert([{ author, body, media_url, media_type }])
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
'@ | Out-File -Encoding utf8 -Force "$servicesDir/feed.js"

# ---------- services/stories.js ----------
@'
import { supabase } from "../supabaseClient";

const BUCKET = import.meta.env.VITE_SOCIAL_BUCKET || "social";

export async function fetchStories(limit = 50) {
  const { data, error } = await supabase
    .from("stories")
    .select("id, author, media_url, media_type, created_at, expires_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).filter(s => new Date(s.expires_at) > new Date());
}

function extFromType(t) {
  if (!t) return "bin";
  if (t.includes("png")) return "png";
  if (t.includes("jpg") || t.includes("jpeg")) return "jpg";
  if (t.includes("gif")) return "gif";
  if (t.includes("mp4")) return "mp4";
  return "bin";
}

export async function uploadStoryFile(file, author = "You") {
  const fileType = file.type || "application/octet-stream";
  const ext = extFromType(fileType);
  const id = crypto.randomUUID();
  const path = `stories/${id}.${ext}`;

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: fileType
  });
  if (upErr) throw upErr;

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const media_url = pub?.publicUrl;

  const { data, error } = await supabase
    .from("stories")
    .insert([{ author, media_url, media_type: fileType }])
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
'@ | Out-File -Encoding utf8 -Force "$servicesDir/stories.js"

# ---------- hooks/useFeed.js ----------
@'
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { fetchPosts } from "../services/feed";

export default function useFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const initial = await fetchPosts();
        if (active) setPosts(initial);
      } finally {
        if (active) setLoading(false);
      }
    })();

    const channel = supabase
      .channel("feed_posts_changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "feed_posts" }, (payload) => {
        setPosts(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { posts, loading };
}
'@ | Out-File -Encoding utf8 -Force "$hooksDir/useFeed.js"

# ---------- hooks/useStories.js ----------
@'
import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import { fetchStories } from "../services/stories";

export default function useStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const rows = await fetchStories(100);
        if (active) setStories(rows);
      } finally {
        if (active) setLoading(false);
      }
    })();

    const channel = supabase
      .channel("stories_changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "stories" }, (payload) => {
        setStories(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      active = false;
      if (timerRef.current) clearInterval(timerRef.current);
      supabase.removeChannel(channel);
    };
  }, []);

  return { stories, loading };
}
'@ | Out-File -Encoding utf8 -Force "$hooksDir/useStories.js"

# ---------- components/feed/StoryLightbox.jsx ----------
@'
import React from "react";
import css from "../../styles/Feed.module.css";

export default function StoryLightbox({ story, onClose }) {
  if (!story) return null;
  const isVideo = (story.media_type || "").includes("video");

  return (
    <div className={css.viewer} onClick={onClose}>
      <div className={css.viewerCard} onClick={(e) => e.stopPropagation()}>
        <div className={css.viewerTop}>
          <div className={css.viewerWho}>
            <img src="/logos/powerstream-logo.png" alt="" />
            <strong>{story.author || "PowerStream"}</strong>
          </div>
          <button className={css.closeBtn} onClick={onClose}>Close</button>
        </div>
        <div className={css.viewerMedia}>
          {isVideo ? (
            <video className={css.viewerVideo} src={story.media_url} controls autoPlay />
          ) : (
            <img className={css.viewerImage} src={story.media_url} alt="story" />
          )}
        </div>
      </div>
    </div>
  );
}
'@ | Out-File -Encoding utf8 -Force "$componentsDir/StoryLightbox.jsx"

# ---------- components/feed/StoryUploader.jsx ----------
@'
import React, { useRef, useState } from "react";
import css from "../../styles/Feed.module.css";
import { uploadStoryFile } from "../../services/stories";

export default function StoryUploader({ onUploaded }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function pick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const row = await uploadStoryFile(file, "You");
      onUploaded?.(row);
    } catch (e) {
      console.error(e);
      alert("Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <button
      className={css.storyUploadBtn}
      disabled={busy}
      onClick={() => inputRef.current?.click()}
      title="Post a story"
    >
      {busy ? "Uploading…" : "Be creative"}
      <input ref={inputRef} type="file" accept="image/*,video/*" onChange={pick} hidden />
    </button>
  );
}
'@ | Out-File -Encoding utf8 -Force "$componentsDir/StoryUploader.jsx"

# ---------- components/feed/StoryBar.jsx ----------
@'
import React, { useMemo, useRef, useState, useEffect } from "react";
import css from "../../styles/Feed.module.css";
import useStories from "../../hooks/useStories";
import StoryLightbox from "./StoryLightbox";
import StoryUploader from "./StoryUploader";

function Chip({ label, img, onClick }) {
  return (
    <div className={css.storyChip} onClick={onClick}>
      <div className={css.chipImgWrap}>
        <img className={css.chipImg} src={img} alt={label} />
      </div>
      <span className={css.chipLbl}>{label}</span>
    </div>
  );
}

export default function StoryBar() {
  const { stories } = useStories();
  const [open, setOpen] = useState(null);
  const viewRef = useRef(null);

  // Auto-rotate scroll every 4s (if overflow)
  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    let idx = 0;
    const tick = () => {
      if (el.scrollWidth <= el.clientWidth) return; // no overflow
      const next = Math.min(el.scrollLeft + 240, el.scrollWidth);
      el.scrollTo({ left: next, behavior: "smooth" });
      idx++;
      if (next + el.clientWidth >= el.scrollWidth) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      }
    };
    const id = setInterval(tick, 4000);
    return () => clearInterval(id);
  }, [stories.length]);

  const friendChips = useMemo(() => {
    return stories.map(s => ({
      id: s.id, label: s.author || "Friend", img: "/logos/powerstream-logo.png", story: s
    }));
  }, [stories]);

  return (
    <section className={css.storyBar}>
      <div className={css.storyScroller} ref={viewRef}>
        <div className={css.storyChipFirst}>
          <div className={css.chipImgWrap}>
            <img className={css.chipImg} src="/logos/powerstream-logo.png" alt="You" />
          </div>
          <StoryUploader onUploaded={(row)=>{ /* appears via realtime */ }} />
        </div>

        <div className={css.storyGap}></div>

        {friendChips.map(c => (
          <Chip key={c.id} label={c.label} img={c.img} onClick={()=>setOpen(c.story)} />
        ))}
      </div>

      <StoryLightbox story={open} onClose={()=>setOpen(null)} />
    </section>
  );
}
'@ | Out-File -Encoding utf8 -Force "$componentsDir/StoryBar.jsx"

# ---------- components/feed/PostCard.jsx ----------
@'
import React from "react";
import css from "../../styles/Feed.module.css";

export default function PostCard({ post }) {
  const isVideo = (post.media_type || "").includes("video");
  return (
    <article className={css.postCard}>
      <header className={css.postHead}>
        <img src="/logos/powerstream-logo.png" alt="" />
        <div>
          <strong>{post.author || "PowerStream"}</strong>
          <div className={css.when}>{new Date(post.created_at).toLocaleString()}</div>
        </div>
      </header>

      {post.body && <p className={css.postBody}>{post.body}</p>}

      {post.media_url && (
        <div className={css.postMedia}>
          {isVideo ? <video src={post.media_url} controls /> : <img src={post.media_url} alt="" />}
        </div>
      )}
    </article>
  );
}
'@ | Out-File -Encoding utf8 -Force "$componentsDir/PostCard.jsx"

# ---------- components/feed/Composer.jsx ----------
@'
import React, { useRef, useState } from "react";
import css from "../../styles/Feed.module.css";
import { createPost } from "../../services/feed";

export default function Composer() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const [media, setMedia] = useState(null);

  function chooseFile() { fileRef.current?.click(); }
  function onPick(e){ setMedia(e.target.files?.[0] || null); }

  async function submit(e){
    e.preventDefault();
    if (!text && !media) return;

    setBusy(true);
    try {
      let media_url = null, media_type = null;

      if (media) {
        // simple client-side host: use object URL for now, or wire to your Storage uploader later
        media_type = media.type || "image/png";
        media_url = URL.createObjectURL(media);
      }

      await createPost({ author: "PowerStream", body: text, media_url, media_type });
      setText(""); setMedia(null);
    } catch(err){
      console.error(err);
      alert("Failed to post");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={css.composer} onSubmit={submit}>
      <div className={css.composerRow}>
        <img className={css.me} src="/logos/powerstream-logo.png" alt="" />
        <input
          className={css.input}
          placeholder="What's going on in your world?"
          value={text}
          onChange={(e)=>setText(e.target.value)}
        />
        <button className={css.postBtn} disabled={busy || (!text && !media)}>Post</button>
      </div>
      <div className={css.composerActions}>
        <button type="button" onClick={()=>alert("Live coming soon")} className={css.actionBtn}>Live</button>
        <button type="button" onClick={chooseFile} className={css.actionBtn}>Photo/Video</button>
        <button type="button" onClick={()=>alert("Feeling/Activity coming soon")} className={css.actionBtn}>Feeling/Activity</button>
        <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={onPick}/>
        {media && <span className={css.chosen}>{media.name}</span>}
      </div>
    </form>
  );
}
'@ | Out-File -Encoding utf8 -Force "$componentsDir/Composer.jsx"

# ---------- pages/feed.jsx ----------
@'
import React from "react";
import css from "../styles/Feed.module.css";
import StoryBar from "../components/feed/StoryBar";
import Composer from "../components/feed/Composer";
import PostCard from "../components/feed/PostCard";
import useFeed from "../hooks/useFeed";

export default function FeedPage(){
  const { posts, loading } = useFeed();

  return (
    <main className={css.feedWrap}>
      <StoryBar />

      <Composer />

      <section className={css.postList}>
        {loading && <div className={css.loading}>Loading feed…</div>}
        {!loading && posts.length === 0 && (
          <div className={css.empty}>Be the first to post.</div>
        )}
        {posts.map(p => <PostCard key={p.id} post={p} />)}
      </section>
    </main>
  );
}
'@ | Out-File -Encoding utf8 -Force "$pagesDir/feed.jsx"

# ---------- styles/Feed.module.css ----------
@'
/* ---- Gold / charcoal theme ---- */
:root{
  --gold:#ffb42a;
  --gold-2:#ffde8a;
  --char:#0e0f12;
  --panel:#171a1f;
  --panel-2:#20242b;
  --text:#eef0f3;
}

.feedWrap{ display:grid; gap:18px; padding:18px; }

/* ----- Story bar ----- */
.storyBar{
  background: var(--panel);
  border:1px solid var(--gold);
  border-radius:18px;
  padding:12px 8px;
  box-shadow: 0 0 0 1px rgba(255,180,42,.15) inset, 0 12px 40px rgba(0,0,0,.35);
  overflow:hidden;
}

.storyScroller{ display:flex; gap:14px; overflow:auto; padding:6px 6px; scroll-behavior:smooth }
.storyScroller::-webkit-scrollbar{ height:8px }
.storyScroller::-webkit-scrollbar-thumb{ background:rgba(255,180,42,.35); border-radius:8px }

.storyChip, .storyChipFirst{
  min-width: 120px; height: 150px;
  border:1px solid var(--gold);
  border-radius:18px; padding:10px;
  background:linear-gradient(180deg, #15181d, #0e1116);
  display:grid; place-items:center; gap:8px; user-select:none; cursor:pointer;
}
.storyChip:hover, .storyChipFirst:hover{ box-shadow:0 0 0 1px var(--gold) inset; }

.storyGap { width: 8px; } /* spacer after first chip */

.chipImgWrap{ width:72px; height:72px; border-radius:50%; border:2px solid var(--gold); display:grid; place-items:center; overflow:hidden; }
.chipImg{ width:100%; height:100%; object-fit:cover }
.chipLbl{ font-size:12px; color:var(--gold-2); }

.storyUploadBtn{
  all:unset; font-weight:700; color:var(--gold); border:1px solid var(--gold);
  padding:6px 10px; border-radius:12px; cursor:pointer;
}

/* ---- Lightbox viewer ---- */
.viewer{ position:fixed; inset:0; background:rgba(0,0,0,.65); display:grid; place-items:center; z-index:1000 }
.viewerCard{ width:min(900px, 96vw); max-height:92vh; background:#0f1216; border-radius:18px; overflow:hidden; box-shadow:0 0 2px rgba(255,180,41,.4), 0 18px 55px rgba(0,0,0,.6) }
.viewerTop{ display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-bottom:1px solid rgba(255,180,42,.25) }
.viewerWho{ display:flex; gap:10px; align-items:center }
.viewerWho img{ width:36px; height:36px; border-radius:50%; border:1px solid var(--gold) }
.closeBtn{ background:#ffb42a; border:none; color:#15181d; border-radius:10px; padding:8px 12px; font-weight:700; cursor:pointer }
.viewerMedia{ display:grid; place-items:center }
.viewerImage, .viewerVideo{ max-width:min(880px, 90vw); max-height:78vh; border-radius:10px }

/* ---- Composer ---- */
.composer{
  background: var(--panel);
  border:1px solid var(--gold); border-radius:18px; padding:10px; display:grid; gap:10px;
}
.composerRow{ display:grid; grid-template-columns: 40px 1fr auto; gap:10px; align-items:center }
.me{ width:40px; height:40px; border-radius:50%; border:1px solid var(--gold) }
.input{
  background:var(--panel-2); border:1px solid var(--gold); border-radius:20px; color:var(--text); padding:10px 14px; outline:none;
}
.postBtn{ background:var(--gold); color:#111; border:none; border-radius:12px; padding:8px 14px; font-weight:700; cursor:pointer }
.composerActions{ display:flex; gap:10px; align-items:center; flex-wrap:wrap }
.actionBtn{ background:transparent; border:1px solid var(--gold); color:var(--gold); border-radius:12px; padding:8px 12px; cursor:pointer }
.chosen{ color:var(--gold-2); font-size:12px }

/* ---- Posts ---- */
.postList{ display:grid; gap:16px }
.loading, .empty{ color:var(--gold-2); padding:16px 10px; text-align:center }

.postCard{
  background:var(--panel);
  border:1px solid var(--gold);
  border-radius:18px; padding:12px; display:grid; gap:10px;
}
.postHead{ display:flex; gap:10px; align-items:center }
.postHead img{ width:40px; height:40px; border-radius:50%; border:1px solid var(--gold) }
.when{ font-size:12px; opacity:.8 }
.postBody{ white-space:pre-wrap; color:var(--text) }
.postMedia img, .postMedia video{
  width:100%; max-height:420px; object-fit:contain; border-radius:12px; background:#000;
}
'@ | Out-File -Encoding utf8 -Force "$stylesDir/Feed.module.css"

Write-Host "`n✅ Feed + Stories files were written."
Write-Host "If Vite is running, it should hot-reload. If not, run:  cd frontend ; npm run dev"
