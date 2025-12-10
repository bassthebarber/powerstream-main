# MasterFix.PowerStream.ps1
Write-Host "🔧 PowerStream Master Fix – UI + Routing + Posting" -ForegroundColor Yellow

# --- Paths -------------------------------------------------
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$src        = Join-Path $root "src"
$pages      = Join-Path $src  "pages"
$networkDir = Join-Path $pages "network"
$spnHubDir  = Join-Path $networkDir "southern-power-network"
$texasDir   = Join-Path $spnHubDir "texas-got-talent"
$nlehDir    = Join-Path $spnHubDir "no-limit-east-houston"
$civicDir   = Join-Path $spnHubDir "civic-connect"

$components = Join-Path $src "components"
$services   = Join-Path $src "services"
$styles     = Join-Path $src "styles"

$public     = Join-Path $root "public"
$logos      = Join-Path $public "logos"
$audio      = Join-Path $public "audio"

# --- Ensure folders ----------------------------------------
$dirs = @($src,$pages,$networkDir,$spnHubDir,$texasDir,$nlehDir,$civicDir,$components,$services,$styles,$public,$logos,$audio)
$dirs | ForEach-Object {
  if (-not (Test-Path $_)) { New-Item -ItemType Directory -Path $_ | Out-Null }
}

# --- THEME (Black & Gold) ----------------------------------
$themeCss = @'
:root{
  --ps-bg: #000;
  --ps-surface: #0b0b0b;
  --ps-card:#111;
  --ps-gold:#d4a537;
  --ps-gold-2:#f0c36a;
  --ps-text:#fff;
  --ps-muted:#aaa;
  --ps-border:#d4a53788;
}

*{box-sizing:border-box}
html,body,#root{height:100%}
body{
  margin:0;
  background:var(--ps-bg);
  color:var(--ps-text);
  font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif;
}

a{color:var(--ps-gold); text-decoration:none;}
a:hover{ text-decoration:underline; }

.container{
  min-height:100vh;
  padding:20px 16px 120px;
  max-width:1100px;
  margin:0 auto;
}

.navbar{
  display:flex; align-items:center; gap:20px; flex-wrap:wrap;
  padding:12px 16px; border:1px solid var(--ps-border);
  border-radius:14px; background:linear-gradient(180deg,rgba(212,165,55,.08),rgba(212,165,55,.02));
  position:sticky; top:0; z-index:5; backdrop-filter: blur(6px);
}
.brand{ font-weight:800; letter-spacing:.3px }
.navbar a{ font-weight:700; padding:6px 10px; border-radius:10px }
.navbar a.active{ background:var(--ps-card); border:1px solid var(--ps-border); }

.right{ margin-left:auto; display:flex; gap:10px; align-items:center }
.button{
  display:inline-flex; align-items:center; gap:8px;
  padding:8px 14px; border-radius:12px; font-weight:700;
  background:transparent; color:var(--ps-gold); border:1px solid var(--ps-border); cursor:pointer;
}
.button:hover{ background:#111 }
.card{
  border:1px solid var(--ps-border); border-radius:16px; padding:16px 18px;
  background:var(--ps-card); box-shadow: 0 0 0 1px rgba(212,165,55,.05), 0 10px 30px rgba(0,0,0,.35);
}

.grid{
  display:grid; gap:16px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  margin:18px 0 30px;
}

.title{ text-align:center; font-size:32px; font-weight:900; margin:10px 0 8px; }
.subtitle{ text-align:center; color:var(--ps-muted); margin:0 0 16px; }

.logoBox{ display:flex; justify-content:center; margin:24px 0 10px }
.logo{ width:180px; height:180px; object-fit:contain; border-radius:14px; background:#070707; border:1px solid var(--ps-border) }
.logo.spinOnce{ animation: spin 1.4s ease-out 1; }
@keyframes spin{ from{ transform:rotate(0deg) } to{ transform:rotate(360deg) } }

.postComposer{ margin:12px 0 20px }
.postComposer form{ display:flex; flex-direction:column; gap:10px }
.postComposer input,.postComposer textarea{
  background:#0c0c0c; color:var(--ps-text); border:1px solid var(--ps-border);
  border-radius:10px; padding:10px 12px; resize:vertical;
}
.postComposer .row{ display:flex; gap:10px; flex-wrap:wrap }
.postComposer .row input{ flex:1 }

.postList{ display:flex; flex-direction:column; gap:14px }
.post{
  background:#0c0c0c; border:1px solid var(--ps-border); border-radius:14px; padding:14px;
}
.post .meta{ color:var(--ps-muted); font-size:12px; margin-bottom:6px }

footer.appFooter{
  position:fixed; left:0; right:0; bottom:0;
  padding:10px 20px; text-align:center; color:var(--ps-gold);
  border-top:1px solid var(--ps-border); background:rgba(0,0,0,.6); backdrop-filter:blur(6px);
}
'@
Set-Content -Path (Join-Path $styles "ps-theme.css") -Value $themeCss -Encoding utf8

# --- FOOTER (single) --------------------------------------
$footer = @'
export default function Footer(){
  return <footer className="appFooter">© 2025 PowerStream</footer>;
}
'@
Set-Content (Join-Path $components "Footer.jsx") $footer -Encoding utf8

# --- AUTH (simple local storage demo) ---------------------
$auth = @'
import { createContext, useContext, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }){
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ps.user")) } catch { return null }
  });

  const signIn = (email="guest@powerstream"){ 
    const u = { email }; 
    setUser(u); localStorage.setItem("ps.user", JSON.stringify(u));
  };
  const signOut = () => { setUser(null); localStorage.removeItem("ps.user"); };

  return <AuthCtx.Provider value={{ user, signIn, signOut }}>{children}</AuthCtx.Provider>;
}
export function useAuth(){ return useContext(AuthCtx); }
'@
Set-Content (Join-Path $services "auth.js") $auth -Encoding utf8

