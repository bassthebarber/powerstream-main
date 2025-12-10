Write-Host "🛠 PowerStationsScaffold starting..." -ForegroundColor Cyan
$root = Get-Location
$src  = Join-Path $root "src"
$pages = Join-Path $src "pages"
$tvdir = Join-Path $pages "tv"
$comps = Join-Path $src "components"
$data  = Join-Path $src "data"
$styles = Join-Path $src "styles"
$backup = Join-Path $root ("station-backup-" + (Get-Date -Format "yyyyMMdd-HHmmss"))

function Ensure([string]$p){ if(!(Test-Path $p)){ New-Item -ItemType Directory $p | Out-Null } }
function Save([string]$p,[string]$c){
  if(Test-Path $p){
    $rel = Resolve-Path $p | Split-Path -NoQualifier
    $dst = Join-Path $backup $rel
    $dstDir = Split-Path $dst
    Ensure $dstDir
    Copy-Item $p $dst -Force
  }
  Ensure (Split-Path $p)
  $c | Set-Content -Encoding utf8 -NoNewline -Path $p
  Write-Host "✍️  $p"
}

Ensure $tvdir; Ensure $comps; Ensure $data; Ensure $styles

# ---- stations data (uses YOUR filenames & slugs) ----
$STATIONS = @'
export const STATIONS = {
  "no-limit-east-houston": {
    slug: "no-limit-east-houston",
    name: "No Limit East Houston",
    logo: "/logos/nolimiteasthoustonlogo.png",
    description: "No Limit East Houston TV — live shows, features, community.",
    voting: false
  },
  "texas-got-talent": {
    slug: "texas-got-talent",
    name: "Texas Got Talent",
    logo: "/logos/texasgottalentlogo.png",
    description: "Texas Got Talent — live performances, real-time voting.",
    voting: true
  },
  "civic-connect": {
    slug: "civic-connect",
    name: "Civic Connect",
    logo: "/logos/civicconnectlogo.png",
    description: "Civic Connect — local government, community updates.",
    voting: false
  },
  "worldwide-tv": {
    slug: "worldwide-tv",
    name: "Worldwide TV",
    logo: "/logos/WorldwideTV.png",
    description: "Worldwide TV — global content & live events.",
    voting: false
  }
};
'@
Save (Join-Path $data "stations.js") $STATIONS

# ---- HLS Player component ----
$HLS = @'
import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function HLSPlayer({ src, poster }) {
  const ref = useRef(null);
  useEffect(() => {
    const video = ref.current;
    if (!video || !src) return;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else {
      console.warn("HLS not supported in this browser.");
    }
  }, [src]);
  return (
    <video
      ref={ref}
      controls
      playsInline
      poster={poster}
      style={{ width: "100%", borderRadius: 12, border: "1px solid var(--line)", background:"#000" }}
    />
  );
}
'@
Save (Join-Path $comps "HLSPlayer.jsx") $HLS

# ---- Upload component (Supabase-aware, safe fallback) ----
$UP = @'
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function UploadMedia({ stationSlug, kind="video" }) {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  async function onUpload(){
    setMsg("");
    if(!file) return;
    const bucket = "vod";
    const path = `${stationSlug}/${kind}s/${Date.now()}-${file.name}`;
    if(!supabase){ setMsg("Supabase not configured."); return; }
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert:false });
    if(error){ setMsg("Upload error: " + error.message); return; }
    // Record metadata
    const table = kind === "audio" ? "station_audios" : "station_videos";
    const { error: terr } = await supabase.from(table).insert({
      station_slug: stationSlug,
      title: caption || file.name,
      file_path: data.path
    });
    if(terr){ setMsg("Saved file but failed to record DB row: " + terr.message); return; }
    setMsg("Uploaded!");
    setCaption(""); setFile(null);
  }

  return (
    <div className="card" style={{marginTop:12}}>
      <h3 style={{marginBottom:8}}>Upload {kind}</h3>
      <input className="input" placeholder="Title / caption (optional)" value={caption} onChange={e=>setCaption(e.target.value)} />
      <input type="file" accept={kind==="audio" ? "audio/*" : "video/*"} onChange={e=>setFile(e.target.files?.[0]||null)} style={{marginTop:8}}/>
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
        <button className="btn" onClick={onUpload} disabled={!file}>Upload</button>
      </div>
      {msg ? <div style={{opacity:.8,marginTop:8}}>{msg}</div> : null}
    </div>
  );
}
'@
Save (Join-Path $comps "UploadMedia.jsx") $UP

