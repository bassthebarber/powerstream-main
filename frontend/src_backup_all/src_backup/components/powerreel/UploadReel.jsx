import React, { useState } from "react";
import s from "../../styles/Reel.module.css";

export default function UploadReel({ onDone }) {
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e){
    e.preventDefault();
    if(!videoUrl) return;
    setBusy(true);
    try{
      const r = await fetch("http://127.0.0.1:5001/api/reels", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ title, video_url: videoUrl, cover_url: coverUrl })
      });
      if(!r.ok) throw new Error(await r.text());
      setTitle(""); setVideoUrl(""); setCoverUrl("");
      onDone && onDone();
    }catch(e2){ alert("Upload failed: " + e2.message); }
    finally{ setBusy(false); }
  }

  return (
    <form onSubmit={submit} className={s.row}>
      <input className={s.input} placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
      <input className={s.input} placeholder="Video URL (.mp4)" value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} />
      <input className={s.input} placeholder="Cover image (optional)" value={coverUrl} onChange={e=>setCoverUrl(e.target.value)} />
      <button className={s.btn} disabled={busy}>{busy ? "Saving…" : "Post"}</button>
    </form>
  );
}


