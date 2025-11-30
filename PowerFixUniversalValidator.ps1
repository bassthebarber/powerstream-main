Write-Host "🔧 Running PowerFix Universal Validator..." -ForegroundColor Cyan

# ---------- Paths ----------
$root    = Get-Location
$src     = Join-Path $root "src"
$pages   = Join-Path $src "pages"
$comps   = Join-Path $src "components"
$styles  = Join-Path $src "styles"
$lib     = Join-Path $src "lib"
$public  = Join-Path $root "public"
$logos   = Join-Path $public "logos"
$audio   = Join-Path $public "audio"
$backup  = Join-Path $root ("ui-backup-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
$envFile = Join-Path $root ".env.local"

function Ensure-Folder([string]$p){
  if(!(Test-Path $p)){ New-Item -ItemType Directory -Path $p | Out-Null; Write-Host "📁 Created $p" -ForegroundColor DarkGray }
}
function Backup-IfExists([string]$p){
  if(Test-Path $p){
    $rel = Resolve-Path $p | Split-Path -NoQualifier
    $dst = Join-Path $backup $rel
    $dstDir = Split-Path $dst
    if(!(Test-Path $dstDir)){ New-Item -ItemType Directory -Path $dstDir | Out-Null }
    Copy-Item $p $dst -Recurse -Force
  }
}
function Save-File([string]$path, [string]$content){
  Backup-IfExists $path
  $dir = Split-Path $path
  if(!(Test-Path $dir)){ New-Item -ItemType Directory $dir | Out-Null }
  $content | Set-Content -Encoding utf8 -NoNewline -Path $path
  Write-Host "✍️  Wrote $path"
}

# ---------- Create base folders ----------
Ensure-Folder $src; Ensure-Folder $pages; Ensure-Folder $comps; Ensure-Folder $styles; Ensure-Folder $lib
Ensure-Folder $public; Ensure-Folder $logos; Ensure-Folder $audio

# ---------- Package checks (react-router-dom, supabase, dayjs) ----------
$pkgPath = Join-Path $root "package.json"
if(!(Test-Path $pkgPath)){ Write-Host "❌ package.json not found. Run this script from your frontend folder." -ForegroundColor Red; exit 1 }
$pkg = Get-Content $pkgPath | ConvertFrom-Json
$deps = @{}
if($pkg.dependencies){ $deps = $pkg.dependencies }
$need = @()
if(!$deps."react-router-dom"){ $need += "react-router-dom" }
if(!$deps."@supabase/supabase-js"){ $need += "@supabase/supabase-js" }
if(!$deps."dayjs"){ $need += "dayjs" }
if($need.Count -gt 0){
  Write-Host "⬇️  Installing missing deps: $($need -join ', ')" -ForegroundColor Yellow
  npm i $need | Out-Null
}else{
  Write-Host "✅ Dependencies OK" -ForegroundColor Green
}

# ---------- ENV setup ----------
if(!(Test-Path $envFile)){
  @"
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SOCIAL_BUCKET=social
"@ | Set-Content -Encoding utf8 $envFile
  Write-Host "📝 Created .env.local (fill in your Supabase URL and ANON KEY)" -ForegroundColor Yellow
}
$envContent = Get-Content $envFile -ErrorAction SilentlyContinue
$hasUrl  = ($envContent | Select-String -SimpleMatch "VITE_SUPABASE_URL") -ne $null
$hasKey  = ($envContent | Select-String -SimpleMatch "VITE_SUPABASE_ANON_KEY") -ne $null
$hasBuck = ($envContent | Select-String -SimpleMatch "VITE_SOCIAL_BUCKET") -ne $null
if(-not $hasUrl){ Add-Content $envFile "`nVITE_SUPABASE_URL="; Write-Host "➕ Added VITE_SUPABASE_URL placeholder" -ForegroundColor Yellow }
if(-not $hasKey){ Add-Content $envFile "`nVITE_SUPABASE_ANON_KEY="; Write-Host "➕ Added VITE_SUPABASE_ANON_KEY placeholder" -ForegroundColor Yellow }
if(-not $hasBuck){ Add-Content $envFile "`nVITE_SOCIAL_BUCKET=social"; Write-Host "➕ Added VITE_SOCIAL_BUCKET (social)" -ForegroundColor Yellow }

if(($envContent -match "VITE_SUPABASE_URL") -and ($envContent -match "VITE_SUPABASE_ANON_KEY")){
  Write-Host "✅ Supabase ENV keys appear to be set (verify values)." -ForegroundColor Green
}else{
  Write-Host "⚠️  Supply your real Supabase keys in .env.local and restart Vite." -ForegroundColor Yellow
}

# ---------- Supabase client ----------
$SUPA = @'
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn("Supabase ENV missing. UI will run, but Supabase features are disabled.");
}

