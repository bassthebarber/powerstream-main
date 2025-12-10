// frontend/src/components/feed/FeedGalleryView.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";

export default function FeedGalleryView({ tableName = "feed_gallery" }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let live = true;
    (async () => {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(24);

      if (!live) return;
      if (error) console.error(error);
      setItems(data || []);
    })();
    return () => { live = false; };
  }, [tableName]);

  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
      {items.map((it) => (
        <div key={it.id} style={{ border: "1px solid #333", padding: 8, borderRadius: 8 }}>
          {/\.(mp4|webm|mov)$/i.test(it.media_url || "") ? (
            <video src={it.media_url} controls style={{ width: "100%", borderRadius: 6 }} />
          ) : (
            <img src={it.media_url} alt="" style={{ width: "100%", borderRadius: 6 }} />
          )}
          {it.content && <div style={{ color: "#ddd", marginTop: 8 }}>{it.content}</div>}
        </div>
      ))}
      {items.length === 0 && <div style={{ color: "#999" }}>No media yet.</div>}
    </div>
  );
}


