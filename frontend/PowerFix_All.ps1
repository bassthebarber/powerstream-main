# PowerFix_All.ps1
# One-shot repair for folders, assets, routes, pages, Supabase client, and station UIs.

$ErrorActionPreference = "Stop"

# 0) Go to frontend
if (-not (Test-Path ".\frontend")) { throw "Run this from repo root (where the 'frontend' folder is)." }
Set-Location .\frontend

# 1) Folders
$dirs = @(
  "public",
  "public\logos",
  "public\media",
  "src",
  "src\lib",
  "src\styles",
  "src\pages",
  "src\pages\network",
  "src\pages\tv"
)
$dirs | ForEach-Object { if (-not (Test-Path $_)) { New-Item -ItemType Directory -Path $_ | Out-Null } }

# 2) Placeholder PNGs (1x1 black pixel) for any missing logos
#    These remove broken image icons until you drop the real art.
$px = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="
function Ensure-Png($path) {
  if (-not (Test-Path $path)) {
    [IO.File]::WriteAllBytes($path, [Convert]::FromBase64String($px))
  }
}

$logoPaths = @(
  "public\logos\powerstream-logo.png",
  "public\logos\worldwidetv.png",
  "public\logos\powerstream-tv.png",
  "public\logos\southernpowerlogo.png",
  "public\logos\nolimiteasthoustonlogo.png",
  "public\logos\texasgottalentlogo.png",
  "public\logos\civicconnectlogo.png",
  "public\logos\powerfeed.svg",   # keep svgs too in case css references
  "public\logos\powergram.svg",
  "public\logos\powerreel.svg",
  "public\logos\powerline.png"
)
$logoPaths | ForEach-Object { Ensure-Png $_ }

# 3) .env.local – safe defaults; update URL/KEY and playback IDs after run
@'
# -------------------------
# PowerStream (frontend)
# Save as: frontend/.env.local
# -------------------------

VITE_ENV=development
VITE_SITE_URL=http://localhost:5173

# --- Supabase (REQUIRED for media/data) ---
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Optional: bucket your UI will use
VITE_SUPABASE_BUCKET=media
VITE_SOCIAL_BUCKET=social

# --- Logos (served from /public) ---
VITE_LOGO_PRIMARY=/logos/powerstream-logo.png
VITE_LOGO_WORLDWIDE_TV=/logos/worldwidetv.png
VITE_LOGO_POWERSTREAM_TV=/logos/powerstream-tv.png
VITE_LOGO_SOUTHERN_POWER_NETWORK=/logos/southernpowerlogo.png
VITE_LOGO_NO_LIMIT_EAST_HOUSTON=/logos/nolimiteasthoustonlogo.png
VITE_LOGO_TEXAS_GOT_TALENT=/logos/texasgottalentlogo.png
VITE_LOGO_CIVIC_CONNECT=/logos/civicconnectlogo.png

# --- Livepeer (replace these with real playback IDs) ---
VITE_LP_SP N=spn_playback_id_here
VITE_LP_NOLIMIT=nolimit_playback_id_here
VITE_LP_TXGT=txgt_playback_id_here
VITE_LP_CIVIC=civic_playback_id_here

# --- Optional Socket (leave blank if not using yet) ---
VITE_SOCKET_URL=
VITE_SOCKET_PATH=/socket.io

# Welcome audio (optional)
VITE_WELCOME_MP3=/media/welcome.mp3
'@ | Set-Content -NoNewline ".env.local" -Encoding UTF8

# 4) Styles (gold/dark scaffold)
@'
:root {
  --bg: #0b0b0d;
  --panel: #131318;
  --card: #171820;
  --gold: #ffa74d;
  --ink: #f2f2f2;
  --muted: #b8b8c2;
  --line: #2a2a33;
}

html, body, #root { height: 100%; }
body { margin:0; background:var(--bg); color:var(--ink); font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }

.navbar {
  display:flex; align-items:center; gap:12px;
  padding:10px 14px; border-bottom:1px solid var(--line); position:sticky; top:0; background:rgba(11,11,13,.96); z-index:20;
}
.brand { display:flex; align-items:center; gap:8px; font-weight:700; }
.brand img { width:24px; height:24px; border-radius:4px; }