export const supabase = (url && key) ? createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true }
}) : null;

export async function safeQuery(fn){
  if(!supabase) return { data:null, error:new Error("Supabase not configured") };
  try{
    const res = await fn(supabase);
    return res;
  }catch(e){
    console.error("Supabase error:", e);
    return { data:null, error:e };
  }
}
'@
Save-File (Join-Path $lib "supabaseClient.js") $SUPA
Write-Host "✅ supabaseClient.js ready." -ForegroundColor Green

# ---------- Theme ----------
$THEME = @'
:root{
  --bg:#0b0b0b;--panel:#101010;--gold:#f3b24d;--line:#c08b35;--text:#f6f1e8;--muted:#cbb79a3a;
  --radius:14px;--pad:14px;--gap:14px;--ring:0 0 0 1.5px var(--gold) inset,0 0 0 2px #000;
}
*{box-sizing:border-box}
html,body,#root{height:100%}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto}
a{color:inherit;text-decoration:none}
h1,h2,h3{margin:0 0 8px}
.page{max-width:1100px;margin:0 auto;padding:22px}
.nav{display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid var(--line);
  position:sticky;top:0;background:linear-gradient(180deg,#0b0b0bf2,#0b0b0bea);backdrop-filter:saturate(120%) blur(6px);z-index:50;}
.brand{display:flex;align-items:center;gap:8px;font-weight:700}
.logo{width:28px;height:28px;object-fit:contain}
.links{display:flex;flex-wrap:wrap;gap:10px;margin-left:auto}
.btn{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:var(--radius);
  border:1.5px solid var(--gold);background:transparent;color:var(--text);box-shadow:var(--ring)}
.btn:active{transform:translateY(1px)}
.card{border:1px solid var(--line);border-radius:var(--radius);background:var(--panel);padding:var(--pad)}
.footer{opacity:.7;text-align:center;padding:24px 16px;border-top:1px solid var(--line);margin-top:32px}
.story-rail{display:flex;gap:12px;overflow:auto;padding:10px 0 2px;margin-bottom:14px}
.story{width:120px;height:180px;border-radius:16px;border:1px solid var(--line);background:linear-gradient(#1a1a1a,#0e0e0e);display:grid;place-items:center}
.input{width:100%;padding:12px;border-radius:12px;border:1px solid var(--line);background:#0c0c0c;color:var(--text)}
.post{border:1px solid var(--line);border-radius:16px;padding:14px;margin-top:12px;background:#0e0e0e}
.spin{animation:spin 6s linear infinite}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.watermark{position:fixed;right:12px;bottom:12px;opacity:.6;width:44px;height:44px;object-fit:contain;pointer-events:none}
.section-title{display:flex;align-items:center;gap:10px;margin-top:26px;margin-bottom:10px}
.pillrow{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.grid-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px}
'@
Save-File (Join-Path $styles "theme.css") $THEME

# ---------- Header ----------
$HEADER = @'
import React from "react";
import { Link, NavLink } from "react-router-dom";

export default function Header() {
  const tab = ({ isActive }) => "btn";
  return (
    <nav className="nav">
      <Link to="/home" className="brand">
        <img className="logo" src="/logos/powerstream.png" alt="PowerStream"/>
        <span>PowerStream</span>
      </Link>
      <div className="links">
        <NavLink className={tab} to="/home">Home</NavLink>
        <NavLink className={tab} to="/feed">Feed</NavLink>
        <NavLink className={tab} to="/gram">Gram</NavLink>
        <NavLink className={tab} to="/reel">Reel</NavLink>
        <NavLink className={tab} to="/powerline">PowerLine</NavLink>
        <NavLink className={tab} to="/network">Southern Power Network</NavLink>
        <NavLink className={tab} to="/signin">Sign In</NavLink>
        <NavLink className={tab} to="/register">Register</NavLink>
      </div>
    </nav>
  );
}
'@
Save-File (Join-Path $comps "Header.jsx") $HEADER

# ---------- Home (auto-play welcome) ----------
$HOME = @'
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const audioRef = useRef(null);
  useEffect(() => {
    const el = audioRef.current; if(!el) return;
    el.volume = 1;
    el.play().catch(()=>{});
    const nudge = () => el.play().catch(()=>{});
    window.addEventListener("pointerdown", nudge, { once:true });
    return () => window.removeEventListener("pointerdown", nudge);
  }, []);

  return (
    <main className="page">
      <header style={{display:"grid",placeItems:"center",gap:12,marginTop:12}}>
        <img className="spin" src="/logos/powerstream.png" alt="PowerStream" style={{width:96,height:96,objectFit:"contain",borderRadius:12}} />
        <h1>Welcome to PowerStream</h1>
        <p>Stream Audio • Video • Live TV • Chat • Community</p>
      </header>

      <section className="pillrow" style={{marginTop:18}}>
        <Link className="btn" to="/feed"><img src="/logos/powerfeed.svg" alt="" className="logo"/>PowerFeed</Link>
        <Link className="btn" to="/gram"><img src="/logos/powergram.svg" alt="" className="logo"/>PowerGram</Link>
        <Link className="btn" to="/reel"><img src="/logos/powerreel.svg" alt="" className="logo"/>PowerReel</Link>
        <Link className="btn" to="/powerline"><img src="/logos/powerline.svg" alt="" className="logo"/>PowerLine</Link>
        <Link className="btn" to="/network"><img src="/logos/SouthernPowerNetworkLogo.png" alt="" className="logo"/>Southern Power Network</Link>
      </section>

      <div className="section-title">
        <h2>Southern Power Network</h2>
        <span style={{opacity:.6}}>(featured stations)</span>
      </div>
      <section className="grid-cards">
        <Link className="card" to="/network" style={{display:"grid",placeItems:"center"}}><img src="/logos/TexasGotTalentLogo.png" alt="Texas Got Talent" style={{maxWidth:160}}/></Link>
        <Link className="card" to="/network" style={{display:"grid",placeItems:"center"}}><img src="/logos/NoLimitEastHoustonLogo.png" alt="No Limit East Houston" style={{maxWidth:160}}/></Link>
        <Link className="card" to="/network" style={{display:"grid",placeItems:"center"}}><img src="/logos/CivicConnectLogo.png" alt="Civic Connect" style={{maxWidth:160}}/></Link>
        <Link className="card" to="/network" style={{display:"grid",placeItems:"center"}}><img src="/logos/WorldwideTV.png" alt="Worldwide TV" style={{maxWidth:160}}/></Link>
      </section>

      <img className="watermark" src="/logos/powerstream.png" alt="" />
      <audio ref={audioRef} src="/audio/alert.mp3" preload="auto" />
    </main>
  );
}
'@
Save-File (Join-Path $pages "Home.jsx") $HOME

# ---------- Network ----------
$NETWORK = @'
import React from "react";
export default function Network(){
  return (
    <main className="page">
      <header style={{display:"grid",placeItems:"center",gap:10,marginTop:12}}>
        <img src="/logos/SouthernPowerNetworkLogo.png" alt="Southern Power Network" style={{width:96,height:96,objectFit:"contain",borderRadius:12}}/>
        <h1>Southern Power Network</h1>
        <p>Select a station below</p>
      </header>
      <section className="grid-cards" style={{marginTop:18}}>
        <a className="card" href="/tv/no-limit-east-houston" style={{display:"grid",placeItems:"center"}}><img src="/logos/NoLimitEastHoustonLogo.png" alt="No Limit East Houston" style={{maxWidth:200}}/></a>
        <a className="card" href="/tv/texas-got-talent" style={{display:"grid",placeItems:"center"}}><img src="/logos/TexasGotTalentLogo.png" alt="Texas Got Talent" style={{maxWidth:200}}/></a>
        <a className="card" href="/tv/civic-connect" style={{display:"grid",placeItems:"center"}}><img src="/logos/CivicConnectLogo.png" alt="Civic Connect" style={{maxWidth:200}}/></a>
        <a className="card" href="/tv/worldwide" style={{display:"grid",placeItems:"center"}}><img src="/logos/WorldwideTV.png" alt="Worldwide TV" style={{maxWidth:200}}/></a>
      </section>
    </main>
  );
}
'@
Save-File (Join-Path $pages "Network.jsx") $NETWORK

# ---------- Feed (Supabase-aware, safe fallback) ----------
$FEED = @'
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { supabase, safeQuery } from "../lib/supabaseClient";

export default function Feed(){
  const [text,setText] = useState("");
  const [posts,setPosts] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    let active = true;
    (async ()=>{
      // Try Supabase "feed_posts" (id uuid default, text, created_at, user_name)
      const { data, error } = await safeQuery(s =>
        s.from("feed_posts").select("*").order("created_at",{ascending:false}).limit(25)
      );
      if(!active) return;
      if(!error && Array.isArray(data)){
        setPosts(data.map(r => ({
          id:r.id, text:r.text, created_at:r.created_at, user:r.user_name || "User"
        })));
      }else{
        // Fallback demo post
        setPosts([{ id: 1, user:"User", created_at:new Date().toISOString(), text:"Welcome to PowerFeed!" }]);
      }
      setLoading(false);
    })();
    return ()=>{ active = false; }
  },[]);

  const post = async () => {
    const message = text.trim();
    if(!message) return;
    setText("");
    // Try insert to Supabase, else local prepend
    if(supabase){
      const payload = { text: message, user_name:"User" };
      const { data, error } = await safeQuery(s => s.from("feed_posts").insert(payload).select().single());
      if(!error && data){
        setPosts(p=>[{ id:data.id, user:data.user_name || "User", created_at:data.created_at, text:data.text }, ...p]);
        return;
      }
    }
    setPosts(p=>[{ id: Date.now(), user:"User", created_at:new Date().toISOString(), text: message }, ...p]);
  };

  return (
    <main className="page">
      <h1>PowerFeed</h1>

      <div className="story-rail">
        {[...Array(7)].map((_,i)=>(<div key={i} className="story">Story</div>))}
      </div>

      <div className="card">
        <textarea className="input" rows={3} placeholder="What's on your mind?"
          value={text} onChange={e=>setText(e.target.value)} />
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
          <button className="btn" disabled={!text.trim()} onClick={post}>Post</button>
        </div>
      </div>

      {loading ? <p style={{opacity:.7,marginTop:10}}>Loading feed…</p> : null}

      {posts.map(p=>(
        <article key={p.id} className="post">
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{width:36,height:36,borderRadius:"50%",border:"1px solid var(--line)"}} />
            <div>
              <div style={{fontWeight:600}}>{p.user}</div>
              <div style={{opacity:.7,fontSize:12}}>{dayjs(p.created_at).format("M/D/YYYY, h:mm:ss A")}</div>
            </div>
          </div>
          <div style={{marginTop:10,whiteSpace:"pre-wrap"}}>{p.text}</div>
        </article>
      ))}

      <img className="watermark" src="/logos/powerfeed.svg" alt="" />
    </main>
  );
}
'@
Save-File (Join-Path $pages "Feed.jsx") $FEED

# ---------- Gram / Reel / PowerLine ----------
$GRAM = @'
import React from "react";
export default function Gram(){
  return (<main className="page"><h1>PowerGram</h1><p>Nothing here yet. Upload your first photo/video (coming next).</p><img className="watermark" src="/logos/powergram.svg" alt=""/></main>);
}
'@
$REEL = @'
import React from "react";
export default function Reel(){
  return (<main className="page"><h1>PowerReel</h1><p>Upload a vertical video to start (coming next).</p><img className="watermark" src="/logos/powerreel.svg" alt=""/></main>);
}
'@
$POWERLINE = @'
import React from "react";
export default function PowerLine(){
  return (<main className="page"><h1>PowerLine</h1><p>Be the first to say something!</p><img className="watermark" src="/logos/powerline.svg" alt=""/></main>);
}
'@
Save-File (Join-Path $pages "Gram.jsx") $GRAM
Save-File (Join-Path $pages "Reel.jsx") $REEL
Save-File (Join-Path $pages "PowerLine.jsx") $POWERLINE

# ---------- Auth stubs ----------
$SIGNIN = 'export default function SignIn(){return <main className="page"><h1>Sign In</h1></main>;}'
$REGISTER = 'export default function Register(){return <main className="page"><h1>Register</h1></main>;}'
Save-File (Join-Path $pages "SignIn.jsx") $SIGNIN
Save-File (Join-Path $pages "Register.jsx") $REGISTER

# ---------- App.jsx ----------
$appPath = if(Test-Path (Join-Path $src "App.jsx")){ Join-Path $src "App.jsx" } else { Join-Path $src "App.jsx" }
$APP = @'
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import Feed from "./pages/Feed.jsx";
import Gram from "./pages/Gram.jsx";
import Reel from "./pages/Reel.jsx";
import PowerLine from "./pages/PowerLine.jsx";
import Network from "./pages/Network.jsx";
import SignIn from "./pages/SignIn.jsx";
import Register from "./pages/Register.jsx";
import "./styles/theme.css";

export default function App(){
  return (
    <BrowserRouter>
      <Header/>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace/>}/>
        <Route path="/home" element={<Home/>}/>
        <Route path="/feed" element={<Feed/>}/>
        <Route path="/gram" element={<Gram/>}/>
        <Route path="/reel" element={<Reel/>}/>
        <Route path="/powerline" element={<PowerLine/>}/>
        <Route path="/network" element={<Network/>}/>
        <Route path="/signin" element={<SignIn/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="*" element={<main className="page"><h1>Not found</h1></main>}/>
      </Routes>
      <footer className="footer">© 2025 PowerStream — All Rights Reserved</footer>
    </BrowserRouter>
  );
}
'@
Save-File $appPath $APP

# ---------- main.jsx ----------
$mainPath = Join-Path $src "main.jsx"
$MAIN = @'
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
'@
Save-File $mainPath $MAIN

# ---------- Asset checks ----------
$needLogos = @(
  "powerstream.png","powerfeed.svg","powergram.svg","powerreel.svg","powerline.svg",
  "SouthernPowerNetworkLogo.png","TexasGotTalentLogo.png","NoLimitEastHoustonLogo.png",
  "CivicConnectLogo.png","WorldwideTV.png"
)
$missing = @()
foreach($f in $needLogos){ if(!(Test-Path (Join-Path $logos $f))){ $missing += $f } }
if($missing.Count -gt 0){
  Write-Host "⚠️ Missing logo files under /public/logos:" -ForegroundColor Yellow
  $missing | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
}else{
  Write-Host "✅ All expected logos present." -ForegroundColor Green
}
if(!(Test-Path (Join-Path $audio "alert.mp3"))){
  Write-Host "⚠️ /public/audio/alert.mp3 missing (Home autoplay). Place your welcome audio there." -ForegroundColor Yellow
}else{
  Write-Host "✅ Welcome audio found." -ForegroundColor Green
}

# ---------- JSX quick lint (simple heuristics) ----------
Get-ChildItem -Recurse -Include *.jsx,*.js | ForEach-Object {
  $p = $_.FullName
  $content = Get-Content $p -Raw
  if($content -match "return\s+\{" -and $content -notmatch "return\s+\(\s*<"){
    Write-Host "⚠️ Possible malformed return in $p" -ForegroundColor Yellow
  }
  if($content -match "<[^>]+[^\/]>\s*$" -and $content -notmatch "</"){
    Write-Host "⚠️ Unclosed tag suspicion in $p" -ForegroundColor Yellow
  }
}

# ---------- Final ----------
Ensure-Folder $backup # ensure folder exists if we made backups
Write-Host "`n✅ Validation & Fix Complete." -ForegroundColor Green
Write-Host "• Backups saved in: $backup" -ForegroundColor DarkGray
Write-Host "• If you added/changed .env.local, restart dev server." -ForegroundColor DarkGray
Write-Host "• Start app: npm run dev" -ForegroundColor Cyan
