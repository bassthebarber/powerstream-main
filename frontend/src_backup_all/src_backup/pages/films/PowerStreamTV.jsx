// src/pages/films/PowerStreamTV.jsx
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import LivePlayer from "../../components/LivePlayer.jsx";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function PowerStreamTV() {
  const [films, setFilms] = useState([]);
  const [podcasts, setPodcasts] = useState([]);

  useEffect(() => {
    (async () => {
      const { data: f } = await supabase.from("media_items")
        .select("*").eq("type","film").order("created_at", { ascending:false }).limit(30);
      const { data: p } = await supabase.from("media_items")
        .select("*").eq("type","podcast").order("created_at", { ascending:false }).limit(30);
      setFilms(f || []); setPodcasts(p || []);
    })();
  }, []);

  return (
    <div className="page">
      <header className="hero" style={{textAlign:"center"}}>
        <img src="/logos/powerstream-logo.png" alt="" width={64} height={64} style={{verticalAlign:"middle"}}/>
        <h1 style={{display:"inline-block", marginLeft:10}}>PowerStream TV</h1>
      </header>

      <Shelf title="New Films" items={films} />
      <Shelf title="Podcasts" items={podcasts} />
    </div>
  );
}

function Shelf({ title, items }) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      <div className="shelf">
        {items.map(it => (
          <div key={it.id} className="tile">
            <img src={it.thumb_path || "/images/thumb-fallback.png"} alt="" />
            <div className="tile-meta">
              <div className="t">{it.title}</div>
              <div className="c">{it.category || it.type}</div>
            </div>
            {/* Inline player on click (simple version): */}
            {it.playback_url?.includes(".m3u8") && (
              <details>
                <summary>Play</summary>
                <LivePlayer hlsUrl={it.playback_url} />
              </details>
            )}
          </div>
        ))}
        {items.length === 0 && <div>Nothing yet.</div>}
      </div>
    </section>
  );
}


