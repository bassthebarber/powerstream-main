Write-Host "`n⚡ PowerDesignAllInOne starting..." -ForegroundColor Cyan
Set-Location -Path $PSScriptRoot

# 0) Sanity checks
if (!(Test-Path package.json)) {
  Write-Host "❌ Run this from your frontend folder (with package.json)." -ForegroundColor Red
  exit 1
}

# 1) Ensure deps
Write-Host "📦 Ensuring react-router-dom is installed..." -ForegroundColor Yellow
npm i react-router-dom --save | Out-Null

# 2) Ensure folders
$dirs = @(
  "src/pages",
  "src/pages/stations",
  "src/components/Brand",
  "src/components/Welcome",
  "src/styles"
)
$dirs | ForEach-Object { New-Item -ItemType Directory -Force -Path $_ | Out-Null }

# 3) Brand logo helper
$brandLogo = @"
import React from "react";

export default function BrandLogo({ name="powerfeed", size=140 }) {
  const map = {
    powerfeed: "/logos/powerfeedlogo.png",
    powerstream: "/logos/powerstream-logo.png",
    southernpower: "/logos/southernpowerlogo.PNG",
    nolimit: "/logos/nolimit.easthoustonlogo.PNG",
    texasgottalent: "/logos/texasgottalentlogo.PNG",
    civicconnect: "/logos/civicconnectlogo.PNG",
  };
  const src = map[(name || "").toLowerCase()] || map.powerstream;
  return <img src={src} alt={name} style={{ width: size, height: "auto" }} />;
}
"@
Set-Content "src/components/Brand/BrandLogo.jsx" $brandLogo -Encoding UTF8

# 4) Pages (Feed, Gram, Reel, Network, PowerLine)
$feed = @"
import React from "react";
import BrandLogo from "../components/Brand/BrandLogo";
import "../styles/feed.css";
import "../styles/storybar.css";
import "../styles/composer.css";

export default function Feed() {
  return (
    <div className="feed-wrap">
      <header className="feed-header">
        <BrandLogo name="powerfeed" size={120} />
      </header>

      <section className="stories">
        {[...Array(8)].map((_,i)=>(
          <div className="story-card" key={i}>
            <div className="story-thumb">+</div>
            <div className="story-name">Story {i+1}</div>
          </div>
        ))}
      </section>

      <section className="composer">
        <img className="avatar" src="/logos/powerstream-logo.png" alt="you"/>
        <input className="composer-input" placeholder="What's going on in your world?" />
        <button className="post-btn">Post to PowerFeed</button>
      </section>

      <section className="feed-stream">
        <article className="post-card">Your first post will appear here.</article>
      </section>
    </div>
  );
}
"@
Set-Content "src/pages/Feed.jsx" $feed -Encoding UTF8

$gram = @"
import React from "react";
import "../styles/gram.css";
import BrandLogo from "../components/Brand/BrandLogo";

export default function Gram(){
  const cells = Array.from({length:12}, (_,i)=>i);
  return (
    <div className="ig-wrap">
      <header className="ig-top">
        <BrandLogo name="powerfeed" size={70}/>
        <h2>PowerGram</h2>
        <div className="ig-actions"><button>+ New</button></div>
      </header>
      <div className="ig-grid">
        {cells.map(i=> <div key={i} className="ig-cell">IG {i+1}</div>)}
      </div>
    </div>
  );
}
"@
Set-Content "src/pages/Gram.jsx" $gram -Encoding UTF8

$reel = @"
import React from "react";
import "../styles/reel.css";

export default function Reel(){
  return (
    <main className="reel-stage">
      <div className="reel-player">
        <video controls playsInline />
      </div>
      <aside className="reel-meta">
        <div className="title">PowerReel</div>
        <button>Like</button><button>Comment</button><button>Share</button>
      </aside>
    </main>
  );
}
"@
Set-Content "src/pages/Reel.jsx" $reel -Encoding UTF8

$network = @"
import React from "react";
import BrandLogo from "../components/Brand/BrandLogo";

