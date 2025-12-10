# ==============================
# PowerStream Fix Pack — SetupRoutesPages
# Idempotent. Backs up any file it overwrites into /frontend/ui-backup-YYYYMMDD-HHmmss
# ==============================

$Root   = Join-Path $PSScriptRoot "frontend"
$Src    = Join-Path $Root "src"
$Pages  = Join-Path $Src "pages"
$Styles = Join-Path $Src "styles"
$Lib    = Join-Path $Src "lib"
$Layout = Join-Path $Src "layout"
$Public = Join-Path $Root "public"
$Logos  = Join-Path $Public "logos"

# ---------- helpers ----------
$stamp = (Get-Date).ToString("yyyyMMdd-HHmmss")
$backupDir = Join-Path $Root "ui-backup-$stamp"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

function Save-WithBackup($Path, $Content) {
  $dir = Split-Path $Path -Parent
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  if (Test-Path $Path) {
    $rel = $Path.Replace($Root, "").TrimStart("\","/")
    $bk = Join-Path $backupDir ($rel -replace "[\\/]", "_")
    Copy-Item $Path $bk -Force
  }
  Set-Content -Path $Path -Value $Content -Encoding UTF8
}

# ---------- ensure folders ----------
@($Src,$Pages,$Styles,$Lib,$Layout,$Public,$Logos,"$Pages\auth","$Pages\network") | ForEach-Object {
  New-Item -ItemType Directory -Force -Path $_ | Out-Null
}

# ---------- index.html (root mount) ----------
$indexHtml = @'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PowerStream</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
'@
Save-WithBackup (Join-Path $Root "index.html") $indexHtml

# ---------- Supabase client (default + named) ----------
$supabaseClient = @'
import { createClient } from "@supabase/supabase-js";

const url  = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.warn("Missing Supabase envs: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(url, anon);
export default supabase;
'@
Save-WithBackup (Join-Path $Lib "supabaseClient.jsx") $supabaseClient

# ---------- global styles ----------
$globalCss = @'
:root{--gold:#ffd18a;--ink:#0b0b0b;--card:#141414}
*{box-sizing:border-box}
body{margin:0;background:#000;color:var(--gold);font-family:Inter,system-ui,Arial}
a{color:inherit}
img,video{max-width:100%;display:block}
'@
Save-WithBackup (Join-Path $Styles "global.css") $globalCss

# ---------- header styles ----------
$headerCss = @'
.headerBar{display:flex;align-items:center;gap:12px;padding:10px 14px;border-bottom:1px solid #3a2817;position:sticky;top:0;background:#0b0b0b;z-index:20}
.brand{color:#ffd18a;font-weight:700}
.nav{display:flex;gap:10px;flex-wrap:wrap}
.nav a{padding:8px 14px;border:2px solid #c8732a;border-radius:12px;color:#ffd18a;text-decoration:none}
.nav a.active{background:#c8732a;color:#0b0b0b}
.page{max-width:1100px;margin:22px auto;padding:0 14px;color:#ffd18a}
'@
Save-WithBackup (Join-Path $Styles "Header.module.css") $headerCss

# ---------- header & layout ----------
$HeaderJsx = @'
import { NavLink } from "react-router-dom";
import s from "../styles/Header.module.css";

export default function Header(){
  return (
    <header className={s.headerBar}>
      <div className={s.brand}>⚡ PowerStream</div>
      <nav className={s.nav}>
        <NavLink to="/home">Home</NavLink>
        <NavLink to="/feed">Feed</NavLink>
        <NavLink to="/gram">Gram</NavLink>
        <NavLink to="/reel">Reel</NavLink>
        <NavLink to="/line">PowerLine</NavLink>
        <NavLink to="/network">Network</NavLink>
        <NavLink to="/signin">Sign In</NavLink>
        <NavLink to="/register">Register</NavLink>
      </nav>
    </header>
  );
}
'@
Save-WithBackup (Join-Path $Layout "Header.jsx") $HeaderJsx

$LayoutJsx = @'
import Header from "./Header.jsx";
import s from "../styles/Header.module.css";

export default function Layout({children}){
  return (
    <>
      <Header />
      <main className={s.page}>{children}</main>
    </>
  );
}
'@
Save-WithBackup (Join-Path $Layout "Layout.jsx") $LayoutJsx

# ---------- router root ----------
$AppJsx = @'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout.jsx";
import Home from "./pages/Home.jsx";
import Feed from "./pages/Feed.jsx";
import Gram from "./pages/Gram.jsx";
import Reel from "./pages/Reel.jsx";
import PowerLine from "./pages/PowerLine.jsx";
import Network from "./pages/network/Network.jsx";
import SignIn from "./pages/auth/SignIn.jsx";
import Register from "./pages/auth/Register.jsx";

export default function App(){
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace/>} />
          <Route path="/home" element={<Home/>} />
          <Route path="/feed" element={<Feed/>} />
          <Route path="/gram" element={<Gram/>} />
          <Route path="/reel" element={<Reel/>} />
          <Route path="/line" element={<PowerLine/>} />
          <Route path="/network" element={<Network/>} />
          <Route path="/signin" element={<SignIn/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="*" element={<div>Not found</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
'@
Save-WithBackup (Join-Path $Src "App.jsx") $AppJsx

$MainJsx = @'
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
'@
Save-WithBackup (Join-Path $Src "main.jsx") $MainJsx

# ---------- pages ----------
$HomeJsx = @'
export default function Home(){
  return (
    <>
      <h1>Welcome to PowerStream</h1>
      <p>Stream Audio • Video • Live TV • Chat • Community</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"14px",marginTop:18}}>
        <a href="/feed" style={card()}>Facebook-style feed</a>
        <a href="/gram" style={card()}>Photo grid</a>
        <a href="/reel" style={card()}>Vertical videos</a>
        <a href="/line" style={card()}>Calls & DMs</a>
        <a href="/network" style={card()}>Live / VOD / Stations</a>
      </div>
    </>
  );
}
function card(){return{padding:"16px",border:"1px solid #3a2817",borderRadius:12,background:"#141414",textDecoration:"none",color:"#ffd18a"}}
'@
Save-WithBackup (Join-Path $Pages "Home.jsx") $HomeJsx

$FeedCss = @'
.tabs{display:flex;gap:10px;margin:8px 0 18px}
.tabs button{padding:8px 12px;border:1px solid #3a2817;background:#111;border-radius:10px;color:#ffd18a}
.tabs button.on{background:#c8732a;color:#0b0b0b}
.timeline{display:grid;gap:12px}
.post{border:1px solid #3a2817;border-radius:12px;padding:12px;background:#141414}
.masonry{column-count:3;column-gap:12px}
@media(max-width:900px){.masonry{column-count:2}}
@media(max-width:600px){.masonry{column-count:1}}
.tile{width:100%;margin:0 0 12px;border-radius:10px;border:1px solid #2b1b0f;background:#0b0b0b}
'@
Save-WithBackup (Join-Path $Pages "feed-local.css") $FeedCss

$FeedJsx = @'
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient.jsx";
import "./feed-local.css";

export default function Feed(){
  const [active,setActive]=useState("timeline");
  return (
    <>
      <h1>PowerFeed</h1>
      <div className="tabs">
        <button className={active==="timeline"?"on":""} onClick={()=>setActive("timeline")}>Timeline</button>
        <button className={active==="gallery"?"on":""} onClick={()=>setActive("gallery")}>Gallery</button>
      </div>
      {active==="timeline"? <FeedTimeline/> : <FeedGallery/>}
    </>
  );
}

function FeedTimeline(){
  const [posts,setPosts]=useState([]);
  useEffect(()=>{
    let alive=true;
    (async ()=>{
      const { data } = await supabase
        .from("feed")
        .select("id, content, media_url, created_at")
        .order("created_at",{ascending:false})
        .limit(25);
      if(alive) setPosts(data||[]);
    })();
    return ()=>{alive=false};
  },[]);
  if(!posts.length) return <p>No posts yet.</p>;
  return (
    <div className="timeline">
      {posts.map(p=>(
        <article key={p.id} className="post">
          {p.media_url && <img src={p.media_url} alt="media" />}
          <p>{p.content}</p>
          <small>{new Date(p.created_at).toLocaleString()}</small>
        </article>
      ))}
    </div>
  );
}

function FeedGallery(){
  const [media,setMedia]=useState([]);
  useEffect(()=>{
    (async ()=>{
      const { data } = await supabase
        .from("feed")
        .select("id, media_url")
        .not("media_url","is",null)
        .order("created_at",{ascending:false})
        .limit(60);
      setMedia(data||[]);
    })();
  },[]);
  if(!media.length) return <p>No media yet.</p>;
  return (
    <div className="masonry">
      {media.map(m=>(
        <img key={m.id} src={m.media_url} alt="" className="tile" />
      ))}
    </div>
  );
}
'@
Save-WithBackup (Join-Path $Pages "Feed.jsx") $FeedJsx

$GramJsx = @'
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient.jsx";

export default function Gram(){
  const [pics,setPics]=useState([]);
  useEffect(()=>{
    (async ()=>{
      const { data } = await supabase
        .from("feed")
        .select("id, media_url")
        .not("media_url","is",null)
        .order("created_at",{ascending:false})
        .limit(60);
      setPics(data||[]);
    })();
  },[]);
  return (
    <>
      <h1>PowerGram</h1>
      {!pics.length? <p>No media yet.</p> :
        <div style={{columnCount:3,columnGap:12}}>
          {pics.map(m=> <img key={m.id} src={m.media_url} style={{width:"100%",margin:"0 0 12px",borderRadius:10}}/>)}
        </div>}
    </>
  );
}
'@
Save-WithBackup (Join-Path $Pages "Gram.jsx") $GramJsx

$ReelJsx = @'
import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient.jsx";

export default function Reel(){
  const [clips,setClips]=useState([]);
  useEffect(()=>{
    (async ()=>{
      const { data } = await supabase
        .from("feed")
        .select("id, media_url, content, created_at")
        .not("media_url","is",null)
        .order("created_at",{ascending:false})
        .limit(20);
      setClips(data||[]);
    })();
  },[]);
  return (
    <>
      <h1>PowerReel</h1>
      {!clips.length? <p>No videos yet.</p> :
      <div style={{display:"grid",gap:20}}>
        {clips.map(c=> <VerticalCard key={c.id} url={c.media_url} caption={c.content}/>)}
      </div>}
    </>
  );
}

function VerticalCard({url,caption}){
  const ref = useRef(null);
  useEffect(()=>{ if(ref.current?.tagName==="VIDEO"){ ref.current.muted=true; ref.current.play().catch(()=>{});} },[]);
  const isVideo = url?.match(/\.mp4|\.webm|\.mov/i);
  return (
    <div style={{border:"1px solid #3a2817",borderRadius:16,overflow:"hidden",maxWidth:420}}>
      {isVideo? <video ref={ref} src={url} controls playsInline style={{width:"100%",aspectRatio:"9/16",background:"#000"}}/> :
                <img src={url} style={{width:"100%",aspectRatio:"9/16",objectFit:"cover"}}/>}
      {caption && <div style={{padding:10}}>{caption}</div>}
    </div>
  );
}
'@
Save-WithBackup (Join-Path $Pages "Reel.jsx") $ReelJsx

$LineJsx = @'
export default function PowerLine(){
  return (
    <>
      <h1>PowerLine</h1>
      <p>Calls & DMs will appear here. (Route wired, UI coming next.)</p>
    </>
  );
}
'@
Save-WithBackup (Join-Path $Pages "PowerLine.jsx") $LineJsx

$NetworkJsx = @'
const stations = [
  { id:"nolimit", title:"No Limit East Houston", logo:"/logos/nolimiteasthoustonlogo.png", href:"/tv/nolimit" },
  { id:"texas", title:"Texas Got Talent", logo:"/logos/texasgottalentlogo.png", href:"/tv/texas" },
  { id:"civic", title:"Civic Connect", logo:"/logos/civicconnectlogo.png", href:"/tv/civic" },
];

export default function Network(){
  return (
    <>
      <h1>Southern Power Network</h1>
      <p>Select a station below</p>
      <div style={{display:"grid",gap:14,gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))"}}>
        {stations.map(s=>(
          <a key={s.id} href={s.href} style={card()}>
            <img src={s.logo} alt={s.title} style={{height:56,objectFit:"contain"}}/>
            <div>{s.title}</div>
          </a>
        ))}
      </div>
    </>
  );
}
function card(){return{display:"grid",gap:10,alignContent:"center",padding:"16px",background:"#141414",border:"1px solid #3a2817",borderRadius:14,textDecoration:"none",color:"#ffd18a"}}
'@
Save-WithBackup (Join-Path $Pages "\network\Network.jsx") $NetworkJsx

$SignInJsx = @'
export default function SignIn(){
  return (
    <>
      <h1>Sign In</h1>
      <p>Auth UI placeholder. Hook up Supabase Auth next.</p>
    </>
  );
}
'@
Save-WithBackup (Join-Path $Pages "\auth\SignIn.jsx") $SignInJsx

$RegisterJsx = @'
export default function Register(){
  return (
    <>
      <h1>Register</h1>
      <p>Auth UI placeholder. Hook up Supabase Auth next.</p>
    </>
  );
}
'@
Save-WithBackup (Join-Path $Pages "\auth\Register.jsx") $RegisterJsx

# ---------- placeholder logos (avoid broken images) ----------
$placeholderSvg = @'
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
  <rect width="100%" height="100%" fill="#141414"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#ffd18a" font-family="Arial" font-size="18">LOGO</text>
</svg>
'@
$logoList = @(
  "powerstream-logo.png","powerfeed.svg","powergram.svg","powerreel.svg",
  "civicconnectlogo.png","nolimiteasthoustonlogo.png","texasgottalentlogo.png","southernpowerlogo.png"
)
foreach($n in $logoList){
  $p = Join-Path $Logos $n
  if(!(Test-Path $p)){ Set-Content -Path $p -Value $placeholderSvg -Encoding UTF8 }
}

Write-Host "✅ Fix Pack done."
Write-Host "Restart your dev server: cd frontend ; npm run dev"
