Write-Host "🚪 PowerFinalGate: Final UI/Auth/Route Validator" -ForegroundColor Cyan

# ---------- Paths ----------
$root   = Get-Location
$src    = Join-Path $root "src"
$pages  = Join-Path $src "pages"
$comps  = Join-Path $src "components"
$pfdir  = Join-Path $comps "PowerFeed"
$styles = Join-Path $src "styles"
$lib    = Join-Path $src "lib"
$public = Join-Path $root "public"
$logos  = Join-Path $public "logos"
$audio  = Join-Path $public "audio"
$envF   = Join-Path $root ".env.local"
$backup = Join-Path $root ("finalgate-backup-" + (Get-Date -Format "yyyyMMdd-HHmmss"))

function Ensure-Folder($p){ if(!(Test-Path $p)){ New-Item -ItemType Directory -Path $p | Out-Null; Write-Host "📁 Created $p" -ForegroundColor DarkGray } }
function Backup-IfExists($p){
  if(Test-Path $p){
    $rel = Resolve-Path $p | Split-Path -NoQualifier
    $dst = Join-Path $backup $rel
    $dstD = Split-Path $dst
    if(!(Test-Path $dstD)){ New-Item -ItemType Directory -Path $dstD | Out-Null }
    Copy-Item $p $dst -Recurse -Force
  }
}
function Save-File($p,$c){ Backup-IfExists $p; $d=Split-Path $p; if(!(Test-Path $d)){ New-Item -ItemType Directory $d | Out-Null }; $c | Set-Content -Encoding utf8 -NoNewline -Path $p; Write-Host "✍️  Wrote $p" }

# ---------- Create base folders ----------
Ensure-Folder $src; Ensure-Folder $pages; Ensure-Folder $comps; Ensure-Folder $pfdir; Ensure-Folder $styles; Ensure-Folder $lib
Ensure-Folder $public; Ensure-Folder $logos; Ensure-Folder $audio

# ---------- package.json deps ----------
$pkgPath = Join-Path $root "package.json"
if(!(Test-Path $pkgPath)){ Write-Host "❌ package.json not found. Run in your frontend folder." -ForegroundColor Red; exit 1 }
$pkg = Get-Content $pkgPath | ConvertFrom-Json
$deps=@{}; if($pkg.dependencies){ $deps=$pkg.dependencies }
$need=@()
if(!$deps."react-router-dom"){ $need+="react-router-dom" }
if(!$deps."@supabase/supabase-js"){ $need+="@supabase/supabase-js" }
if(!$deps."dayjs"){ $need+="dayjs" }
if($need.Count -gt 0){ Write-Host "⬇️  Installing: $($need -join ', ')" -ForegroundColor Yellow; npm i $need | Out-Null } else { Write-Host "✅ Deps OK" -ForegroundColor Green }

# ---------- ENV ----------
if(!(Test-Path $envF)){
@"
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SOCIAL_BUCKET=social
"@ | Set-Content -Encoding utf8 $envF
  Write-Host "📝 Created .env.local — add your real Supabase URL/KEY" -ForegroundColor Yellow
}
$envC = Get-Content $envF -ErrorAction SilentlyContinue
foreach($k in @("VITE_SUPABASE_URL","VITE_SUPABASE_ANON_KEY","VITE_SOCIAL_BUCKET")){
  if(($envC | Select-String -SimpleMatch $k) -eq $null){
    Add-Content $envF "`n$k=$([string]::Empty)"; Write-Host "➕ Added $k placeholder" -ForegroundColor Yellow
  }
}
if(($envC -match "VITE_SUPABASE_URL") -and ($envC -match "VITE_SUPABASE_ANON_KEY")){
  Write-Host "✅ Supabase env present (verify values)" -ForegroundColor Green
} else {
  Write-Host "⚠️  Add Supabase URL/KEY in .env.local, then restart dev server." -ForegroundColor Yellow
}

# ---------- Supabase client ----------
$SUPA=@'
import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = (url && key) ? createClient(url, key, { auth:{ persistSession:true, autoRefreshToken:true }}) : null;
export async function safeQuery(fn){ if(!supabase) return { data:null, error:new Error("Supabase not configured") }; try{ return await fn(supabase); }catch(e){ console.error(e); return { data:null, error:e }; } }
'@
Save-File (Join-Path $lib "supabaseClient.js") $SUPA
Write-Host "✅ Supabase client" -ForegroundColor Green

