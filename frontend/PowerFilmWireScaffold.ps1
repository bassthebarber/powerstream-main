Write-Host "🎬 PowerFilmWireScaffold starting..." -ForegroundColor Cyan

$root = Get-Location
$src  = Join-Path $root "src"
$pages = Join-Path $src "pages"
$films = Join-Path $pages "films"
$wire  = Join-Path $pages "wire"
$tvdir = Join-Path $pages "tv"
$comps = Join-Path $src "components"
$data  = Join-Path $src "data"
$styles = Join-Path $src "styles"
$backup = Join-Path $root ("filmwire-backup-" + (Get-Date -Format "yyyyMMdd-HHmmss"))

function Ensure([string]$p){ if(!(Test-Path $p)){ New-Item -ItemType Directory $p | Out-Null } }
function Save([string]$p,[string]$c){
  if(Test-Path $p){
    $rel = Resolve-Path $p | Split-Path -NoQualifier
    $dst = Join-Path $backup $rel
    Ensure (Split-Path $dst)
    Copy-Item $p $dst -Force
  }
  Ensure (Split-Path $p)
  $c | Set-Content -Encoding utf8 -NoNewline -Path $p
  Write-Host "✍️  $p"
}

Ensure $films; Ensure $wire; Ensure $tvdir; Ensure $comps; Ensure $data; Ensure $styles

# ---------- Data: stations (uses YOUR filenames) ----------
$STATIONS = @'
export const STATIONS = {
  "no-limit-east-houston": {
    slug: "no-limit-east-houston",
    name: "No Limit East Houston",
    logo: "/logos/nolimiteasthoustonlogo.png",
    description: "Label TV — live shows, videos, and artist audio with bios.",
    voting: false
  },
  "texas-got-talent": {
    slug: "texas-got-talent",
    name: "Texas Got Talent",
    logo: "/logos/texasgottalentlogo.png",
    description: "Live performances with real-time audience voting.",
    voting: true
  },
  "civic-connect": {
    slug: "civic-connect",
    name: "Civic Connect",
    logo: "/logos/civicconnectlogo.png",
    description: "Community TV for local cities and neighborhoods.",
    voting: false
  },
  "worldwide-tv": {
    slug: "worldwide-tv",
    name: "Worldwide TV",
    logo: "/logos/WorldwideTV.png",
    description: "Global channel directory (HLS).",
    voting: false
  }
};
'@
Save (Join-Path $data "stations.js") $STATIONS

# ---------- Components: Shelf (horizontal row) ----------
$SHELF = @'
import React from "react";
import { Link } from "react-router-dom";

export default function Shelf({ title, items=[] }) {
  return (
    <section className="card" style={{marginTop:12}}>
      <h2 style={{marginBottom:8}}>{title}</h2>
      <div className="shelf">
        {items.map(it => (
          <Link key={it.id} to={it.href || "#"} className="tile">
            <img className="poster" src={it.poster} alt={it.title}/>
            <h4 title={it.title}>{it.title}</h4>
          </Link>
        ))}
        {!items.length ? <div style={{opacity:.7}}>Nothing here yet.</div> : null}
      </div>
    </section>
  );
}
'@
Save (Join-Path $comps "Shelf.jsx") $SHELF

# ---------- Components: HLS Player (if not already) ----------
$HLS = @'
import React, { useEffect, useRef } from "react";
import Hls from "hls.js";
export default function HLSPlayer({ src, poster }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current; if(!v || !src) return;
    if (v.canPlayType("application/vnd.apple.mpegurl")) { v.src = src; }
    else if (Hls.isSupported()) { const h = new Hls(); h.loadSource(src); h.attachMedia(v); return () => h.destroy(); }
  }, [src]);
  return <video ref={ref} controls playsInline poster={poster} style={{width:"100%",borderRadius:12,border:"1px solid var(--line)",background:"#000"}}/>;
}
'@
Save (Join-Path $comps "HLSPlayer.jsx") $HLS

