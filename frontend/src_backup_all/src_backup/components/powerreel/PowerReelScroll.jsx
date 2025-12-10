import React, { useEffect, useRef, useState } from "react";
import styles from "../../styles/reel.module.css";
import { uploadReel, listReels } from "../../services/reel";

export default function PowerReelScroll() {
  const [reels, setReels] = useState([]);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  async function refresh(){ setReels(await listReels()); }
  useEffect(() => { refresh(); }, []);

  async function onUpload(e){
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if(!file) return;
    setUploading(true);
    try {
      await uploadReel({ caption, file });
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
      await refresh();
    } finally { setUploading(false); }
  }

  // auto play/pause in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        const v = entry.target.querySelector("video");
        if (!v) return;
        if (entry.isIntersecting) v.play().catch(()=>{});
        else v.pause();
      }),
      { threshold: 0.6 }
    );
    document.querySelectorAll(`.${styles.card}`).forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [reels]);

  return (
    <div className={styles.container}>
      <form className={styles.composer} onSubmit={onUpload}>
        <input ref={fileRef} type="file" accept="video/*" />
        <input
          value={caption}
          onChange={(e)=>setCaption(e.target.value)}
          placeholder="Caption"
        />
        <button disabled={uploading}>{uploading ? "Uploading…" : "Upload"}</button>
      </form>

      <div className={styles.list}>
        {reels.map(r => (
          <div className={styles.card} key={r.id}>
            <video src={r.media_url} controls playsInline />
            {r.caption && <div className={styles.caption}>{r.caption}</div>}
          </div>
        ))}
        {reels.length === 0 && <div className={styles.muted}>No reels yet.</div>}
      </div>
    </div>
  );
}