# --- Post Composer / List ---------------------------------
$postComposer = @'
import { useState } from "react";
import { useAuth } from "../services/auth";

export default function PostComposer({ storageKey }){
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const save = (e) => {
    e.preventDefault();
    if(!user){ alert("Sign in first."); return; }
    const post = {
      id: crypto.randomUUID(),
      text: text.trim(),
      videoUrl: videoUrl.trim(), // paste a link (YouTube, MP4, etc.)
      author: user.email,
      createdAt: Date.now()
    };
    const list = JSON.parse(localStorage.getItem(storageKey) || "[]");
    list.unshift(post);
    localStorage.setItem(storageKey, JSON.stringify(list));
    setText(""); setVideoUrl("");
  };

  return (
    <div className="card postComposer">
      <form onSubmit={save}>
        <textarea rows={3} placeholder="What's on your mind?" value={text} onChange={e=>setText(e.target.value)} required />
        <div className="row">
          <input type="url" placeholder="Optional: paste video URL (mp4/YouTube)" value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} />
          <button className="button" type="submit">Post</button>
        </div>
      </form>
    </div>
  );
}
'@
Set-Content (Join-Path $components "PostComposer.jsx") $postComposer -Encoding utf8

$postList = @'
export default function PostList({ storageKey }){
  const posts = JSON.parse(localStorage.getItem(storageKey) || "[]");
  if(!posts.length) return <p className="card">No posts yet.</p>;
  return (
    <div className="postList">
      {posts.map(p=>(
        <article key={p.id} className="post">
          <div className="meta">{new Date(p.createdAt).toLocaleString()} — {p.author}</div>
          <div>{p.text}</div>
          {p.videoUrl && (
            p.videoUrl.includes("youtube.com") || p.videoUrl.includes("youtu.be")
              ? <div style={{marginTop:8}}>
                  <iframe width="100%" height="320" src={toEmbed(p.videoUrl)} title="video" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen />
                </div>
              : <video style={{marginTop:8, width:"100%", maxHeight:420}} src={p.videoUrl} controls />
          )}
        </article>
      ))}
    </div>
  );
}

function toEmbed(url){
  try{
    if(url.includes("watch?v=")) return url.replace("watch?v=","embed/");
    if(url.includes("youtu.be/")) return url.replace("youtu.be/","www.youtube.com/embed/");
    return url;
  }catch{ return url; }
}
'@
Set-Content (Join-Path $components "PostList.jsx") $postList -Encoding utf8

