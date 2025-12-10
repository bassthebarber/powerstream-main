param(
  [string]$Front = (Join-Path $PSScriptRoot "frontend")
)

function EnsureDir($p){ if(-not (Test-Path $p)){ New-Item -ItemType Directory -Force -Path $p | Out-Null } }
function BackupIfExists($p,$bk){
  if(Test-Path $p){
    EnsureDir (Split-Path $bk -Parent)
    Copy-Item $p $bk -Force
  }
}

$src     = Join-Path $Front "src"
$pages   = Join-Path $src "pages"
$layout  = Join-Path $src "layout"
$styles  = Join-Path $src "styles"
$lib     = Join-Path $src "lib"
$cg      = Join-Path $src "components\gram"
$cr      = Join-Path $src "components\reel"
$cn      = Join-Path $src "components\network"
$publicL = Join-Path $Front "public\logos"

$stamp = (Get-Date).ToString("yyyyMMdd-HHmmss")
$bkdir = Join-Path $Front ".backup-ui-$stamp"

# dirs
$dirs = @($src,$pages,$layout,$styles,$lib,$cg,$cr,$cn,$publicL)
$dirs | ForEach-Object { EnsureDir $_ }

# -------- files to write (with backups) --------
$targets = @(
  @{ path = Join-Path $src "main.jsx";         content = @'
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/app.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
'@ },
  @{ path = Join-Path $src "App.jsx";          content = @'
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout.jsx";
import Home from "./pages/Home.jsx";
import Feed from "./pages/Feed.jsx";
import Gram from "./pages/Gram.jsx";
import Reel from "./pages/Reel.jsx";
import Network from "./pages/Network.jsx";
import SignIn from "./pages/SignIn.jsx";
import Register from "./pages/Register.jsx";

export default function App(){
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/gram" element={<Gram />} />
        <Route path="/reel" element={<Reel />} />
        <Route path="/network" element={<Network />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<div className="page"><h2>Not found</h2></div>} />
      </Routes>
    </Layout>
  );
}
'@ },
  @{ path = Join-Path $layout "Layout.jsx";    content = @'
import React from "react";
import { NavLink } from "react-router-dom";

export default function Layout({ children }){
  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <img src="/logos/powerstream-logo.png" alt="" />
          <span>PowerStream</span>
        </div>
        <nav className="nav">
          <NavLink to="/home">Home</NavLink>
          <NavLink to="/feed">Feed</NavLink>
          <NavLink to="/gram">Gram</NavLink>
          <NavLink to="/reel">Reel</NavLink>
          <NavLink to="/network">Network</NavLink>
          <NavLink to="/signin">Sign In</NavLink>
          <NavLink to="/register">Register</NavLink>
        </nav>
      </header>
      <main className="page">{children}</main>
    </div>
  );
}
'@ },
  @{ path = Join-Path $styles "app.css";       content = @'
:root { --bg:#0a0a0a; --card:#121212; --text:#f3f3f3; --muted:#b9b9b9; --gold:#f6a93b; --ring:#f6a93b; }
*{ box-sizing:border-box }
html,body,#root{ height:100% }
body{ margin:0; background:var(--bg); color:var(--text); font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif }
.app{ min-height:100%; display:grid; grid-template-rows:auto 1fr }
.header{ display:flex; align-items:center; gap:16px; padding:12px 16px; border-bottom:1px solid #222; position:sticky; top:0; background:rgba(10,10,10,.9); backdrop-filter:blur(6px) }
.brand{ display:flex; align-items:center; gap:10px; font-weight:800; letter-spacing:.3px }
.brand img{ width:28px; height:28px; object-fit:contain }
.brand img:hover{ animation:spin 6s linear infinite } @keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
.nav{ display:flex; gap:10px; flex-wrap:wrap }
.nav a{ text-decoration:none; color:var(--text); border:1px solid var(--ring); padding:6px 12px; border-radius:12px }
.nav a.active,.nav a:hover{ background:#1a1205; border-color:var(--gold) }
.page{ padding:18px }
.tiles{ display:grid; gap:16px; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)) }
.tile{ background:var(--card); border:1px solid #222; border-radius:14px; padding:16px; display:block; text-decoration:none; color:var(--text) }
.tile h3{ margin:8px 0 6px; color:var(--gold) }
.thumb{ width:100%; height:140px; border-radius:10px; background:#0f0f0f; border:1px dashed #333; display:grid; place-items:center; color:var(--muted) }
.empty{ opacity:.7; font-style:italic }
'@ },
  @{ path = Join-Path $pages "Home.jsx";       content = @'
import React from "react";
import { Link } from "react-router-dom";

export default function Home(){
  return (
    <div>
      <h1>Welcome to PowerStream</h1>
      <div className="tiles">
        <Link to="/feed" className="tile">
          <div className="thumb">Facebook-style feed</div>
          <h3>Feed</h3>
          <p>Your timeline of posts, images and video.</p>
        </Link>
        <Link to="/gram" className="tile">
          <div className="thumb">Photo grid</div>
          <h3>Gram</h3>
          <p>Grid gallery from Supabase.</p>
        </Link>
        <Link to="/reel" className="tile">
          <div className="thumb">Vertical videos</div>
          <h3>Reel</h3>
          <p>Short vertical videos.</p>
        </Link>
        <Link to="/network" className="tile">
          <div className="thumb">Live & VOD</div>
          <h3>Network</h3>
          <p>TV stations and streams.</p>
        </Link>
      </div>
    </div>
  );
}
'@ },
  @{ path = Join-Path $pages "Feed.jsx";       content = @'
import React from "react";
export default function Feed(){ return <h1>PowerFeed</h1>; }
'@ },
  @{ path = Join-Path $pages "Gram.jsx";       content = @'
import React from "react";
import GramGrid from "../components/gram/GramGrid.jsx";
export default function Gram(){ return <GramGrid/>; }
'@ },
  @{ path = Join-Path $cg "GramGrid.jsx";      content = @'
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient.jsx";
import styles from "../../styles/Gram.module.css";

export default function GramGrid(){
  const [items,setItems] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("gram_gallery") // change if your table name differs
        .select("id, media_url, caption, created_at")
        .order("created_at", { ascending: false })
        .limit(60);
      if(!isMounted) return;
      if(error){ console.error(error); setItems([]); }
      else { setItems(data ?? []); }
      setLoading(false);
    })();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className={styles.wrap}>
      <h1>PowerGram</h1>
      <div className={styles.grid}>
        {loading && <div className="empty">Loading…</div>}
        {!loading && items.length === 0 && <div className="empty">No photos yet.</div>}
        {items.map(it => (
          <div className={styles.card} key={it.id}>
            <img src={it.media_url} alt={it.caption||""}/>
            {it.caption && <div className={styles.caption}>{it.caption}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
'@ },
  @{ path = Join-Path $styles "Gram.module.css"; content = @'
.wrap { padding:16px; }
.grid { display:grid; gap:12px; grid-template-columns: repeat(auto-fill, minmax(160px,1fr)); }
.card { background:#111; border:1px solid #222; border-radius:12px; overflow:hidden }
.card img{ width:100%; height:180px; object-fit:cover; display:block }
.caption{ padding:8px; color:#dcdcdc; font-size:13px }
'@ },
  @{ path = Join-Path $pages "Reel.jsx";       content = @'
import React from "react";
import ReelList from "../components/reel/ReelList.jsx";
export default function Reel(){ return <ReelList/>; }
'@ },
  @{ path = Join-Path $cr "ReelList.jsx";      content = @'
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient.jsx";
import styles from "../../styles/Reel.module.css";

export default function ReelList(){
  const [items,setItems] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    let go = true;
    (async () => {
      const { data, error } = await supabase
        .from("reels") // change if your table name differs
        .select("id, media_url, title, created_at")
        .order("created_at", { ascending:false })
        .limit(40);
      if(!go) return;
      if(error){ console.error(error); setItems([]); }
      else { setItems(data ?? []); }
      setLoading(false);
    })();
    return () => { go = false; };
  }, []);

  return (
    <div className={styles.wrap}>
      <h1>PowerReel</h1>
      {loading && <div className="empty">Loading…</div>}
      {!loading && items.length === 0 && <div className="empty">No reels yet.</div>}
      <div className={styles.list}>
        {items.map(v => (
          <div className={styles.item} key={v.id}>
            <video src={v.media_url} controls playsInline className={styles.video}/>
            {v.title && <div className={styles.title}>{v.title}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
'@ },
  @{ path = Join-Path $styles "Reel.module.css"; content = @'
.wrap{ padding:16px; }
.list{ display:grid; gap:16px; grid-template-columns: repeat(auto-fill,minmax(260px,1fr)); }
.item{ background:#111; border:1px solid #222; border-radius:12px; overflow:hidden; padding:8px }
.video{ width:100%; height:420px; object-fit:cover; display:block; background:#000 }
.title{ padding:6px 4px; color:#f3f3f3; font-size:14px }
'@ },
  @{ path = Join-Path $pages "Network.jsx";    content = @'
import React from "react";
import StationGrid from "../components/network/StationGrid.jsx";
export default function Network(){ return <StationGrid/>; }
'@ },
  @{ path = Join-Path $cn "StationGrid.jsx";   content = @'
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient.jsx";
import styles from "../../styles/Station.module.css";

export default function StationGrid(){
  const [stations,setStations] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    let ok = true;
    (async () => {
      const { data, error } = await supabase
        .from("stations") // rename if your table differs
        .select("id, name, logo_url, slug")
        .order("name", { ascending:true });
      if(!ok) return;
      if(error){ console.error(error); setStations([]); }
      else { setStations(data ?? []); }
      setLoading(false);
    })();
    return () => { ok = false; };
  }, []);

  return (
    <div className={styles.wrap}>
      <h1>Southern Power Network</h1>
      {loading && <div className="empty">Loading…</div>}
      {!loading && stations.length===0 && (
        <div className="empty">No stations yet. Seed rows like “No Limit East Houston”, “Civic Connect Radio”, “World Wide TV”.</div>
      )}
      <div className={styles.grid}>
        {stations.map(s => (
          <a className={styles.card} key={s.id} href={`/station/${s.slug||s.id}`}>
            <div className={styles.logo}>
              {s.logo_url ? <img src={s.logo_url} alt={s.name}/> : <span>{s.name?.slice(0,1)||"S"}</span>}
            </div>
            <div className={styles.name}>{s.name}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
'@ },
  @{ path = Join-Path $styles "Station.module.css"; content = @'
.wrap{ padding:16px }
.grid{ display:grid; gap:16px; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)) }
.card{ background:#111; border:1px solid #222; border-radius:12px; padding:12px; text-decoration:none; color:#f3f3f3; display:flex; align-items:center; gap:12px }
.card:hover{ border-color:#f6a93b; background:#16120a }
.logo{ width:56px; height:56px; border-radius:10px; background:#0f0f0f; border:1px dashed #333; display:grid; place-items:center; overflow:hidden }
.logo img{ width:100%; height:100%; object-fit:cover }
.name{ font-weight:700 }
'@ },
  @{ path = Join-Path $pages "SignIn.jsx";     content = @'
import React from "react";
export default function SignIn(){ return <h1>Sign In</h1>; }
'@ },
  @{ path = Join-Path $pages "Register.jsx";   content = @'
import React from "react";
export default function Register(){ return <h1>Register</h1>; }
'@ }
)

# backup + write
foreach($t in $targets){
  $bk = Join-Path $bkdir ($t.path.Substring($Front.Length+1))
  BackupIfExists $t.path $bk
  EnsureDir (Split-Path $t.path -Parent)
  Set-Content -Path $t.path -Value $t.content -Encoding UTF8
}

Write-Host "`n✅ UI files written." -ForegroundColor Green
Write-Host "Backup of replaced files: $bkdir" -ForegroundColor Yellow
Write-Host "`nNext:" -ForegroundColor Cyan
Write-Host "  1) Ensure your Supabase client exists at: $lib\supabaseClient.jsx"
Write-Host "  2) If your table names differ, edit:"
Write-Host "       gram_gallery  -> in components/gram/GramGrid.jsx"
Write-Host "       reels         -> in components/reel/ReelList.jsx"
Write-Host "       stations      -> in components/network/StationGrid.jsx"
Write-Host "  3) Put logo at:     frontend/public/logos/powerstream-logo.png"
Write-Host "  4) Restart Vite:    cd frontend; npm run dev"
