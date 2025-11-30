# PowerStream-UI.ps1
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

New-Item -ItemType Directory -Force -Path .\src\components | Out-Null
New-Item -ItemType Directory -Force -Path .\src\pages | Out-Null

# ---------- theme.css ----------
@'
/* src/theme.css */
:root{
  --bg:#000;
  --gold:#ffd34d;
  --gold-dk:#c9a73b;
  --ink:#f8e9bf;
}
*{box-sizing:border-box}
html,body,#root{height:100%}
body{margin:0;background:var(--bg);color:var(--gold);font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial}
a{color:var(--gold);text-decoration:none}
.container{max-width:1100px;margin:0 auto;padding:20px}
.header{
  border-bottom:1px solid var(--gold-dk);
  position:sticky;top:0;background:#000cc; /* no blur issues */
  background:#000; z-index:10;
}
.brand{display:flex;align-items:center;gap:10px}
.brand img{height:36px; width:auto}
.nav{display:flex;gap:14px;flex-wrap:wrap;margin-top:10px}
.nav a{padding:.45rem .8rem;border:2px solid var(--gold);border-radius:10px}
.nav a.active,.nav a:hover{background:var(--gold);color:#000;font-weight:600}

.footer{border-top:1px solid var(--gold-dk);padding:14px 0;margin-top:40px;text-align:center;color:var(--ink);opacity:.9}

.hero{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:70vh;text-align:center;gap:18px}
.hero .logo{height:120px;width:auto;animation:spin 12s linear infinite}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}

