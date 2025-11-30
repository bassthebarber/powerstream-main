Write-Host "`n🧭 PowerDesignTrigger starting..." -ForegroundColor Cyan
Set-Location -Path $PSScriptRoot

# 0) Ensure deps
if (Test-Path package.json) {
  Write-Host "📦 Ensuring react-router-dom..." -ForegroundColor Yellow
  npm i react-router-dom --save | Out-Null
} else {
  Write-Host "❌ Run this from your frontend folder (with package.json)." -ForegroundColor Red
  exit 1
}

# 1) Harden Welcome (audio autoplay safety)
$welcomePath = "src/components/Welcome/Welcome.jsx"
if (Test-Path $welcomePath) {
  $welcome = @"
import React, { useEffect } from 'react';
import styles from '../../styles/Welcome.module.css';

const Welcome = () => {
  useEffect(() => {
    const audio = new Audio('/audio/welcome-voice.mp3');
    audio.volume = 0.8;
    audio.play().catch(() => {
      // Autoplay blocked; show a tiny prompt the first time
      const btn = document.getElementById('welcome-audio-btn');
      if (btn) btn.style.display = 'inline-flex';
    });
  }, []);

  const manualPlay = () => {
    const audio = new Audio('/audio/welcome-voice.mp3');
    audio.volume = 0.8;
    audio.play().catch(() => {});
    const btn = document.getElementById('welcome-audio-btn');
    if (btn) btn.style.display = 'none';
  };

  return (
    <div className={styles.container}>
      <img src="/logos/powerstream-logo.png" alt="PowerStream" className={styles.logo} />
      <h1 className={styles.text}>Welcome to PowerStream</h1>
      <button id="welcome-audio-btn" onClick={manualPlay} className={styles.audioBtn} style={{display:'none'}}>
        ▶ Play Welcome
      </button>
    </div>
  );
};

export default Welcome;
"@
  Set-Content $welcomePath $welcome -Encoding UTF8
}

# 2) Router skeleton (App.jsx + main.jsx)
$appPath = "src/App.jsx"
$app = @"
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Welcome from './components/Welcome/Welcome';
import Feed from './pages/Feed';
import Gram from './pages/Gram';
import Reel from './pages/Reel';
import Network from './pages/Network';
import PowerLine from './pages/PowerLine';

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path='/' element={<><Welcome /></>} />
        <Route path='/feed' element={<Feed />} />
        <Route path='/gram' element={<Gram />} />
        <Route path='/reel' element={<Reel />} />
        <Route path='/network' element={<Network />} />
        <Route path='/line' element={<PowerLine />} />
      </Routes>
    </>
  );
}
"@
Set-Content $appPath $app -Encoding UTF8

$mainPath = "src/main.jsx"
$main = @"
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
"@
Set-Content $mainPath $main -Encoding UTF8

# 3) Header CSS used by your existing Header.jsx
New-Item -ItemType Directory -Force -Path "src/components/layout" | Out-Null
$headerCss = "src/components/layout/Header.css"
$headerCssContent = @"
/* Black bar, gold accents */
.navbar {
  position: sticky; top: 0; z-index: 50;
  display:flex; align-items:center; justify-content:space-between;
  padding: 10px 16px; background:#000;
  border-bottom:1px solid #222;
}
.logo { height: 36px; width:auto; }
.nav-links { list-style:none; display:flex; gap:18px; margin:0; padding:0; }
.nav-links a {
  color:#ffd700; text-decoration:none; font-weight:600;
}
.nav-links a:hover { text-decoration:underline; }
"@
Set-Content $headerCss $headerCssContent -Encoding UTF8

# 4) Pages

# Feed (Facebook-style starter)
$feedPath = "src/pages/Feed.jsx"
$feed = @"
import React from 'react';
import './feed.css';

export default function Feed(){
  return (
    <div className='feed-wrap'>
      <div className='composer'>
        <img className='avatar' src='/logos/powerstream-logo.png' alt='you'/>
        <input className='composer-input' placeholder=""What's going on in your world?"" />
        <button className='post-btn'>Post to PowerFeed</button>
      </div>
      <div className='stories'> {/* future: rotating stories */} </div>
      <div className='feed-stream'>
        <div className='post-card'>Your first post will appear here.</div>
      </div>
    </div>
  );
}
"@
Set-Content $feedPath $feed -Encoding UTF8

# Feed CSS
$feedCssPath = "src/pages/feed.css"
$feedCss = @"
.feed-wrap { max-width: 980px; margin: 24px auto; padding:0 12px; }
.composer { display:flex; gap:12px; background:#111; border:1px solid #222; padding:12px; border-radius:12px; }
.avatar { width:44px; height:44px; border-radius:999px; }
.composer-input { flex:1; background:#000; color:#ffd700; border:1px solid #333; padding:10px 12px; border-radius:12px; }
.post-btn { background:#ffd700; color:#000; font-weight:700; border:none; padding:10px 14px; border-radius:12px; }
.stories { margin:16px 0; height:110px; background:#0d0d0d; border:1px dashed #333; border-radius:12px; }
.feed-stream { display:grid; gap:12px; }
.post-card { background:#111; border:1px solid #222; border-radius:12px; padding:14px; color:#eaeaea; }
"@
Set-Content $feedCssPath $feedCss -Encoding UTF8

# Gram (Instagram-style grid)
$gramPath = "src/pages/Gram.jsx"
$gram = @"
import React from 'react';
import './gram.css';

export default function Gram(){
  const items = Array.from({length:12}, (_,i)=>i);
  return (
    <div className='gram-wrap'>
      {items.map(i=> <div key={i} className='cell'>IG {i+1}</div>)}
    </div>
  );
}
"@
Set-Content $gramPath $gram -Encoding UTF8

$gramCssPath = "src/pages/gram.css"
$gramCss = @"
.gram-wrap { 
  max-width:1040px; margin:24px auto; padding:0 12px;
  display:grid; grid-template-columns: repeat(3, 1fr); gap:8px;
}
.cell { aspect-ratio:1/1; background:#111; border:1px solid #222; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#ffd700; font-weight:700;}
@media (max-width:700p