# ---- Voting widget (Supabase-aware, safe fallback) ----
$VOTE = @'
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function TalentVoting({ stationSlug }) {
  const [contestants, setContestants] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ (async()=>{
    if(!supabase){ // demo fallback
      setContestants([{id:"demo1", name:"Alice"}, {id:"demo2", name:"Bob"}]);
      setCounts({ demo1:5, demo2:3 });
      setLoading(false);
      return;
    }
    const { data: show } = await supabase.from("talent_shows").select("*").eq("station_slug", stationSlug).eq("is_active",true).single();
    if(!show){ setLoading(false); return; }
    const { data: conts } = await supabase.from("contestants").select("*").eq("show_id", show.id).order("name");
    setContestants(conts||[]);
    const { data: tally } = await supabase.from("votes_tally").select("*").eq("show_id", show.id);
    const map = {}; (tally||[]).forEach(t=>{ map[t.contestant_id]=t.votes; });
    setCounts(map);
    setLoading(false);
  })(); },[stationSlug]);

  const vote = async (id) => {
    if(!supabase){ setCounts(c=>({ ...c, [id]:(c[id]||0)+1 })); return; }
    const { data: prof } = await supabase.from("profiles").select("id").limit(1).single();
    const user_id = prof?.id || null;
    const { error } = await supabase.rpc("cast_vote", { p_contestant_id:id, p_user_id:user_id });
    if(!error){ setCounts(c=>({ ...c, [id]:(c[id]||0)+1 })); }
  };

  if(loading) return <div className="card">Loading voting…</div>;
  if(!contestants?.length) return <div className="card">Voting not active.</div>;

  return (
    <div className="card">
      <h3>Vote now</h3>
      <div className="grid-cards" style={{marginTop:10}}>
        {contestants.map(c=>(
          <div key={c.id} className="card" style={{textAlign:"center"}}>
            <div style={{fontWeight:700}}>{c.name}</div>
            <div style={{opacity:.8,margin:"6px 0"}}>{counts[c.id]||0} votes</div>
            <button className="btn" onClick={()=>vote(c.id)}>Vote</button>
          </div>
        ))}
      </div>
    </div>
  );
}
'@
Save (Join-Path $comps "TalentVoting.jsx") $VOTE

# ---- Station page (Live / Videos / Audio / Voting) ----
$STATION = @'
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { STATIONS } from "../../data/stations";
import HLSPlayer from "../../components/HLSPlayer.jsx";
import UploadMedia from "../../components/UploadMedia.jsx";
import TalentVoting from "../../components/TalentVoting.jsx";
import { supabase } from "../../lib/supabaseClient";

export default function Station(){
  const { slug } = useParams();
  const station = STATIONS[slug];
  const [liveUrl, setLiveUrl] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [videos, setVideos] = useState([]);
  const [audios, setAudios] = useState([]);

  useEffect(()=>{
    if(!station) return;
    (async()=>{
      // admin check (simple): profiles.role === 'admin'
      if(supabase){
        const { data: profile } = await supabase.from("profiles").select("role").limit(1).single();
        setIsAdmin(profile?.role === "admin");
        // fetch live url & media
        const { data: s } = await supabase.from("stations").select("live_hls_url").eq("slug", slug).single();
        if(s?.live_hls_url) setLiveUrl(s.live_hls_url);
        const { data: vs } = await supabase.from("station_videos").select("*").eq("station_slug", slug).order("created_at", {ascending:false}).limit(24);
        setVideos(vs||[]);
        const { data: as } = await supabase.from("station_audios").select("*").eq("station_slug", slug).order("created_at", {ascending:false}).limit(24);
        setAudios(as||[]);
      }
    })();
  },[slug]);

  if(!station){ return <main className="page"><h1>Station not found</h1></main>; }

  const saveLiveUrl = async ()=>{
    if(!supabase) return;
    await supabase.from("stations").upsert({ slug, live_hls_url: liveUrl }, { onConflict:"slug" });
  };

  return (
    <main className="page">
      <header style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
        <img src={station.logo} alt={station.name} style={{width:56,height:56,objectFit:"contain",borderRadius:10,border:"1px solid var(--line)"}}/>
        <div>
          <h1>{station.name}</h1>
          <div style={{opacity:.8}}>{station.description}</div>
        </div>
      </header>

      {/* LIVE */}
      <section className="card">
        <h3>Live</h3>
        {liveUrl ? (
          <HLSPlayer src={liveUrl} />
        ) : (
          <div style={{opacity:.8}}>Live not set.</div>
        )}
        {isAdmin ? (
          <div style={{marginTop:10,display:"grid",gap:8}}>
            <input className="input" placeholder="Paste HLS playback URL (e.g., https://livepeercdn.com/hls/....m3u8)" value={liveUrl} onChange={e=>setLiveUrl(e.target.value)} />
            <div style={{display:"flex",gap:8}}>
              <button className="btn" onClick={saveLiveUrl}>Save</button>
              <a className="btn" href="https://livepeer.studio/" target="_blank" rel="noreferrer">Get Stream Key</a>
            </div>
            <div style={{opacity:.7,fontSize:13}}>Use Livepeer/Mux/nginx-rtmp to stream → paste the **HLS playback URL** here.</div>
          </div>
        ) : null}
      </section>

      {/* VOTING for Texas Got Talent */}
      {station.voting ? <TalentVoting stationSlug={slug}/> : null}

      {/* VIDEOS */}
      <section className="card" style={{marginTop:12}}>
        <h3>Videos</h3>
        <div className="grid-cards" style={{marginTop:10}}>
          {videos.map(v=>(
            <video key={v.id} controls style={{width:"100%",borderRadius:12,border:"1px solid var(--line)"}}>
              <source src={supabase ? supabase.storage.from("vod").getPublicUrl(v.file_path).data.publicUrl : ""} type="video/mp4" />
            </video>
          ))}
          {!videos.length ? <div style={{opacity:.7}}>No videos yet.</div> : null}
        </div>
        {supabase ? <UploadMedia stationSlug={slug} kind="video"/> : <div style={{opacity:.7,marginTop:8}}>Sign in to upload.</div>}
      </section>

      {/* AUDIO */}
      <section className="card" style={{marginTop:12}}>
        <h3>Audio</h3>
        <div className="grid-cards" style={{marginTop:10}}>
          {audios.map(a=>(
            <audio key={a.id} controls style={{width:"100%"}}>
              <source src={supabase ? supabase.storage.from("vod").getPublicUrl(a.file_path).data.publicUrl : ""} type="audio/mpeg" />
            </audio>
          ))}
          {!audios.length ? <div style={{opacity:.7}}>No audio yet.</div> : null}
        </div>
        {supabase ? <UploadMedia stationSlug={slug} kind="audio"/> : null}
      </section>
    </main>
  );
}
'@
Save (Join-Path $tvdir "Station.jsx") $STATION