.btn-row{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
.btn{padding:.6rem 1rem;border:2px solid var(--gold);border-radius:12px;background:transparent;color:var(--gold);cursor:pointer}
.btn:hover{background:var(--gold);color:#000}

.card{max-width:520px;margin:40px auto;padding:24px;border:1px solid var(--gold-dk);border-radius:14px;background:#070707}
.card h1{margin-top:0}
.input{width:100%;padding:.7rem;border-radius:10px;border:1px solid var(--gold-dk);background:#111;color:var(--ink)}
.input + .input{margin-top:10px}
.form-row{display:flex;justify-content:flex-end;margin-top:12px}
.msg{margin-top:10px;color:#ff9c9c}
'@ | Set-Content -Encoding UTF8 .\src\theme.css

# ---------- Header.jsx ----------
@'
import React from "react";
import { NavLink } from "react-router-dom";
import UserBadge from "./UserBadge.jsx";

export default function Header(){
  return (
    <header className="header">
      <div className="container">
        <div className="brand">
          <img src="/logos/powerstream.png" alt="PowerStream" onError={(e)=>{e.currentTarget.style.display="none"}}/>
          <h2 style={{margin:0}}>PowerStream</h2>
        </div>

        <nav className="nav" aria-label="Main navigation">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/feed">Feed</NavLink>
          <NavLink to="/gram">Gram</NavLink>
          <NavLink to="/reel">Reel</NavLink>
          <NavLink to="/powerline">PowerLine</NavLink>
          <NavLink to="/signin">Sign In</NavLink>
          <NavLink to="/register">Register</NavLink>
        </nav>

        <div style={{marginTop:10}}>
          <UserBadge/>
        </div>
      </div>
    </header>
  );
}
'@ | Set-Content -Encoding UTF8 .\src\components\Header.jsx

# ---------- Footer.jsx ----------
@'
import React from "react";
export default function Footer(){
  return (
    <footer className="footer">
      <div className="container">© 2025 PowerStream</div>
    </footer>
  );
}
'@ | Set-Content -Encoding UTF8 .\src\components\Footer.jsx

# ---------- UserBadge.jsx ----------
@'
import React from "react";
import { useAuth, signOut } from "@/services/auth.jsx";

export default function UserBadge(){
  const { user } = useAuth() || {};
  return (
    <div style={{display:"flex",gap:10,alignItems:"center"}}>
      <span style={{fontSize:13,opacity:.85}}>
        {user ? `Signed in: ${user.email}` : "Not signed in"}
      </span>
      {user && (
        <button className="btn" onClick={async()=>{ try{ await signOut(); }catch(e){ alert(e.message);} }}>
          Sign out
        </button>
      )}
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 .\src\components\UserBadge.jsx

# ---------- Home.jsx (spinning logo + buttons) ----------
@'
import React from "react";
import { Link } from "react-router-dom";

export default function Home(){
  return (
    <main className="container">
      <section className="hero">
        <img className="logo" src="/logos/powerstream-gold.png" alt="PowerStream"
             onError={(e)=>{e.currentTarget.src="/logos/powerstream.png"}}/>
        <h1>Welcome to PowerStream</h1>
        <div className="btn-row">
          <Link className="btn" to="/feed">PowerFeed</Link>
          <Link className="btn" to="/gram">PowerGram</Link>
          <Link className="btn" to="/reel">PowerReel</Link>
          <Link className="btn" to="/powerline">PowerLine</Link>
          <Link className="btn" to="/network">Southern Power Network</Link>
          <Link className="btn" to="/nolimit">No Limit East Houston</Link>
          <Link className="btn" to="/tv">PowerStream TV</Link>
        </div>
      </section>
    </main>
  );
}
'@ | Set-Content -Encoding UTF8 .\src\pages\Home.jsx

# ---------- SignIn.jsx ----------
@'
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signIn } from "@/services/auth.jsx";

export default function SignIn(){
  const nav = useNavigate();
  const [email,setEmail] = useState("");
  const [pass,setPass] = useState("");
  const [msg,setMsg] = useState("");

  async function onSubmit(e){
    e.preventDefault();
    setMsg("");
    try{
      await signIn(email, pass);
      nav("/reel"); // send to upload flow after login
    }catch(err){ setMsg(err.message); }
  }

  return (
    <main className="container">
      <div className="card">
        <h1>Sign In</h1>
        <form onSubmit={onSubmit}>
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
          <div className="form-row">
            <button className="btn" type="submit">Sign In</button>
          </div>
          {msg && <div className="msg">{msg}</div>}
        </form>
        <div style={{marginTop:10,fontSize:13}}>
          New here? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </main>
  );
}
'@ | Set-Content -Encoding UTF8 .\src\pages\SignIn.jsx

# ---------- Register.jsx ----------
@'
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUp } from "@/services/auth.jsx";

export default function Register(){
  const nav = useNavigate();
  const [email,setEmail] = useState("");
  const [pass,setPass] = useState("");
  const [msg,setMsg] = useState("");

  async function onSubmit(e){
    e.preventDefault(); setMsg("");
    try{
      await signUp(email, pass);
      nav("/signin");
    }catch(err){ setMsg(err.message); }
  }

  return (
    <main className="container">
      <div className="card">
        <h1>Register</h1>
        <form onSubmit={onSubmit}>
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
          <div className="form-row">
            <button className="btn" type="submit">Create Account</button>
          </div>
          {msg && <div className="msg">{msg}</div>}
        </form>
        <div style={{marginTop:10,fontSize:13}}>
          Already have an account? <Link to="/signin">Sign in</Link>
        </div>
      </div>
    </main>
  );
}
'@ | Set-Content -Encoding UTF8 .\src\pages\Register.jsx

# ---------- Simple section pages (logos + title) ----------
function Write-LogoPage($name,$title,$logo){
@"
import React from "react";
export default function $name(){
  return (
    <main className="container">
      <div className="hero">
        <img className="logo" src="/logos/$logo" alt="$title" onError={(e)=>{e.currentTarget.style.display='none'}}/>
        <h1>$title</h1>
        <p>Uploads, feed, and tools will appear here.</p>
      </div>
    </main>
  );
}
"@ | Set-Content -Encoding UTF8 ".\src\pages\$name.jsx"
}
Write-LogoPage -name "Feed" -title "PowerFeed" -logo "powerfeed.png"
Write-LogoPage -name "Gram" -title "PowerGram" -logo "powergram.png"
Write-LogoPage -name "Reel" -title "PowerReel" -logo "powerreel.png"
Write-LogoPage -name "PowerLine" -title "PowerLine" -logo "powerline.png"
Write-LogoPage -name "Network" -title "Southern Power Network" -logo "southernpower.png"
Write-LogoPage -name "NoLimit" -title "No Limit East Houston TV" -logo "nolimit.png"
Write-LogoPage -name "TV" -title "PowerStream TV" -logo "powerstream-tv.png"

# ---------- App.jsx (routes + layout) ----------
@'
import React from "react";
import { Routes, Route } from "react-router-dom";

import "./theme.css";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";

import Home from "@/pages/Home.jsx";
import Feed from "@/pages/Feed.jsx";
import Gram from "@/pages/Gram.jsx";
import Reel from "@/pages/Reel.jsx";
import PowerLine from "@/pages/PowerLine.jsx";
import Network from "@/pages/Network.jsx";
import NoLimit from "@/pages/NoLimit.jsx";
import TV from "@/pages/TV.jsx";
import SignIn from "@/pages/SignIn.jsx";
import Register from "@/pages/Register.jsx";

export default function App(){
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/feed" element={<Feed/>} />
        <Route path="/gram" element={<Gram/>} />
        <Route path="/reel" element={<Reel/>} />
        <Route path="/powerline" element={<PowerLine/>} />
        <Route path="/network" element={<Network/>} />
        <Route path="/nolimit" element={<NoLimit/>} />
        <Route path="/tv" element={<TV/>} />
        <Route path="/signin" element={<SignIn/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="*" element={<div className="container" style={{padding:"40px 20px"}}><h2>Not Found</h2></div>} />
      </Routes>
      <Footer />
    </>
  );
}
'@ | Set-Content -Encoding UTF8 .\src\App.jsx

Write-Host "`n✅ UI files written. Make sure your logo images exist in /public/logos/ (pngs named in the code)." -ForegroundColor Green

# ensure vite uses JSX loader as earlier
@'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: { port: 5173, strictPort: true },
  esbuild: { loader: "jsx", include: /src\/.*\.(js|jsx)$/ }
});
'@ | Set-Content -Encoding UTF8 .\vite.config.js

# clean vite cache and start
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue
npm run dev