# ---------- Theme ----------
$THEME=@'
:root{--bg:#0b0b0b;--panel:#101010;--gold:#f3b24d;--line:#c08b35;--text:#f6f1e8;--radius:14px}
*{box-sizing:border-box} html,body,#root{height:100%}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto}
.nav{display:flex;gap:10px;align-items:center;padding:10px 16px;border-bottom:1px solid var(--line);position:sticky;top:0;background:#0b0b0bf2;backdrop-filter:saturate(120%) blur(6px)}
.brand{display:flex;align-items:center;gap:8px;font-weight:700}.logo{width:28px;height:28px;object-fit:contain}
.links{display:flex;flex-wrap:wrap;gap:10px;margin-left:auto}
.btn{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:14px;border:1.5px solid var(--gold);background:transparent;color:var(--text)}
.page{max-width:1100px;margin:0 auto;padding:22px}
.card{border:1px solid var(--line);border-radius:14px;background:#101010;padding:14px}
.footer{opacity:.7;text-align:center;padding:24px 16px;border-top:1px solid var(--line);margin-top:32px}
.input{width:100%;padding:12px;border-radius:12px;border:1px solid var(--line);background:#0c0c0c;color:var(--text)}
.post{border:1px solid var(--line);border-radius:16px;padding:14px;margin-top:12px;background:#0e0e0e}
'@
Save-File (Join-Path $styles "theme.css") $THEME

# ---------- Header ----------
$HEADER=@'
import React from "react";
import { Link, NavLink } from "react-router-dom";
export default function Header(){
  const tab = ({isActive})=>"btn";
  return (
    <nav className="nav">
      <Link to="/home" className="brand"><img className="logo" src="/logos/powerstream.png" alt=""/><span>PowerStream</span></Link>
      <div className="links">
        <NavLink className={tab} to="/home">Home</NavLink>
        <NavLink className={tab} to="/feed">Feed</NavLink>
        <NavLink className={tab} to="/gram">Gram</NavLink>
        <NavLink className={tab} to="/reel">Reel</NavLink>
        <NavLink className={tab} to="/powerline">PowerLine</NavLink>
        <NavLink className={tab} to="/network">Network</NavLink>
        <NavLink className={tab} to="/signin">Sign In</NavLink>
        <NavLink className={tab} to="/register">Register</NavLink>
      </div>
    </nav>
  );
}
'@
Save-File (Join-Path $comps "Header.jsx") $HEADER

# ---------- Pages ----------
$HOME=@'
import React,{useEffect,useRef} from "react";
import { Link } from "react-router-dom";
export default function Home(){
  const a=useRef(null); useEffect(()=>{ const el=a.current; if(!el) return; el.play().catch(()=>{}); const n=()=>el.play().catch(()=>{}); window.addEventListener("pointerdown",n,{once:true}); return()=>window.removeEventListener("pointerdown",n)},[]);
  return (<main className="page">
    <header style={{display:"grid",placeItems:"center",gap:12,marginTop:12}}>
      <img className="logo" src="/logos/powerstream.png" alt="" style={{width:96,height:96}}/>
      <h1>Welcome to PowerStream</h1><p>Audio • Video • Live • Feed</p>
    </header>
    <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:10}}>
      <Link className="btn" to="/feed">PowerFeed</Link>
      <Link className="btn" to="/gram">PowerGram</Link>
      <Link className="btn" to="/reel">PowerReel</Link>
      <Link className="btn" to="/powerline">PowerLine</Link>
      <Link className="btn" to="/network">Southern Power Network</Link>
    </div>
    <audio ref={a} src="/audio/alert.mp3" preload="auto"/>
  </main>); }
'@
$NETWORK=@'
import React from "react";
export default function Network(){
  return (<main className="page"><h1>Southern Power Network</h1><div className="card">Stations coming up next.</div></main>);
}
'@
$POWERLINE=@'export default function PowerLine(){return(<main className="page"><h1>PowerLine</h1><div className="card">Chat coming next.</div></main>);}'@
$SIGNIN=@'
import React,{useState} from "react"; import { supabase } from "../lib/supabaseClient";
export default function SignIn(){
  const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[msg,setMsg]=useState(""),[busy,setBusy]=useState(false);
  const go=async e=>{e.preventDefault(); setMsg(""); setBusy(true); try{ if(!supabase) throw new Error("Supabase not configured"); const {error}=await supabase.auth.signInWithPassword({email,password}); if(error) throw error; setMsg("Signed in. Go to Feed."); }catch(err){ setMsg(err.message||"Sign-in failed"); }finally{ setBusy(false); } };
  return (<main className="page"><h1>Sign in</h1><form onSubmit={go} className="card" style={{maxWidth:420}}>
    <input className="input" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required style={{marginBottom:8}}/>
    <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required style={{marginBottom:8}}/>
    <button className="btn" disabled={busy}>{busy?"Signing in...":"Sign In"}</button></form>{msg?<p style={{opacity:.8,marginTop:8}}>{msg}</p>:null}</main>);
}
'@
$REGISTER=@'
import React,{useState} from "react"; import { supabase } from "../lib/supabaseClient";
export default function Register(){
  const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[msg,setMsg]=useState(""),[busy,setBusy]=useState(false);
  const go=async e=>{e.preventDefault(); setMsg(""); setBusy(true); try{ if(!supabase) throw new Error("Supabase not configured"); const {error}=await supabase.auth.signUp({email,password}); if(error) throw error; setMsg("Check your email to confirm your account."); }catch(err){ setMsg(err.message||"Registration failed"); }finally{ setBusy(false); } };
  return (<main className="page"><h1>Create account</h1><form onSubmit={go} className="card" style={{maxWidth:420}}>
    <input className="input" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required style={{marginBottom:8}}/>
    <input className="input" type="password" placeholder="Password (min 6)" value={password} onChange={e=>setPassword(e.target.value)} required style={{marginBottom:8}}/>
    <button className="btn" disabled={busy}>{busy?"Creating...":"Register"}</button></form>{msg?<p style={{opacity:.8,marginTop:8}}>{msg}</p>:null}</main>);
}
'@
Save-File (Join-Path $pages "Home.jsx") $HOME
Save-File (Join-Path $pages "Network.jsx") $NETWORK
Save-File (Join-Path $pages "PowerLine.jsx") $POWERLINE
Save-File (Join-Path $pages "SignIn.jsx") $SIGNIN
Save-File (Join-Path $pages "Register.jsx") $REGISTER

# ---------- Feed page + components ----------
$FEEDPAGE=@'
import React from "react";
import FeedTimeline from "../components/PowerFeed/FeedTimeline.jsx";
import PowerFeedSidebar from "../components/PowerFeed/PowerFeedSidebar.jsx";
export default function Feed(){
  return (<main className="page" style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:16}}>
    <div><h1>PowerFeed</h1><FeedTimeline/></div>
    <PowerFeedSidebar/>
  </main>);
}
'@
Save-File (Join-Path $pages "Feed.jsx") $FEEDPAGE

$TIMELINE=@'
import React,{useEffect,useState} from "react";
import dayjs from "dayjs";
import { supabase, safeQuery } from "../../lib/supabaseClient";
async function getUser(){ if(!supabase) return null; const { data:{ user } } = await supabase.auth.getUser(); return user||null; }
export default function FeedTimeline(){
  const [text,setText]=useState(""),[posts,setPosts]=useState([]),[loading,setLoading]=useState(true),[uid,setUid]=useState(null),[name,setName]=useState("User");
  useEffect(()=>{(async()=>{
    const u=await getUser(); if(u){ setUid(u.id); const {data}=await safeQuery(s=>s.from("profiles").select("full_name,username").eq("id",u.id).single()); if(data) setName(data.full_name||data.username||"User"); }
    const {data:rows,error}=await safeQuery(s=>s.from("feed_posts").select("*").order("created_at",{ascending:false}).limit(50));
    if(!error && Array.isArray(rows)) setPosts(rows); else setPosts([{id:"demo",user_name:"Demo",text:"Welcome to PowerFeed!",created_at:new Date().toISOString()}]);
    setLoading(false);
  })()},[]);
  const submit=async()=>{ const msg=text.trim(); if(!msg) return; setText(""); if(supabase && uid){ const payload={user_id:uid,text:msg,user_name:name}; const {data,error}=await safeQuery(s=>s.from("feed_posts").insert(payload).select().single()); if(!error&&data){ setPosts(p=>[data,...p]); return; } } setPosts(p=>[{id:Date.now()+"",user_name:"Guest",text:msg,created_at:new Date().toISOString()},...p]); };
  return (<>
    <div className="card"><textarea className="input" rows={3} placeholder={uid?"What's going on in your world?":"Sign in to post (or try a guest post)"} value={text} onChange={e=>setText(e.target.value)}/>
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button className="btn" onClick={submit} disabled={!text.trim()}>Post</button></div></div>
    {loading?<p style={{opacity:.7,marginTop:10}}>Loading feed…</p>:null}
    {posts.map(p=>(<article key={p.id} className="post">
      <div style={{display:"flex",gap:10,alignItems:"center"}}><div style={{width:36,height:36,borderRadius:"50%",border:"1px solid var(--line)"}}/>
        <div><div style={{fontWeight:600}}>{p.user_name||"User"}</div><div style={{opacity:.7,fontSize:12}}>{dayjs(p.created_at).format("M/D/YYYY, h:mm:ss A")}</div></div>
      </div><div style={{marginTop:10,whiteSpace:"pre-wrap"}}>{p.text}</div></article>))}
  </>); }
'@
Save-File (Join-Path $pfdir "FeedTimeline.jsx") $TIMELINE

$SIDEBAR=@'
import React from "react"; import { Link } from "react-router-dom";
export default function PowerFeedSidebar(){
  return (<aside className="card" style={{position:"sticky",top:80,height:"fit-content"}}>
    <h3 style={{marginBottom:8}}>Quick Links</h3>
    <div style={{display:"grid",gap:8}}>
      <Link className="btn" to="/gram">PowerGram</Link>
      <Link className="btn" to="/reel">PowerReel</Link>
      <Link className="btn" to="/powerline">PowerLine</Link>
      <Link className="btn" to="/network">Southern Power Network</Link>
    </div>
    <div style={{marginTop:16,opacity:.8,fontSize:13}}>Sign in to post/upload.</div>
  </aside>);
}
'@
Save-File (Join-Path $pfdir "PowerFeedSidebar.jsx") $SIDEBAR

# ---------- Gram / Reel ----------
$GRAM=@'
import React,{useEffect,useState} from "react"; import { supabase } from "../lib/supabaseClient";
const BUCKET = import.meta.env.VITE_SOCIAL_BUCKET || "social";
export default function Gram(){
  const [uid,setUid]=useState(null),[caption,setCaption]=useState(""),[file,setFile]=useState(null),[items,setItems]=useState([]);
  useEffect(()=>{(async()=>{ if(!supabase) return; const {data:{user}}=await supabase.auth.getUser(); if(user) setUid(user.id);
    const {data}=await supabase.from("gram_posts").select("*").order("created_at",{ascending:false}).limit(50); if(data) setItems(data); })()},[]);
  const upload=async()=>{ if(!supabase) return alert("Supabase not configured"); if(!uid) return alert("Sign in first"); if(!file) return;
    const ext=file.name.split(".").pop().toLowerCase(); const path=`grams/${uid}/${crypto.randomUUID()}.${ext}`;
    const {error:upErr}=await supabase.storage.from(BUCKET).upload(path,file,{upsert:false,contentType:file.type}); if(upErr) return alert(upErr.message);
    const {data:row,error:insErr}=await supabase.from("gram_posts").insert({user_id:uid,caption,file_path:path}).select().single(); if(insErr) return alert(insErr.message);
    setItems(p=>[row,...p]); setCaption(""); setFile(null); };
  const url=(p)=>supabase.storage.from(BUCKET).getPublicUrl(p).data.publicUrl;
  return (<main className="page"><h1>PowerGram</h1>
    <div className="card" style={{marginBottom:16}}><input className="input" placeholder="Caption (optional)" value={caption} onChange={e=>setCaption(e.target.value)} style={{marginBottom:8}}/>
      <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)}/>
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button className="btn" onClick={upload} disabled={!file||!uid}>Upload</button></div>
      {!uid?<p style={{opacity:.7,marginTop:8}}>Sign in to upload.</p>:null}</div>
    <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
      {items.map(it=>(<div key={it.id} className="card" style={{overflow:"hidden"}}><img src={url(it.file_path)} alt="" style={{width:"100%",display:"block"}}/>{it.caption?<div style={{marginTop:8}}>{it.caption}</div>:null}</div>))}
    </section></main>);
}
'@
$REEL=@'
import React,{useEffect,useState} from "react"; import { supabase } from "../lib/supabaseClient";
const BUCKET = import.meta.env.VITE_SOCIAL_BUCKET || "social";
export default function Reel(){
  const [uid,setUid]=useState(null),[caption,setCaption]=useState(""),[file,setFile]=useState(null),[items,setItems]=useState([]);
  useEffect(()=>{(async()=>{ if(!supabase) return; const {data:{user}}=await supabase.auth.getUser(); if(user) setUid(user.id);
    const {data}=await supabase.from("reel_posts").select("*").order("created_at",{ascending:false}).limit(50); if(data) setItems(data); })()},[]);
  const upload=async()=>{ if(!supabase) return alert("Supabase not configured"); if(!uid) return alert("Sign in first"); if(!file) return;
    const ext=file.name.split(".").pop().toLowerCase(); const path=`reels/${uid}/${crypto.randomUUID()}.${ext}`;
    const {error:upErr}=await supabase.storage.from(BUCKET).upload(path,file,{upsert:false,contentType:file.type}); if(upErr) return alert(upErr.message);
    const {data:row,error:insErr}=await supabase.from("reel_posts").insert({user_id:uid,caption,file_path:path}).select().single(); if(insErr) return alert(insErr.message);
    setItems(p=>[row,...p]); setCaption(""); setFile(null); };
  const url=(p)=>supabase.storage.from(BUCKET).getPublicUrl(p).data.publicUrl;
  return (<main className="page"><h1>PowerReel</h1>
    <div className="card" style={{marginBottom:16}}><input className="input" placeholder="Caption (optional)" value={caption} onChange={e=>setCaption(e.target.value)} style={{marginBottom:8}}/>
      <input type="file" accept="video/*" onChange={e=>setFile(e.target.files?.[0]||null)}/>
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button className="btn" onClick={upload} disabled={!file||!uid}>Upload</button></div>
      {!uid?<p style={{opacity:.7,marginTop:8}}>Sign in to upload.</p>:null}</div>
    <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12}}>
      {items.map(it=>(<div key={it.id} className="card" style={{overflow:"hidden"}}><video controls playsInline style={{width:"100%",display:"block"}}><source src={url(it.file_path)}/></video>{it.caption?<div style={{marginTop:8}}>{it.caption}</div>:null}</div>))}
    </section></main>);
}
'@
Save-File (Join-Path $pages "Gram.jsx") $GRAM
Save-File (Join-Path $pages "Reel.jsx") $REEL

