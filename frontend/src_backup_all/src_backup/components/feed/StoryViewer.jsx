import React, { useEffect } from "react";
import css from "../../styles/Feed.module.css";
import { useNavigate } from "react-router-dom";

export default function StoryViewer({ open, stories, index, onClose, setIndex }) {
  const nav = useNavigate();
  useEffect(() => {
    function onKey(e){
      if(!open) return;
      if(e.key === "Escape") onClose();
      if(e.key === "ArrowRight") setIndex((i)=> Math.min(i+1, stories.length-1));
      if(e.key === "ArrowLeft") setIndex((i)=> Math.max(i-1, 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, stories.length, onClose, setIndex]);

  if(!open || !stories?.length) return null;
  const s = stories[index];

  function toProfile(){
    // route to your profile page pattern; adjust if different
    const slug = (s.author_name || "user").toLowerCase().replace(/\s+/g,"-");
    nav(`/profile/${slug}`);
  }

  return (
    <div className={css.viewer}>
      <div className={css.viewerCard}>
        <div className={css.viewerTop}>
          <div className={css.viewerWho}>
            <img src={s.avatar_url || "/logos/powerstream-logo.png"} alt={s.author_name} />
            <div>
              <strong>{s.author_name}</strong>
              <button className={css.linkBtn} onClick={toProfile}>View profile</button>
            </div>
          </div>
          <button className={css.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={css.viewerMedia}>
          {s.media_type === "video" ? (
            <video src={s.media_url} controls autoPlay />
          ) : (
            <img src={s.media_url} alt="" />
          )}
        </div>

        <div className={css.viewerNav}>
          <button onClick={()=> setIndex(Math.max(index-1,0))} disabled={index===0}>‹ Prev</button>
          <button onClick={()=> setIndex(Math.min(index+1, stories.length-1))} disabled={index===stories.length-1}>Next ›</button>
        </div>
      </div>
    </div>
  );
}


