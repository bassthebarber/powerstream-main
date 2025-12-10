// src/components/feed/LinkPreview.jsx
import { useEffect, useState } from "react";

export default function LinkPreview({ url }) {
  const [meta, setMeta] = useState(null);
  useEffect(() => { (async () => {
    const r = await fetch(`/api/og-preview?url=${encodeURIComponent(url)}`);
    setMeta(await r.json());
  })(); }, [url]);

  if (!meta) return null;
  return (
    <a href={meta.url} target="_blank" rel="noreferrer"
       style={{ display:"block", border:"1px solid #ff8a291f", borderRadius:12, overflow:"hidden", marginTop:10 }}>
      {meta.image && <img src={meta.image} alt="" style={{ width:"100%", maxHeight:240, objectFit:"cover" }} />}
      <div style={{ padding:10 }}>
        <div style={{ fontWeight:700 }}>{meta.title || meta.site || meta.url}</div>
        {meta.desc && <div style={{ opacity:.8, fontSize:14, marginTop:6 }}>{meta.desc}</div>}
      </div>
    </a>
  );
}