# ---------- App.jsx + main.jsx ----------
$APP=@'
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
  return (<BrowserRouter>
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
  </BrowserRouter>);
}
'@
$MAIN=@'
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode><App/></React.StrictMode>);
'@
Save-File (Join-Path $src "App.jsx") $APP
Save-File (Join-Path $src "main.jsx") $MAIN

# ---------- Asset checks ----------
$needLogos=@("powerstream.png","powerfeed.svg","powergram.svg","powerreel.svg","powerline.svg","SouthernPowerNetworkLogo.png","TexasGotTalentLogo.png","NoLimitEastHoustonLogo.png","CivicConnectLogo.png","WorldwideTV.png")
$miss=@(); foreach($f in $needLogos){ if(!(Test-Path (Join-Path $logos $f))){ $miss+=$f } }
if($miss.Count -gt 0){ Write-Host "⚠️ Missing logos in /public/logos:" -ForegroundColor Yellow; $miss | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow } } else { Write-Host "✅ Logos present" -ForegroundColor Green }
if(!(Test-Path (Join-Path $audio "alert.mp3"))){ Write-Host "⚠️ /public/audio/alert.mp3 missing (Home autoplay)" -ForegroundColor Yellow }

# ---------- Kill port 5173 if busy ----------
try{
  $pid = (Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess
  if($pid){ Write-Host "🧹 Freeing port 5173 (killing PID $pid)..." -ForegroundColor Yellow; Stop-Process -Id $pid -Force; Write-Host "✅ Port 5173 freed" -ForegroundColor Green }
}catch{}

# ---------- Quick JSX heuristics ----------
Get-ChildItem -Recurse -Include *.jsx,*.js | ForEach-Object {
  $p=$_.FullName; $c=Get-Content $p -Raw
  if($c -match "return\s+\{" -and $c -notmatch "return\s+\(\s*<"){ Write-Host "⚠️ Possible malformed return in $p" -ForegroundColor Yellow }
  if($c -match "<[^>]+[^\/]>\s*$" -and $c -notmatch "</"){ Write-Host "⚠️ Unclosed tag suspicion in $p" -ForegroundColor Yellow }
}

# ---------- Duplicate/typo cleanup hints ----------
if(Test-Path (Join-Path $comps "feed")){ Write-Host "ℹ️ Consider deleting old /src/components/feed/* (we use /components/PowerFeed/*)" -ForegroundColor Yellow }
if(Test-Path (Join-Path $src "index.jx")){ Write-Host "⚠️ Rename src/index.jx ➜ index.jsx" -ForegroundColor Yellow }

# ---------- Final ----------
Ensure-Folder $backup
Write-Host "`n✅ FinalGate complete. Backups at: $backup" -ForegroundColor Green
Write-Host "➡️ Start dev server: npm run dev" -ForegroundColor Cyan
