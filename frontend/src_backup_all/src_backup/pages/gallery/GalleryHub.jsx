import React, { useState } from "react";
import FeedGallery from "../../components/gallery/FeedGallery.jsx";
import GramMasonry from "../../components/gallery/GramMasonry.jsx";
import ReelWall from "../../components/gallery/ReelWall.jsx";
import css from "../../styles/GalleryHub.module.css";

export default function GalleryHub(){
  const [tab,setTab] = useState("feed");
  return (
    <div className={css.wrap}>
      <h2 className={css.title}>Public Gallery</h2>
      <div className={css.tabs}>
        {["feed","gram","reel"].map(t=>(
          <button key={t} className={tab===t?css.active:""} onClick={()=>setTab(t)}>{t.toUpperCase()}</button>
        ))}
      </div>
      <div className={css.body}>
        {tab==="feed" && <FeedGallery/>}
        {tab==="gram" && <GramMasonry/>}
        {tab==="reel" && <ReelWall/>}
      </div>
    </div>
  );
}