export default function Network(){
  return (
    <main style={{minHeight:"70vh",display:"grid",placeItems:"center",background:"#000",color:"#ffd700",padding:"24px"}}>
      <section style={{textAlign:"center",maxWidth:900}}>
        <BrandLogo name="southernpower" size={220}/>
        <h1 style={{fontSize:34,margin:"10px 0"}}>Southern Power Network</h1>
        <p style={{color:"#eaeaea"}}>Your TV station hub with sub-stations: No Limit East Houston, Texas Got Talent, and Civic Connect.</p>
        <div style={{marginTop:16,display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
          <a className="gold-btn" href="/nolimit">No Limit East Houston</a>
          <a className="gold-btn" href="/texasgottalent">Texas Got Talent</a>
          <a className="gold-btn" href="/civicconnect">Civic Connect</a>
        </div>
      </section>
      <style>{`.gold-btn{background:#ffd700;color:#000;padding:10px 14px;border-radius:12px;font-weight:800;text-decoration:none}`}</style>
    </main>
  );
}
"@
Set-Content "src/pages/Network.jsx" $network -Encoding UTF8

$powerline = @"
import React from "react";
import "../styles/powerline.css";

export default function PowerLine(){
  return (
    <div className="msg-wrap">
      <aside className="msg-list">
        <div className="list-head">Chats</div>
        {["Marcus","Team","Support"].map(n=>(
          <div className="chat-item" key={n}><div className="dot"/> {n}</div>
        ))}
      </aside>
      <section className="msg-window">
        <header className="msg-title">Marcus</header>
        <div className="bubble left">Welcome to PowerLine 👋</div>
        <div className="bubble right">Let's ship this UI.</div>
        <footer className="msg-compose">
          <input placeholder="Write a message..." />
          <button>Send</button>
        </footer>
      </section>
    </div>
  );
}
"@
Set-Content "src/pages/PowerLine.jsx" $powerline -Encoding UTF8

# 5) Stations: template + three pages
$stationTemplate = @"
import React from "react";
import BrandLogo from "../../components/Brand/BrandLogo";
import "../../styles/station.css";

export default function StationTemplate({ brand, title, blurb }) {
  return (
    <div className="station-wrap">
      <header className="station-head">
        <BrandLogo name={brand} size={200}/>
        <h1>{title}</h1>
        <p>{blurb}</p>
      </header>

      <section className="recorded">
        <h2>Recorded Content</h2>
        <div className="grid">
          {[...Array(6)].map((_,i)=>(
            <div className="card" key={i}>
              <video controls preload="metadata"/>
              <div className="meta">Episode {i+1}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
"@
Set-Content "src/pages/stations/StationTemplate.jsx" $stationTemplate -Encoding UTF8

$nolimit = @"
import React from "react";
import StationTemplate from "./StationTemplate";
export default function NoLimit(){ 
  return <StationTemplate brand="nolimit" title="No Limit East Houston" blurb="Official station for No Limit East Houston."/>; 
}
"@
Set-Content "src/pages/NoLimit.jsx" $nolimit -Encoding UTF8

$txgt = @"
import React from "react";
import StationTemplate from "./stations/StationTemplate";
export default function TexasGotTalent(){ 
  return <StationTemplate brand="texasgottalent" title="Texas Got Talent" blurb="Discover and vote for local Texas talent."/>; 
}
"@
Set-Content "src/pages/TexasGotTalent.jsx" $txgt -Encoding UTF8

$civic = @"
import React from "react";
import StationTemplate from "./stations/StationTemplate";
export default function CivicConnect(){ 
  return <StationTemplate brand="civicconnect" title="Civic Connect" blurb="Community stories, leadership, and civic programming."/>; 
}
"@
Set-Content "src/pages/CivicConnect.jsx" $civic -Encoding UTF8

# 6) Welcome (module CSS in styles)
$welcome = @"
import React, { useEffect } from "react";
import styles from "../../styles/Welcome.module.css";

const Welcome = () => {
  useEffect(() => {
    const audio = new Audio("/audio/welcome-voice.mp3");
    audio.volume = 0.8;
    audio.play().catch(() => {
      const btn = document.getElementById("welcome-audio-btn");
      if (btn) btn.style.display = "inline-flex";
    });
  }, []);

  const manualPlay = () => {
    const audio = new Audio("/audio/welcome-voice.mp3");
    audio.volume = 0.8;
    audio.play().catch(() => {});
    const btn = document.getElementById("welcome-audio-btn");
    if (btn) btn.style.display = "none";
  };

  return (
    <div className={styles.container}>
      <img src="/logos/powerstream-logo.png" alt="PowerStream" className={styles.logo} />
      <h1 className={styles.text}>Welcome to PowerStream</h1>
      <button id="welcome-audio-btn" onClick={manualPlay} className={styles.audioBtn} style={{ display: "none" }}>
        ▶ Play Welcome
      </button>
    </div>
  );
};

export default Welcome;
"@
Set-Content "src/components/Welcome/Welcome.jsx" $welcome -Encoding UTF8

# 7) Centralized CSS in src/styles
$feedCss = @"
.feed-wrap{max-width:980px;margin:24px auto;padding:0 12px;color:#eaeaea}
.feed-header{display:flex;justify-content:center;margin-bottom:8px}
.feed-stream{display:grid;gap:12px}
.post-card{background:#111;border:1px solid #222;border-radius:12px;padding:14px}
"@
Set-Content "src/styles/feed.css" $feedCss -Encoding UTF8

$storybarCss = @"
.stories{display:flex;gap:10px;overflow-x:auto;padding:10px;background:#0d0d0d;border:1px solid #222;border-radius:12px;margin:14px 0}
.story-card{min-width:110px;background:#121212;border:1px solid #2a2a2a;border-radius:12px;padding:8px;display:flex;flex-direction:column;align-items:center}
.story-thumb{width:94px;height:94px;border-radius:12px;background:#000;border:1px dashed #333;display:grid;place-items:center;font-size:28px;color:#ffd700}
.story-name{margin-top:6px;font-size:.85rem;color:#ccc}
"@
Set-Content "src/styles/storybar.css" $storybarCss -Encoding UTF8

$composerCss = @"
.composer{display:flex;gap:12px;background:#111;border:1px solid #222;padding:12px;border-radius:12px}
.avatar{width:44px;height:44px;border-radius:999px}
.composer-input{flex:1;background:#000;color:#ffd700;border:1px solid #333;padding:10px 12px;border-radius:12px}
.post-btn{background:#ffd700;color:#000;font-weight:700;border:none;padding:10px 14px;border-radius:12px}
"@
Set-Content "src/styles/composer.css" $composerCss -Encoding UTF8

$gramCss = @"
.ig-wrap{max-width:1040px;margin:24px auto;padding:0 12px;color:#eaeaea}
.ig-top{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.ig-actions button{background:#ffd700;color:#000;border:none;border-radius:10px;padding:8px 12px;font-weight:800}
.ig-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.ig-cell{aspect-ratio:1/1;background:#111;border:1px solid #222;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#ffd700;font-weight:700}
@media(max-width:700px){.ig-g
