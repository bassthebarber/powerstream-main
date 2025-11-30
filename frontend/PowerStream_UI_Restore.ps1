Got you. Here’s a **one-shot PowerShell script** that **restores a clean UI**, fixes your router, recreates all the core pages (Home, PowerFeed, PowerLine, PowerGram, PowerReel, TV + sub-stations), adds a basic header/footer, a 404 page, Tailwind hooks, and ensures there’s **only one BrowserRouter** (in `main.jsx`). It also normalizes React files to `.jsx`.

Save this as **`PowerStream_UI_Restore.ps1`** in your **frontend** folder and run it from an **Admin PowerShell**.

```powershell
# ================================
# PowerStream_UI_Restore.ps1
# Run this INSIDE your frontend folder (the one with package.json)
# ================================
$ErrorActionPreference = "Stop"

# 0) Sanity check
if (-not (Test-Path ".\package.json")) {
  Write-Host "❌ Not in the frontend folder (package.json missing). cd into frontend first." -ForegroundColor Red
  exit 1
}

# 1) Create folders
$dirs = @(
  "src",
  "src/components",
  "src/components/layout",
  "src/pages",
  "src/pages/powerfeed",
  "src/pages/powerline",
  "src/pages/powergram",
  "src/pages/powerreel",
  "src/pages/tv",
  "src/pages/tv/texasgottalent",
  "src/pages/tv/nolimiteasthouston",
  "src/pages/tv/civicconnect"
)
$dirs | ForEach-Object { New-Item -ItemType Directory -Force -Path $_ | Out-Null }

# 2) Normalize .js -> .jsx in src (keeps backend untouched)
Get-ChildItem -Recurse -Include *.js -Path .\src | ForEach-Object {
  $new = [System.IO.Path]::ChangeExtension($_.FullName, ".jsx")
  if (-not (Test-Path $new)) { Rename-Item $_.FullName $new -Force }
}

# 3) Tailwind base (safe write)
if (-not (Test-Path ".\src\index.css")) { New-Item ".\src\index.css" -ItemType File | Out-Null }
$css = "@tailwind base;
@tailwind components;
@tailwind utilities;

:root { --ps-bg:#000; --ps-gold:#facc15; }
body { background: var(--ps-bg); color: var(--ps-gold); }
a { color: var(--ps-gold); }
"
Set-Content ".\src\index.css" $css -Encoding UTF8

# 4) Layout components
$HeaderBar = @"
export default function HeaderBar(){
  return (
    <header className="w-full border-b border-yellow-500/30 bg-black/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-2xl font-bold tracking-wide">PowerStream</div>
        <nav className="flex gap-4 text-sm">
          <a href="/powerfeed">PowerFeed</a>
          <a href="/powerline">PowerLine</a>
          <a href="/powergram">PowerGram</a>
          <a href="/powerreel">PowerReel</a>
          <a href="/tv">Stations</a>
        </nav>
      </div>
    </header>
  )
}
"@
Set-Content ".\src\components\layout\HeaderBar.jsx" $HeaderBar -Encoding UTF8

$FooterBar = @"
export default function FooterBar(){
  return (
    <footer className="w-full border-t border-yellow-500/30 bg-black/80 mt-10">
      <div className="container mx-auto px-4 py-4 text-xs text-yellow-400/80 flex items-center justify-between">
        <span>© PowerStream</span>
        <span>Southern Power Network</span>
      </div>
    </footer>
  )
}
"@
Set-Content ".\src\components\layout\FooterBar.jsx" $FooterBar -Encoding UTF8

# 5) Pages
$Home = @"
export default function Home(){
  return (
    <div className='min-h-[70vh] flex flex-col items-center justify-center gap-6'>
      <h1 className='text-4xl font-extrabold'>Welcome to PowerStream</h1>
      <p className='opacity-80'>Choose a surface to explore:</p>
      <div className='flex gap-4 flex-wrap justify-center'>
        <a className='underline' href='/powerfeed'>PowerFeed</a>
        <a className='underline' href='/powerline'>PowerLine</a>
        <a className='underline' href='/powergram'>PowerGram</a>
        <a className='underline' href='/powerreel'>PowerReel</a>
        <a className='underline' href='/tv'>TV Stations</a>
      </div>
    </div>
  )
}
"@
Set-Content ".\src\pages\Home.jsx" $Home -Encoding UTF8

$NotFound = @"
import { Link } from 'react-router-dom'
export default function NotFound(){
  return (
    <div className='min-h-[70vh] flex flex-col items-center justify-center gap-3'>
      <div className='text-3xl font-bold'>404</div>
      <div className='opacity-80'>Page not found</div>
      <Link className='underline' to='/'>Go Home</Link>
    </div>
  )
}
"@
Set-Content ".\src\pages\NotFound.jsx" $NotFound -Encoding UTF8

$Stub = @"
export default function PageStub({title}) {
  return (
    <div className='p-6'>
      <h2 className='text-2xl font-bold mb-2'>{title}</h2>
      <p className='opacity-80'>UI restored—ready to drop in your feature code.</p>
    </div>
  )
}
"@
Set-Content ".\src\components\PageStub.jsx" $Stub -Encoding UTF8

# Feature stubs
Set-Content ".\src\pages\powerfeed\Index.jsx" "import PageStub from '../../components/PageStub'; export default () => <PageStub title='PowerFeed' />" -Encoding UTF8
Set-Content ".\src\pages\powerline\Index.jsx" "import PageStub from '../../components/PageStub'; export default () => <PageStub title='PowerLine (Chat)' />" -Encoding UTF8
Set-Content ".\src\pages\powergram\Index.jsx" "import PageStub from '../../components/PageStub'; export default () => <PageStub title='PowerGram' />" -Encoding UTF8
Set-Content ".\src\pages\powerreel\Index.jsx" "import PageStub from '../../components/PageStub'; export default () => <PageStub title='PowerReel' />" -Encoding UTF8

$TVIndex = @"
import { Link, Outlet } from 'react-router-dom'
export default function TVIndex(){
  return (
    <div className='p-6'>
      <h2 className='text-2xl font-bold mb-3'>TV Stations</h2>
      <div className='flex gap-4 flex-wrap mb-6 underline'>
        <Link to='texasgottalent'>Texas Got Talent</Link>
        <Link to='nolimiteasthouston'>No Limit East Houston</Link>
        <Link to='civicconnect'>Civic Connect</Link>
      </div>
      <Outlet/>
    </div>
  )
}
"@
Set-Content ".\src\pages\tv\Index.jsx" $TVIndex -Encoding UTF8
Set-Content ".\src\pages\tv\texasgottalent\Index.jsx" "import PageStub from '../../../components/PageStub'; export default () => <PageStub title='Texas Got Talent (Voting + Live) '/>" -Encoding UTF8
Set-Content ".\src\pages\tv\nolimiteasthouston\Index.jsx" "import PageStub from '../../../components/PageStub'; export default () => <PageStub title='No Limit East Houston TV' />" -Encoding UTF8
Set-Content ".\src\pages\tv\civicconnect\Index.jsx" "import PageStub from '../../../components/PageStub'; export default () => <PageStub title='Civic Connect TV' />" -Encoding UTF8

# 6) App.jsx (routes only, NO BrowserRouter here)
$App = @"
import HeaderBar from './components/layout/HeaderBar'
import FooterBar from './components/layout/FooterBar'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

import { Routes, Route, Navigate } from 'react-router-dom'
import Feed from './pages/powerfeed/Index'
import Line from './pages/powerline/Index'
import Gram from './pages/powergram/Index'
import Reel from './pages/powerreel/Index'

import TV from './pages/tv/Index'
import TGT from './pages/tv/texasgottalent/Index'
import NL from './pages/tv/nolimiteasthouston/Index'
import CC from './pages/tv/civicconnect/Index'

export default function App(){
  return (
    <div className='min-h-screen bg-black text-yellow-400'>
      <HeaderBar/>
      <main className='container mx-auto px-4 py-6'>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/home' element={<Navigate to='/' replace/>}/>
          <Route path='/powerfeed' element={<Feed/>}/>
          <Route path='/powerline' element={<Line/>}/>
          <Route path='/powergram' element={<Gram/>}/>
          <Route path='/powerreel' element={<Reel/>}/>

          <Route path='/tv' element={<TV/>}>
            <Route index element={<div className="opacity-80">Choose a station above.</div>} />
            <Route path='texasgottalent' element={<TGT/>}/>
            <Route path='nolimiteasthouston' element={<NL/>}/>
            <Route path='civicconnect' element={<CC/>}/>
          </Route>

          <Route path='*' element={<NotFound/>}/>
        </Routes>
      </main>
      <FooterBar/>
    </div>
  )
}
"@
Set-Content ".\src\App.jsx" $App -Encoding UTF8

# 7) main.jsx (SINGLE BrowserRouter here)
$Main = @"
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
"@
Set-Content ".\src\main.jsx" $Main -Encoding UTF8

# 8) Ensure dev scripts exist
$pkgPath = ".\package.json"
$pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
$pkg.scripts.dev = "vite"
$pkg.scripts.build = "vite build"
$pkg.scripts.preview = "vite preview"
$pkg | ConvertTo-Json -Depth 20 | Set-Content $pkgPath

# 9) Install & Done
pnpm install | Out-Null
Write-Host "`n✅ UI restored. Start your dev server with:" -ForegroundColor Green
Write-Host "   pnpm dev" -ForegroundColor Yellow
```

## How to run

1. Open **PowerShell (Admin)**
2. Go to your **frontend** folder (the one with `package.json`):

```powershell
cd C:\Users\<YOU>\Documents\PowerStreamMain\frontend
```

3. Save the script there as `PowerStream_UI_Restore.ps1`
4. Run:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force
.\PowerStream_UI_Restore.ps1
pnpm dev
```

You’ll get:

* Clean Home with header/footer
* Working routes: `/`, `/powerfeed`, `/powerline`, `/powergram`, `/powerreel`, `/tv` and its sub-routes
* 404 catch-all
* Tailwind styles active
* **Only one** BrowserRouter (warning banners about React Router “future flags” may remain, but they’re harmless)

When you’re ready, tell me which surface (PowerFeed, PowerLine, Reels/Gram, TV Guide, or Voting) you want fleshed out next and I’ll drop in the full, branded components to replace the PageStub placeholders.