# --- PAGES (Feed, Gram, Reel, Home, Network, PowerLine) ---
$home = @'
import { useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../services/auth";

export default function Home(){
  const { user } = useAuth();
  const audioRef = useRef(null);

  useEffect(()=>{
    const a = audioRef.current;
    if(!a) return;
    // try to play once; browsers may block without user gesture
    a.play().catch(()=>{/* ignore – button will work */});
  },[]);

  return (
    <div className="container">
      <div className="navbar">
        <strong className="brand">PowerStream</strong>
        <NavLink to="/home">Home</NavLink>
        <NavLink to="/feed">Feed</NavLink>
        <NavLink to="/gram">Gram</NavLink>
        <NavLink to="/reel">Reel</NavLink>
        <NavLink to="/network">Network</NavLink>
        <NavLink to="/powerline">PowerLine</NavLink>
        <div className="right">
          <button className="button" onClick={()=>audioRef.current?.play()}>Play welcome</button>
          <span style={{color:"var(--ps-muted)"}}>{user ? user.email : "Guest"}</span>
        </div>
      </div>

      <div className="logoBox">
        <img src="/logos/powerstreamlogo.svg" alt="PowerStream" className="logo spinOnce" />
      </div>
      <h2 className="title">PowerStream</h2>
      <p className="subtitle">TV • Feed • Gram • Reel • Network • PowerLine</p>

      <audio ref={audioRef} preload="auto">
        <source src="/audio/welcome-voice.mp3" type="audio/mpeg" />
        <source src="/audio/welcome-voice.m4a" type="audio/mp4" />
      </audio>

      <div className="grid">
        <Link className="card" to="/feed">PowerFeed</Link>
        <Link className="card" to="/gram">PowerGram</Link>
        <Link className="card" to="/reel">PowerReel</Link>
        <Link className="card" to="/network">Southern Power Network</Link>
        <Link className="card" to="/network/texas-got-talent">Texas Got Talent</Link>
        <Link className="card" to="/network/no-limit-east-houston">No Limit East Houston</Link>
        <Link className="card" to="/network/civic-connect">Civic Connect</Link>
        <Link className="card" to="/powerline">PowerLine</Link>
      </div>
    </div>
  );
}
'@
Set-Content (Join-Path $pages "Home.jsx") $home -Encoding utf8

$feed = @'
import PostComposer from "../components/PostComposer";
import PostList from "../components/PostList";

export default function Feed(){
  return (
    <div className="container">
      <div className="logoBox"><img className="logo" src="/logos/powerfeed.svg" alt="PowerFeed" /></div>
      <h2 className="title">PowerFeed</h2>
      <PostComposer storageKey="ps.posts.feed" />
      <PostList storageKey="ps.posts.feed" />
    </div>
  );
}
'@
Set-Content (Join-Path $pages "Feed.jsx") $feed -Encoding utf8

$gram = @'
import PostComposer from "../components/PostComposer";
import PostList from "../components/PostList";

export default function Gram(){
  return (
    <div className="container">
      <div className="logoBox"><img className="logo" src="/logos/powergram.svg" alt="PowerGram" /></div>
      <h2 className="title">PowerGram</h2>
      <PostComposer storageKey="ps.posts.gram" />
      <PostList storageKey="ps.posts.gram" />
    </div>
  );
}
'@
Set-Content (Join-Path $pages "Gram.jsx") $gram -Encoding utf8

$reel = @'
import PostComposer from "../components/PostComposer";
import PostList from "../components/PostList";

export default function Reel(){
  return (
    <div className="container">
      <div className="logoBox"><img className="logo" src="/logos/powerreel.svg" alt="PowerReel" /></div>
      <h2 className="title">PowerReel</h2>
      <PostComposer storageKey="ps.posts.reel" />
      <PostList storageKey="ps.posts.reel" />
    </div>
  );
}
'@
Set-Content (Join-Path $pages "Reel.jsx") $reel -Encoding utf8

$network = @'
import { Link } from "react-router-dom";

export default function Network(){
  return (
    <div className="container">
      <div className="logoBox"><img className="logo" src="/logos/southernpowernetworklogo.svg" alt="SPN" /></div>
      <h2 className="title">Southern Power Network</h2>
      <div className="grid">
        <Link className="card" to="/network/texas-got-talent"><strong>Texas Got Talent</strong></Link>
        <Link className="card" to="/network/no-limit-east-houston"><strong>No Limit East Houston</strong></Link>
        <Link className="card" to="/network/civic-connect"><strong>Civic Connect</strong></Link>
      </div>
    </div>
  );
}
'@
Set-Content (Join-Path $pages "Network.jsx") $network -Encoding utf8

$texas = @'
export default function TexasGotTalent(){
  return (
    <div className="container">
      <div className="logoBox"><img className="logo" src="/logos/texasgottalentlogo.svg" alt="Texas Got Talent" /></div>
      <h2 className="title">Texas Got Talent</h2>
      <p className="subtitle">Upload auditions and let fans vote.</p>
      <div className="card"><p>Upload / Vote / Admin pages can be wired next.</p></div>
    </div>
  );
}
'@
Set-Content (Join-Path $texasDir "index.jsx") $texas -Encoding utf8

$nleh = @'
export default function NoLimitEastHouston(){
  return (
    <div className="container">
      <div className="logoBox"><img className="logo" src="/logos/nolimiteasthoustonlogo.svg" alt="No Limit East Houston" /></div>
      <h2 className="title">No Limit East Houston</h2>
      <p className="subtitle">The takeover is real — No limit to the movement.</p>
    </div>
  );
}
'@
Set-Content (Join-Path $nlehDir "index.jsx") $nleh -Encoding utf8

$civic = @'
export default function CivicConnect(){
  return (
    <div className="container">
      <div className="logoBox"><img className="logo" src="/logos/civicconnectlogo.svg" alt="Civic Connect" /></div>
      <h2 className="title">Civic Connect</h2>
      <p className="subtitle">Broadcasting local power — by the people, for the people.</p>
    </div>
  );
}
'@
Set-Content (Join-Path $civicDir "index.jsx") $civic -Encoding utf8

$powerline = @'
export default function PowerLine(){
  return (
    <div className="container">
      <div className="logoBox"><img className="logo" src="/logos/powerline.svg" alt="PowerLine" /></div>
      <h2 className="title">PowerLine Messenger</h2>
      <div className="card">Real-time chat coming soon.</div>
    </div>
  );
}
'@
Set-Content (Join-Path $pages "PowerLine.jsx") $powerline -Encoding utf8

# --- APP + MAIN (Router fixed, single footer) --------------
$app = @'
import { Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Feed from "./pages/Feed.jsx";
import Gram from "./pages/Gram.jsx";
import Reel from "./pages/Reel.jsx";
import Network from "./pages/Network.jsx";
import TexasGotTalent from "./pages/network/southern-power-network/texas-got-talent/index.jsx";
import NoLimitEastHouston from "./pages/network/southern-power-network/no-limit-east-houston/index.jsx";
import CivicConnect from "./pages/network/southern-power-network/civic-connect/index.jsx";
import PowerLine from "./pages/PowerLine.jsx";
import Footer from "./components/Footer.jsx";
import { useAuth } from "./services/auth";

function TopBar(){
  const { user, signIn, signOut } = useAuth();
  return (
    <div className="navbar">
      <strong className="brand">PowerStream</strong>
      <NavLink to="/home">Home</NavLink>
      <NavLink to="/feed">Feed</NavLink>
      <NavLink to="/gram">Gram</NavLink>
      <NavLink to="/reel">Reel</NavLink>
      <NavLink to="/network">Network</NavLink>
      <NavLink to="/powerline">PowerLine</NavLink>
      <div className="right">
        {user ? (
          <>
            <span style={{color:"var(--ps-muted)"}}>{user.email}</span>
            <button className="button" onClick={signOut}>Sign out</button>
          </>
        ) : (
          <button className="button" onClick={()=>signIn(prompt("Email for sign in","owner@powerstream"))}>Sign in</button>
        )}
      </div>
    </div>
  );
}

export default function App(){
  return (
    <>
      <TopBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/gram" element={<Gram />} />
        <Route path="/reel" element={<Reel />} />
        <Route path="/network" element={<Network />} />
        <Route path="/network/texas-got-talent" element={<TexasGotTalent />} />
        <Route path="/network/no-limit-east-houston" element={<NoLimitEastHouston />} />
        <Route path="/network/civic-connect" element={<CivicConnect />} />
        <Route path="/powerline" element={<PowerLine />} />
      </Routes>
      <Footer />
    </>
  );
}
'@
Set-Content (Join-Path $src "App.jsx") $app -Encoding utf8

$main = @'
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/ps-theme.css";
import { AuthProvider } from "./services/auth.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
'@
Set-Content (Join-Path $src "main.jsx") $main -Encoding utf8

# --- SIMPLE SVG LOGOS (placeholders if missing) ------------
function Write-Logo($fileName, $label){
$svg = @"
<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512'>
  <rect width='100%' height='100%' fill='#0a0a0a' />
  <rect x='6' y='6' width='500' height='500' rx='28' ry='28' fill='none' stroke='#d4a537' stroke-width='8'/>
  <text x='50%' y='54%' font-size='44' font-family='Arial' fill='#d4a537' text-anchor='middle'>$label</text>
</svg>
"@
  $p = Join-Path $logos $fileName
  if (-not (Test-Path $p)) { Set-Content $p $svg -Encoding utf8 }
}

Write-Logo "powerstreamlogo.svg" "PowerStream"
Write-Logo "southernpowernetworklogo.svg" "SP Network"
Write-Logo "texasgottalentlogo.svg" "Texas Got Talent"
Write-Logo "nolimiteasthoustonlogo.svg" "No Limit East"
Write-Logo "civicconnectlogo.svg" "Civic Connect"
Write-Logo "powerfeed.svg" "PowerFeed"
Write-Logo "powergram.svg" "PowerGram"
Write-Logo "powerreel.svg" "PowerReel"
Write-Logo "powerline.svg" "PowerLine"

Write-Host "✅ UI files written. If your audio exists at /public/audio/welcome-voice.mp3 it will play. Otherwise add it." -ForegroundColor Green
Write-Host "▶ Run:  npm run dev" -ForegroundColor Yellow