# ---------- Components: UploadMedia (extra fields for artist audio) ----------
$UPLOAD = @'
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function UploadMedia({ stationSlug, kind="video", extraFields=null, labelOverride=null }) {
  const [title, setTitle] = useState("");
  const [file, setFile]   = useState(null);
  const [msg, setMsg]     = useState("");

  async function onUpload(){
    setMsg("");
    if(!file){ setMsg("Pick a file."); return; }
    if(!supabase){ setMsg("Supabase not configured."); return; }
    const bucket = kind==="audio" ? "vod" : "vod";
    const path = `${stationSlug}/${kind}s/${Date.now()}-${file.name}`;
    const up = await supabase.storage.from(bucket).upload(path, file, { upsert:false });
    if(up.error){ setMsg("Upload error: " + up.error.message); return; }
    const table = (kind==="audio") ? "station_audios" : "station_videos";
    const payload = { station_slug: stationSlug, title: title || file.name, file_path: up.data.path, ...(extraFields||{}) };
    const ins = await supabase.from(table).insert(payload);
    if(ins.error){ setMsg("Saved file but failed DB row: " + ins.error.message); return; }
    setMsg("Uploaded!"); setTitle(""); setFile(null);
  }

  return (
    <div className="card" style={{marginTop:12}}>
      <h3>{labelOverride || \`Upload \${kind}\`}</h3>
      <input className="input" placeholder="Title (optional)" value={title} onChange={e=>setTitle(e.target.value)} />
      {extraFields ? extraFields.ui : null}
      <input type="file" accept={kind==="audio" ? "audio/*" : "video/*"} onChange={e=>setFile(e.target.files?.[0]||null)} style={{marginTop:8}}/>
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
        <button className="btn" onClick={onUpload} disabled={!file}>Upload</button>
      </div>
      {msg ? <div style={{opacity:.8,marginTop:8}}>{msg}</div> : null}
    </div>
  );
}
'@
Save (Join-Path $comps "UploadMedia.jsx") $UPLOAD

# ---------- Films: Gallery (Netflix-style shelves) ----------
$FILMS = @'
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Shelf from "../../components/Shelf.jsx";

export default function Gallery(){
  const [cats,setCats] = useState([]);
  const [films,setFilms] = useState([]);
  const [form,setForm] = useState({ title:"", desc:"", cat:"", poster:null, video:null });
  const [msg,setMsg] = useState("");

  useEffect(()=>{ (async()=>{
    if(!supabase){
      setCats([{id:"demo",name:"Featured"}]);
      setFilms([{id:"1",title:"Demo Film",category_id:"demo",poster:"/logos/powerstream-logo.png"}]);
      return;
    }
    const { data: c } = await supabase.from("film_categories").select("*").order("name");
    setCats(c||[]);
    const { data: f } = await supabase.from("films").select("*").order("created_at",{ascending:false}).limit(200);
    setFilms(f||[]);
  })(); },[]);

  const shelves = useMemo(()=>{
    const byCat = {};
    cats.forEach(c=>byCat[c.id] = []);
    films.forEach(f=>{
      const poster = supabase ? (supabase.storage.from("posters").getPublicUrl(f.poster_path).data.publicUrl) : f.poster;
      const href = `/films/${f.id}`;
      const title = f.title || "Untitled";
      if(!byCat[f.category_id]) byCat[f.category_id] = [];
      byCat[f.category_id].push({ id:f.id, title, poster, href });
    });
    return Object.entries(byCat).map(([id,items])=>{
      const cat = cats.find(c=>c.id===id); return { title: cat?.name || "Other", items };
    });
  },[cats,films]);

  async function uploadFilm(){
    if(!supabase){ setMsg("Supabase not configured."); return; }
    if(!form.title || !form.cat || !form.poster || !form.video){ setMsg("Fill title, category, poster, video."); return; }
    setMsg("Uploading...");

    const posterPath = `films/${Date.now()}-${form.poster.name}`;
    const videoPath  = `films/${Date.now()}-${form.video.name}`;

    const up1 = await supabase.storage.from("posters").upload(posterPath, form.poster);
    if(up1.error){ setMsg(up1.error.message); return; }
    const up2 = await supabase.storage.from("vod").upload(videoPath, form.video);
    if(up2.error){ setMsg(up2.error.message); return; }

    const ins = await supabase.from("films").insert({
      title: form.title,
      description: form.desc,
      category_id: form.cat,
      poster_path: posterPath,
      video_path: videoPath
    }).select().single();

    if(ins.error){ setMsg(ins.error.message); return; }
    setMsg("Uploaded!");
    setFilms(f=>[ins.data, ...f]);
    setForm({ title:"", desc:"", cat:"", poster:null, video:null });
  }

  return (
    <main className="page">
      <h1>PowerScreen Film</h1>
      <p>Independent filmmakers & podcast films.</p>

      {/* Upload (creator) */}
      <div className="card">
        <h3>Add a Film</h3>
        <input className="input" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
        <textarea className="input" placeholder="Description (optional)" style={{marginTop:8}} value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})}/>
        <select className="input" style={{marginTop:8}} value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})}>
          <option value="">Select category</option>
          {cats.map(c=>(<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>
        <div style={{display:"grid",gap:8,marginTop:8}}>
          <label>Poster (image) <input type="file" accept="image/*" onChange={e=>setForm({...form,poster:e.target.files?.[0]||null})}/></label>
          <label>Video (mp4/hls) <input type="file" accept="video/*" onChange={e=>setForm({...form,video:e.target.files?.[0]||null})}/></label>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
          <button className="btn" onClick={uploadFilm}>Upload</button>
        </div>
        {msg ? <div style={{opacity:.8,marginTop:8}}>{msg}</div> : null}
      </div>

      {/* Shelves */}
      {shelves.map(s=>(<Shelf key={s.title} title={s.title} items={s.items}/>))}
    </main>
  );
}
'@
Save (Join-Path $films "Gallery.jsx") $FILMS

# ---------- Films: detail player ----------
$FILM_SHOW = @'
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import HLSPlayer from "../../components/HLSPlayer.jsx";

export default function FilmDetail(){
  const { id } = useParams();
  const [film,setFilm] = useState(null);
  const [videoUrl,setVideoUrl] = useState("");

  useEffect(()=>{ (async()=>{
    if(!supabase){ setFilm({ title:"Demo Film", description:"", video_path:"" }); return; }
    const { data } = await supabase.from("films").select("*").eq("id", id).single();
    setFilm(data||null);
    if(data?.video_path){
      const pub = supabase.storage.from("vod").getPublicUrl(data.video_path).data.publicUrl;
      setVideoUrl(pub);
    }
  })(); },[id]);

  if(!film) return <main className="page"><h1>Not found</h1></main>;

  return (
    <main className="page">
      <h1>{film.title}</h1>
      <div style={{opacity:.8,marginBottom:8}}>{film.description}</div>
      {videoUrl ? <video controls style={{width:"100%",borderRadius:12,border:"1px solid var(--line)"}} src={videoUrl}/> : <div className="card">No video URL.</div>}
    </main>
  );
}
'@
Save (Join-Path $films "FilmDetail.jsx") $FILM_SHOW

# ---------- Wire: podcasts page ----------
$WIRE = @'
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Wire(){
  const [pods,setPods] = useState([]);
  const [eps,setEps] = useState({});
  const [form,setForm] = useState({ title:"", desc:"", cover:null });
  const [ep,setEp] = useState({ podcast_id:"", title:"", audio:null, desc:"" });
  const [msg,setMsg] = useState("");

  useEffect(()=>{ (async()=>{
    if(!supabase){ setPods([{id:"demo",title:"Demo Podcast"}]); setEps({ demo:[{id:"e1",title:"Episode 1"}]}); return; }
    const { data: p } = await supabase.from("podcasts").select("*").order("created_at",{ascending:false});
    setPods(p||[]);
    const map = {}; for(const pod of (p||[])){
      const { data: e } = await supabase.from("podcast_episodes").select("*").eq("podcast_id", pod.id).order("published_at",{ascending:false});
      map[pod.id] = e||[];
    } setEps(map);
  })(); },[]);

  async function createPodcast(){
    if(!supabase){ setMsg("Supabase not configured."); return; }
    if(!form.title){ setMsg("Title required"); return; }
    let coverPath = null;
    if(form.cover){
      coverPath = `podcasts/${Date.now()}-${form.cover.name}`;
      const up = await supabase.storage.from("posters").upload(coverPath, form.cover);
      if(up.error){ setMsg(up.error.message); return; }
    }
    const ins = await supabase.from("podcasts").insert({ title: form.title, description: form.desc, cover_path: coverPath }).select().single();
    if(ins.error){ setMsg(ins.error.message); return; }
    setPods(p=>[ins.data, ...p]); setForm({ title:"", desc:"", cover:null }); setMsg("Podcast created.");
  }

  async function addEpisode(){
    if(!supabase){ setMsg("Supabase not configured."); return; }
    if(!ep.podcast_id || !ep.title || !ep.audio){ setMsg("Pick podcast, title, and audio file."); return; }
    const audioPath = `podcasts/${ep.podcast_id}/${Date.now()}-${ep.audio.name}`;
    const up = await supabase.storage.from("vod").upload(audioPath, ep.audio);
    if(up.error){ setMsg(up.error.message); return; }
    const ins = await supabase.from("podcast_episodes").insert({ podcast_id: ep.podcast_id, title: ep.title, audio_path: audioPath, description: ep.desc }).select().single();
    if(ins.error){ setMsg(ins.error.message); return; }
    setEps(m=>({ ...m, [ep.podcast_id]: [ins.data, ...(m[ep.podcast_id]||[])] })); setEp({ podcast_id:"", title:"", audio:null, desc:"" }); setMsg("Episode uploaded.");
  }

  return (
    <main className="page">
      <h1>PowerScreen Wire (Podcasts)</h1>

      {/* Create podcast */}
      <div className="card">
        <h3>Create Podcast</h3>
        <input className="input" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
        <textarea className="input" placeholder="Description (optional)" style={{marginTop:8}} value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})}/>
        <label style={{marginTop:8,display:"block"}}>Cover (image) <input type="file" accept="image/*" onChange={e=>setForm({...form,cover:e.target.files?.[0]||null})}/></label>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button className="btn" onClick={createPodcast}>Create</button></div>
      </div>

      {/* Add episode */}
      <div className="card" style={{marginTop:12}}>
        <h3>Upload Episode</h3>
        <select className="input" value={ep.podcast_id} onChange={e=>setEp({...ep,podcast_id:e.target.value})}>
          <option value="">Choose podcast</option>
          {pods.map(p=>(<option key={p.id} value={p.id}>{p.title}</option>))}
        </select>
        <input className="input" placeholder="Episode title" style={{marginTop:8}} value={ep.title} onChange={e=>setEp({...ep,title:e.target.value})}/>
        <textarea className="input" placeholder="Description (optional)" style={{marginTop:8}} value={ep.desc} onChange={e=>setEp({...ep,desc:e.target.value})}/>
        <label style={{marginTop:8,display:"block"}}>Audio file <input type="file" accept="audio/*" onChange={e=>setEp({...ep,audio:e.target.files?.[0]||null})}/></label>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button className="btn" onClick={addEpisode}>Upload</button></div>
      </div>

      {/* List */}
      {pods.map(p=>(
        <section key={p.id} className="card" style={{marginTop:12}}>
          <h2>{p.title}</h2>
          <div style={{opacity:.8}}>{p.description}</div>
          <div className="shelf" style={{marginTop:8}}>
            {(eps[p.id]||[]).map(e=>(
              <div key={e.id} className="tile" style={{width:260}}>
                <div style={{padding:10}}>
                  <div style={{fontWeight:700}}>{e.title}</div>
                  <audio controls style={{width:"100%",marginTop:8}}>
                    <source src={supabase ? supabase.storage.from("vod").getPublicUrl(e.audio_path).data.publicUrl : ""} type="audio/mpeg"/>
                  </audio>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
'@
Save (Join-Path $wire "Wire.jsx") $WIRE

# ---------- Station page (update): artist fields for No Limit + Worldwide channels grid ----------
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
  const [channels, setChannels] = useState([]);

  // artist fields for No Limit
  const [artistName, setArtistName] = useState("");
  const [artistBio, setArtistBio] = useState("");

  useEffect(()=>{ (async()=>{
    if(!station) return;
    if(supabase){
      const { data: profile } = await supabase.from("profiles").select("role").limit(1).single();
      setIsAdmin(profile?.role === "admin");
      const { data: s } = await supabase.from("stations").select("live_hls_url").eq("slug", slug).single();
      if(s?.live_hls_url) setLiveUrl(s.live_hls_url);
      const { data: vs } = await supabase.from("station_videos").select("*").eq("station_slug", slug).order("created_at",{ascending:false}).limit(24);
      setVideos(vs||[]);
      const { data: as } = await supabase.from("station_audios").select("*").eq("station_slug", slug).order("created_at",{ascending:false}).limit(24);
      setAudios(as||[]);
      if(slug === "worldwide-tv"){
        const { data: ch } = await supabase.from("channels").select("*").order("name");
        setChannels(ch||[]);
      }
    }
  })(); },[slug]);

  if(!station){ return <main className="page"><h1>Station not found</h1></main>; }

  const saveLiveUrl = async ()=>{ if(supabase) await supabase.from("stations").upsert({ slug, live_hls_url: liveUrl }, { onConflict:"slug" }); };

  const artistUI = slug==="no-limit-east-houston" ? {
    ui: (
      <div style={{display:"grid",gap:8,marginTop:8}}>
        <input className="input" placeholder="Artist name" value={artistName} onChange={e=>setArtistName(e.target.value)} />
        <textarea className="input" placeholder="Artist bio (optional)" value={artistBio} onChange={e=>setArtistBio(e.target.value)} />
      </div>
    )
  } : null;

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
        {liveUrl ? <HLSPlayer src={liveUrl}/> : <div style={{opacity:.8}}>Live not set.</div>}
        {isAdmin ? (
          <div style={{marginTop:10,display:"grid",gap:8}}>
            <input className="input" placeholder="HLS playback URL" value={liveUrl} onChange={e=>setLiveUrl(e.target.value)} />
            <div style={{display:"flex",gap:8}}>
              <button className="btn" onClick={saveLiveUrl}>Save</button>
              <a className="btn" href="https://livepeer.studio/" target="_blank" rel="noreferrer">Get Stream Key</a>
            </div>
          </div>
        ) : null}
      </section>

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
        {supabase ? <UploadMedia stationSlug={slug} kind="video"/> : null}
      </section>

      {/* AUDIO (with artist fields on No Limit) */}
      <section className="card" style={{marginTop:12}}>
        <h3>Audio</h3>
        <div className="grid-cards" style={{marginTop:10}}>
          {audios.map(a=>(
            <div key={a.id} className="card">
              <div style={{fontWeight:700}}>{a.title} {a.artist_name ? "• " + a.artist_name : ""}</div>
              {a.artist_bio ? <div style={{opacity:.7, marginTop:4}}>{a.artist_bio}</div> : null}
              <audio controls style={{width:"100%",marginTop:8}}>
                <source src={supabase ? supabase.storage.from("vod").getPublicUrl(a.file_path).data.publicUrl : ""} type="audio/mpeg" />
              </audio>
            </div>
          ))}
          {!audios.length ? <div style={{opacity:.7}}>No audio yet.</div> : null}
        </div>
        {supabase ? <UploadMedia stationSlug={slug} kind="audio" labelOverride="Upload track" extraFields={{ ui: artistUI?.ui, artist_name: artistName, artist_bio: artistBio }}/> : null}
      </section>

      {/* WORLDWIDE TV: channel grid */}
      {slug==="worldwide-tv" ? (
        <section className="card" style={{marginTop:12}}>
          <h3>Channels</h3>
          <div className="grid-cards" style={{marginTop:10}}>
            {channels.map(c=>(
              <a key={c.id} className="card" href={c.hls_url} target="_blank" rel="noreferrer" title={c.name} style={{display:"grid",placeItems:"center"}}>
                {c.logo_path ? <img src={supabase ? supabase.storage.from("posters").getPublicUrl(c.logo_path).data.publicUrl : c.logo_path} alt={c.name} style={{maxWidth:180,maxHeight:120,objectFit:"contain"}}/> : <div style={{fontWeight:700}}>{c.name}</div>}
              </a>
            ))}
            {!channels.length ? <div style={{opacity:.7}}>Add channels in Supabase “channels” table.</div> : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
'@
Save (Join-Path $tvdir "Station.jsx") $STATION

# ---------- Network: smaller logos ----------
$NETWORK = @'
import React from "react";
import { Link } from "react-router-dom";
import { STATIONS } from "../data/stations";

export default function Network(){
  const items = Object.values(STATIONS);
  return (
    <main className="page">
      <header style={{display:"grid",placeItems:"center",gap:10,marginTop:12}}>
        <img src="/logos/southernpowernetworklogo.png" alt="Southern Power Network" style={{width:100,height:100,objectFit:"contain",borderRadius:12,border:"1px solid var(--line)"}}/>
        <h1>Southern Power Network</h1>
        <p>Select a station below</p>
      </header>

      <section className="grid-cards" style={{marginTop:18}}>
        {items.map(s=>(
          <Link key={s.slug} to={`/tv/${s.slug}`} className="card" style={{display:"grid",placeItems:"center",padding:18}}>
            <img src={s.logo} alt={s.name} style={{maxWidth:180,maxHeight:160,objectFit:"contain"}}/>
            <div style={{marginTop:8,fontWeight:700}}>{s.name}</div>
          </Link>
        ))}
      </section>
    </main>
  );
}
'@
Save (Join-Path $pages "Network.jsx") $NETWORK

# ---------- Films: route + Wire route + TV route in App.jsx ----------
$app = Join-Path $src "App.jsx"
if(Test-Path $app){
  $c = Get-Content $app -Raw
  if($c -notmatch 'from "\.\/pages\/films\/Gallery\.jsx"'){
    $c = $c -replace 'import Network from "\.\/pages\/Network\.jsx";', 'import Network from "./pages/Network.jsx";
import Gallery from "./pages/films/Gallery.jsx";
import FilmDetail from "./pages/films/FilmDetail.jsx";
import Wire from "./pages/wire/Wire.jsx";
import Station from "./pages/tv/Station.jsx";'
    $c = $c -replace '</Routes>', '        <Route path="/films" element={<Gallery/>}/>
        <Route path="/films/:id" element={<FilmDetail/>}/>
        <Route path="/wire" element={<Wire/>}/>
        <Route path="/tv/:slug" element={<Station/>}/>
      </Routes>'
    Save $app $c
  }
}

# ---------- Header: add nav to Films/Wire ----------
$hdr = Join-Path $src "components/Header.jsx"
if(Test-Path $hdr){
  $h = Get-Content $hdr -Raw
  if($h -notmatch 'to="\/films"'){ $h = $h -replace '(NavLink className=\{tab\} to="\/reel">Reel<\/NavLink>\s*)', "$1`n        <NavLink className={tab} to=\"/films\">Films</NavLink>`n        <NavLink className={tab} to=\"/wire\">Wire</NavLink>" ; Save $hdr $h }
}

# ---------- CSS tweaks: Netflix shelves + consistent tile sizing ----------
$css = Join-Path $styles "theme.css"
$add = @'
/* --- Film shelves / tiles --- */
.shelf{display:flex;gap:12px;overflow:auto;padding:4px 2px 8px}
.tile{width:190px;min-width:190px;border:1px solid var(--line);border-radius:12px;background:#0e0e0e;box-shadow:var(--ring)}
.tile .poster{width:100%;height:270px;object-fit:cover;border-bottom:1px solid var(--line)}
.tile h4{margin:8px 10px 10px;font-size:14px;line-height:1.2}
'@
if(Test-Path $css){ Add-Content $css "`n$add"; Write-Host "🎨 CSS shelves added" }

# ---------- deps ----------
Write-Host "📦 Ensuring hls.js..." -ForegroundColor Yellow
npm i hls.js | Out-Null

Write-Host "`n✅ PowerFilmWireScaffold complete."
Write-Host "• Backups in: $backup" -ForegroundColor DarkGray
Write-Host "• Restart dev server if needed (Ctrl+C, npm run dev)" -ForegroundColor DarkGray