.pillbar { display:flex; gap:10px; flex-wrap:wrap; }
.pill {
  padding:8px 14px; border:2px solid rgba(255,167,77,.45); border-radius:12px;
  background:transparent; color:var(--ink); text-decoration:none; font-weight:600;
}
.pill.active, .pill:hover { border-color:var(--gold); box-shadow:0 0 0 2px rgba(255,167,77,.15) inset; }

.wrap { max-width:1100px; margin:0 auto; padding:24px 16px; }
.hero { display:grid; gap:14px; }
.hero h1 { margin:6px 0 4px; }
.grid { display:grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap:14px; }
.card { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:16px; }
.card h3 { margin:0 0 8px; color:var(--gold); }
.card .thumb { width:40px; height:40px; background:#000; border:1px solid var(--line); border-radius:8px; }

.section { margin-top:20px; }
.kicker { color:var(--muted); font-weight:600; letter-spacing:.2px; }
.stationHeader { display:flex; align-items:center; gap:12px; margin:8px 0 16px; }
.stationHeader img { width:40px; height:40px; border-radius:8px; }
.playerShell { background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:12px 12px 6px; }
.footerSpace { height:32px; }
'@ | Set-Content "src\styles\app.css" -Encoding UTF8

# 5) Supabase client (jsx; safe guards)
@'
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || "";
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase =
  url && key
    ? createClient(url, key, { auth: { persistSession: false } })
    : null;

// Safe helper: returns [] instead of throwing when supabase unset
export async function safeSelect(table, columns="*") {
  if (!supabase) return { data: [], error: null };
  const { data, error } = await supabase.from(table).select(columns);
  return { data: data ?? [], error };
}
'@ | Set-Content "src\lib\supabaseClient.jsx" -Encoding UTF8

# 6) Layout (Header + Router mount)
@'
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "/src/styles/app.css";

function Pill({ to, children }) {
  return (
    <NavLink to={to} className={({isActive}) => "pill" + (isActive ? " active" : "")}>
      {children}
    </NavLink>
  );
}

export default function Layout() {
  return (
    <>
      <header className="navbar">
        <div className="brand">
          <img src={import.meta.env.VITE_LOGO_PRIMARY || "/logos/powerstream-logo.png"} alt="logo"/>
          <span>PowerStream</span>
        </div>
        <nav className="pillbar">
          <Pill to="/home">Home</Pill>
          <Pill to="/feed">Feed</Pill>
          <Pill to="/gram">Gram</Pill>
          <Pill to="/reel">Reel</Pill>
          <Pill to="/line">PowerLine</Pill>
          <Pill to="/network">Network</Pill>
          <Pill to="/signin">Sign In</Pill>
          <Pill to="/register">Register</Pill>
        </nav>
      </header>
      <main className="wrap">
        <Outlet />
      </main>
    </>
  );
}
'@ | Set-Content "src\layout.jsx" -Encoding UTF8

# 7) Pages (Home, Feed, Gram, Reel, PowerLine, SignIn/Register, Network list)
@'
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const tiles = [
    { to:"/feed", title:"Facebook-style feed", logo:"/logos/powerfeed.svg" },
    { to:"/gram", title:"Photo grid", logo:"/logos/powergram.svg" },
    { to:"/reel", title:"Vertical videos", logo:"/logos/powerreel.svg" },
    { to:"/line", title:"Calls & DMs", logo:"/logos/powerline.png" },
    { to:"/network", title:"Live & VOD stations", logo:(import.meta.env.VITE_LOGO_POWERSTREAM_TV || "/logos/powerstream-tv.png") },
  ];
  return (
    <section className="hero">
      <h1>Welcome to PowerStream</h1>
      <p className="kicker">Stream Audio • Video • Live TV • Chat • Community</p>
      <div className="grid">
        {tiles.map((t,i)=>(
          <Link key={i} to={t.to} className="card">
            <div className="thumb" style={{backgroundImage:`url(${t.logo})`, backgroundSize:"cover"}} />
            <h3>{t.title}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
'@ | Set-Content "src\pages\Home.jsx" -Encoding UTF8

@'
import React, { useEffect, useState } from "react";
import { safeSelect } from "/src/lib/supabaseClient.jsx";

export default function Feed() {
  const [items,setItems] = useState([]);
  useEffect(()=>{
    (async ()=>{
      const { data } = await safeSelect("feed","id,content,media_url,created_at");
      setItems(data);
    })();
  },[]);
  return (
    <section>
      <h1>PowerFeed</h1>
      <p className="kicker">Featured Shows • AI Picks</p>
      <div className="grid section">
        {items.length===0 ? <div className="card">No media yet.</div> :
          items.map(p=>(
            <div key={p.id} className="card">
              <h3>{p.content??"Post"}</h3>
              {p.media_url && <img src={p.media_url} alt="" style={{width:"100%",borderRadius:12}}/>}
            </div>
          ))
        }
      </div>
    </section>
  );
}
'@ | Set-Content "src\pages\Feed.jsx" -Encoding UTF8

@'
import React from "react";
export default function Gram(){ return (<section><h1>PowerGram</h1><p className="kicker">Photo grid coming online</p></section>); }
'@ | Set-Content "src\pages\Gram.jsx" -Encoding UTF8

@'
import React from "react";
export default function Reel(){ return (<section><h1>PowerReel</h1><p className="kicker">Vertical videos coming online</p></section>); }
'@ | Set-Content "src\pages\Reel.jsx" -Encoding UTF8

@'
import React from "react";
export default function PowerLine(){ return (<section><h1>PowerLine</h1><p className="kicker">Calls & DMs hub</p></section>); }
'@ | Set-Content "src\pages\PowerLine.jsx" -Encoding UTF8

@'
import React from "react";
export default function SignIn(){ return (<section><h1>Sign In</h1><p className="kicker">Auth UI to be connected</p></section>); }
'@ | Set-Content "src\pages\SignIn.jsx" -Encoding UTF8

@'
import React from "react";
export default function Register(){ return (<section><h1>Register</h1><p className="kicker">Create your account</p></section>); }
'@ | Set-Content "src\pages\Register.jsx" -Encoding UTF8

@'
import React from "react";
import { Link } from "react-router-dom";

const stations = [
  { slug:"spn",  name:"Southern Power Network", logo:(import.meta.env.VITE_LOGO_SOUTHERN_POWER_NETWORK || "/logos/southernpowerlogo.png") },
  { slug:"nolimit", name:"No Limit East Houston", logo:(import.meta.env.VITE_LOGO_NO_LIMIT_EAST_HOUSTON || "/logos/nolimiteasthoustonlogo.png") },
  { slug:"texasgottalent", name:"Texas Got Talent", logo:(import.meta.env.VITE_LOGO_TEXAS_GOT_TALENT || "/logos/texasgottalentlogo.png") },
  { slug:"civicconnect", name:"Civic Connect", logo:(import.meta.env.VITE_LOGO_CIVIC_CONNECT || "/logos/civicconnectlogo.png") },
];

export default function Network(){
  return (
    <section>
      <div className="stationHeader">
        <img src={import.meta.env.VITE_LOGO_POWERSTREAM_TV || "/logos/powerstream-tv.png"} alt="tv"/>
        <h1>Southern Power Network</h1>
      </div>
      <p className="kicker">Select a station below</p>
      <div className="grid section">
        {stations.map(s=>(
          <Link key={s.slug} to={`/tv/${s.slug}`} className="card" style={{display:"flex",gap:12,alignItems:"center"}}>
            <img src={s.logo} alt="" style={{width:48,height:48,borderRadius:10}}/>
            <h3 style={{margin:0}}>{s.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
'@ | Set-Content "src\pages\network\Network.jsx" -Encoding UTF8

# 8) TV Station template + individual pages (Livepeer Player)
@'
import React from "react";
import { Player } from "@livepeer/react";

export default function Station({ logo, title, playbackId }) {
  return (
    <section>
      <div className="stationHeader">
        <img src={logo} alt="logo"/>
        <h1>{title}</h1>
      </div>

      <div className="playerShell section">
        <h3>Live</h3>
        <div style={{borderRadius:12, overflow:"hidden"}}>
          {playbackId ? (
            <Player playbackId={playbackId} autoPlay muted controls />
          ) : (
            <div style="padding:32px 12px;color:#aaa;">Add playbackId in .env.local</div>
          )}
        </div>
      </div>

      <div className="card section"><h3>Recent Uploads</h3><p className="kicker">Connect VOD later</p></div>
      <div className="footerSpace" />
    </section>
  );
}
'@ | Set-Content "src\pages\tv\Station.jsx" -Encoding UTF8

@'
import React from "react";
import Station from "./Station.jsx";
export default function SPN(){
  return (
    <Station
      logo={import.meta.env.VITE_LOGO_SOUTHERN_POWER_NETWORK || "/logos/southernpowerlogo.png"}
      title="Southern Power Network"
      playbackId={import.meta.env.VITE_LP_SPN}
    />
  );
}
'@ | Set-Content "src\pages\tv\SPN.jsx" -Encoding UTF8

@'
import React from "react";
import Station from "./Station.jsx";
export default function NoLimit(){
  return (
    <Station
      logo={import.meta.env.VITE_LOGO_NO_LIMIT_EAST_HOUSTON || "/logos/nolimiteasthoustonlogo.png"}
      title="No Limit East Houston"
      playbackId={import.meta.env.VITE_LP_NOLIMIT}
    />
  );
}
'@ | Set-Content "src\pages\tv\NoLimit.jsx" -Encoding UTF8

@'
import React from "react";
import Station from "./Station.jsx";
export default function TexasGotTalent(){
  return (
    <Station
      logo={import.meta.env.VITE_LOGO_TEXAS_GOT_TALENT || "/logos/texasgottalentlogo.png"}
      title="Texas Got Talent"
      playbackId={import.meta.env.VITE_LP_TXGT}
    />
  );
}
'@ | Set-Content "src\pages\tv\TexasGotTalent.jsx" -Encoding UTF8

@'
import React from "react";
import Station from "./Station.jsx";
export default function CivicConnect(){
  return (
    <Station
      logo={import.meta.env.VITE_LOGO_CIVIC_CONNECT || "/logos/civicconnectlogo.png"}
      title="Civic Connect"
      playbackId={import.meta.env.VITE_LP_CIVIC}
    />
  );
}
'@ | Set-Content "src\pages\tv\CivicConnect.jsx" -Encoding UTF8

# 9) App mount + routes
@'
import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./layout.jsx";
import Home from "./pages/Home.jsx";
import Feed from "./pages/Feed.jsx";
import Gram from "./pages/Gram.jsx";
import Reel from "./pages/Reel.jsx";
import PowerLine from "./pages/PowerLine.jsx";
import Network from "./pages/network/Network.jsx";
import SignIn from "./pages/SignIn.jsx";
import Register from "./pages/Register.jsx";

import SPN from "./pages/tv/SPN.jsx";
import NoLimit from "./pages/tv/NoLimit.jsx";
import TexasGotTalent from "./pages/tv/TexasGotTalent.jsx";
import CivicConnect from "./pages/tv/CivicConnect.jsx";

function App(){
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="wrap">Loading…</div>}>
        <Routes>
          <Route element={<Layout/>}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home/>} />
            <Route path="/feed" element={<Feed/>} />
            <Route path="/gram" element={<Gram/>} />
            <Route path="/reel" element={<Reel/>} />
            <Route path="/line" element={<PowerLine/>} />
            <Route path="/network" element={<Network/>} />
            <Route path="/signin" element={<SignIn/>} />
            <Route path="/register" element={<Register/>} />

            <Route path="/tv/spn" element={<SPN/>} />
            <Route path="/tv/nolimit" element={<NoLimit/>} />
            <Route path="/tv/texasgottalent" element={<TexasGotTalent/>} />
            <Route path="/tv/civicconnect" element={<CivicConnect/>} />

            <Route path="*" element={<div className="wrap">Not found</div>} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<App />);
'@ | Set-Content "src\App.jsx" -Encoding UTF8

# 10) Ensure index.html contains #root and loads App.jsx (Vite defaults)
if (-not (Test-Path "index.html")) {
@'
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PowerStream</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/App.jsx"></script>
  </body>
</html>
'@ | Set-Content "index.html" -Encoding UTF8
}

Write-Host "`n✅ FixPack complete."
Write-Host "Next steps:"
Write-Host "  1) In frontend/.env.local put your real VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
Write-Host "  2) Replace VITE_LP_* playback IDs with your Livepeer IDs."
Write-Host "  3) Drop your real logo PNGs into /frontend/public/logos/ (they're stubbed now)."
Write-Host "  4) Restart Vite: stop dev server, then run 'npm run dev'."