# ---- Network page: tidy tiles (buttons w/ logos) ----
$NETWORK = @'
import React from "react";
import { Link } from "react-router-dom";
import { STATIONS } from "../data/stations";

export default function Network(){
  const items = Object.values(STATIONS);
  return (
    <main className="page">
      <header style={{display:"grid",placeItems:"center",gap:10,marginTop:12}}>
        <img src="/logos/southernpowernetworklogo.png" alt="Southern Power Network" style={{width:110,height:110,objectFit:"contain",borderRadius:12,border:"1px solid var(--line)"}}/>
        <h1>Southern Power Network</h1>
        <p>Select a station below</p>
      </header>

      <section className="grid-cards" style={{marginTop:18}}>
        {items.map(s=>(
          <Link key={s.slug} to={`/tv/${s.slug}`} className="card" style={{display:"grid",placeItems:"center",padding:18}}>
            <img src={s.logo} alt={s.name} style={{maxWidth:220,maxHeight:220,objectFit:"contain"}}/>
            <div style={{marginTop:8,fontWeight:700}}>{s.name}</div>
          </Link>
        ))}
      </section>
    </main>
  );
}
'@
Save (Join-Path $pages "Network.jsx") $NETWORK

# ---- App routes: add /tv/:slug ----
$app = Join-Path $src "App.jsx"
if(Test-Path $app){
  $content = Get-Content $app -Raw
  if($content -notmatch "from \"\.\/pages\/tv\/Station\.jsx\""){
    $content = $content -replace 'import Network from "\.\/pages\/Network\.jsx";', 'import Network from "./pages/Network.jsx";
import Station from "./pages/tv/Station.jsx";'
    $content = $content -replace '(\s*<Route path="\/network"[^>]+\/>\s*)', "`$1`n        <Route path=""/tv/:slug"" element={<Station/>}/>"
    Save $app $content
  }
}

# ---- CSS tweak: gold class if missing ----
$css = Join-Path $styles "theme.css"
if(Test-Path $css){
  $c = Get-Content $css -Raw
  if($c -notmatch '\.gold'){
    Add-Content $css "`n.gold{color:var(--gold)}"
    Write-Host "🎨 Added .gold to theme.css"
  }
}

# ---- install hls.js ----
Write-Host "📦 Ensuring hls.js..." -ForegroundColor Yellow
npm i hls.js | Out-Null

Write-Host "`n✅ Station scaffold complete."
Write-Host "• Backups in: $backup" -ForegroundColor DarkGray
Write-Host "• Restart dev server if needed (Ctrl+C, npm run dev)" -ForegroundColor DarkGray
