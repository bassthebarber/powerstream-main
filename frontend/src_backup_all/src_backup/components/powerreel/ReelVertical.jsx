import React, { useEffect, useState } from "react";
import s from "../../styles/Reel.module.css";

export default function ReelVertical(){
  const [items, setItems] = useState([]);
  const [k, setK] = useState(0);

  useEffect(() => {
    fetch("http://127.0.0.1:5001/api/reels?limit=40")
      .then(r => r.json()).then(setItems)
      .catch(err => console.error("Reels error", err));
  }, [k]);

  return (
    <div className={s.wrap}>
      <div className={s.title}>PowerReel</div>
      <Upload onDone={() => setK(x=>x+1)} />
      <div className={s.grid}>
        {items.map(v => (
          <div key={v.id} className={s.card}>
            <video className={s.video} src={v.video_url} poster={v.cover_url || undefined} controls />
            {v.title && <div style={{ marginTop: 6 }}>{v.title}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Upload(props){ const U = require("./UploadReel.jsx").default; return <U {...props}/>; }


