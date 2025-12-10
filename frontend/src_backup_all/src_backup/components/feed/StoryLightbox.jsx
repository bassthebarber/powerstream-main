import React from "react";
import css from "../../styles/Feed.module.css";

export default function StoryLightbox({ story, onClose }) {
  if (!story) return null;
  const isVideo = (story.media_type || "").includes("video");
  return (
    <div className={css.viewer} onClick={onClose}>
      <div className={css.viewerCard} onClick={e=>e.stopPropagation()}>
        <div className={css.viewerTop}>
          <div className={css.viewerWho}>
            <img src="/logos/powerstream-logo.png" alt="" /><strong>{story.author || "PowerStream"}</strong>
          </div>
          <button className={css.closeBtn} onClick={onClose}>Close</button>
        </div>
        <div className={css.viewerMedia}>
          {isVideo ? <video className={css.viewerVideo} src={story.media_url} controls autoPlay/> :
                     <img className={css.viewerImage} src={story.media_url} alt="story"/>}
        </div>
      </div>
    </div>
  );
}


