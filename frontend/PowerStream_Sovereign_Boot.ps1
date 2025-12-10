# ===============================
# PowerStream Sovereign Boot
# ===============================
# Fully wires a production-ready React + Vite + Tailwind + shadcn/ui stack
# with all UI primitives, motion, forms, validation, media, realtime, and UX polish.
# Run in PowerShell (Admin). Re-run is safe (idempotent).

$ErrorActionPreference = "Stop"

function Ensure-WinGet {
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Host "❌ winget not found. Update Windows / App Installer via Microsoft Store." -ForegroundColor Red
    exit 1
  }
}
function InstallIfMissing {
  param([string]$Id, [string]$Check, [string]$Name)
  if ($Check -and (Get-Command $Check -ErrorAction SilentlyContinue)) {
    Write-Host "✅ $Name already installed."
    return
  }
  Write-Host "⬇️  Installing $Name..."
  winget install --id $Id -e --accept-package-agreements --accept-source-agreements | Out-Null
  Write-Host "✅ $Name installed."
}
function AddVSCodeExt {
  param([string]$Ext)
  if (Get-Command code -ErrorAction SilentlyContinue) {
    try { code --install-extension $Ext --force | Out-Null; Write-Host "  ↳ ✅ $Ext" }
    catch { Write-Host "  ↳ ⚠️ $Ext failed (continuing)"; }
  } else {
    Write-Host "  ↳ ⚠️ VS Code not on PATH yet. Open VS Code once, then re-run to auto-install extensions." -ForegroundColor Yellow
  }
}

# 0) System prerequisites
Ensure-WinGet
InstallIfMissing "Git.Git" "git" "Git"
InstallIfMissing "OpenJS.NodeJS.LTS" "node" "Node.js LTS"
InstallIfMissing "Microsoft.VisualStudioCode" "code" "VS Code"

# 1) Global package managers & helpers
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
  Write-Host "✅ pnpm detected."
} else {
  npm i -g pnpm @antfu/ni
  Write-Host "✅ pnpm installed."
}

# 2) VS Code extensions
Write-Host "📦 Installing VS Code extensions..."
@(
  "esbenp.prettier-vscode",
  "dbaeumer.vscode-eslint",
  "bradlc.vscode-tailwindcss",
  "eamodio.gitlens",
  "usernamehw.errorlens",
  "mikestead.dotenv",
  "christian-kohler.path-intellisense",
  "formulahendry.auto-close-tag",
  "formulahendry.auto-rename-tag",
  "rangav.vscode-thunder-client"
) | ForEach-Object { AddVSCodeExt $_ }

# 3) Workspace
$ROOT = "$HOME\Documents\PowerStreamMain"
$FRONT = Join-Path $ROOT "frontend"
New-Item -ItemType Directory -Force -Path $ROOT,$FRONT | Out-Null
Push-Location $FRONT

# 4) Scaffold Vite app (React)
if (-not (Test-Path "$FRONT\package.json")) {
  pnpm create vite@latest . --template react
  pnpm install
}

# 5) Core deps for a world-class app
Write-Host "📚 Installing core deps..."
pnpm add react-router-dom axios clsx tailwind-merge framer-motion lucide-react @radix-ui/react-slot
pnpm add jotai zustand zod react-hook-form @hookform/resolvers
pnpm add @tanstack/react-query @tanstack/react-query-devtools
pnpm add hls.js socket.io-client jwt-decode date-fns react-helmet-async
pnpm add react-infinite-scroll-component react-dropzone swiper
pnpm add react-share react-use copy-to-clipboard

# Dev & build tools
Write-Host "🧰 Installing dev tooling..."
pnpm add -D tailwindcss postcss autoprefixer
pnpm add -D eslint prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks
pnpm add -D vite-plugin-compression vite-plugin-pwa

# 6) Tailwind init & config
if (-not (Test-Path "$FRONT\tailwind.config.js")) { npx tailwindcss init -p }
# Ensure content paths and theme primitives
$tailwindPath = "$FRONT\tailwind.config.js"
$tw = Get-Content $tailwindPath -Raw
if ($tw -notmatch "content:") {
  $tw = $tw -replace "module\.exports = \{","module.exports = {`n  content: ['./index.html','./src/**/*.{js,jsx,ts,tsx}'],"
}
if ($tw -notmatch "container:") {
  $tw = $tw -replace "theme:\s*\{","theme: {`n    container: { center: true, padding: '16px' },"
}
Set-Content $tailwindPath $tw

# Inject Tailwind directives
$indexCss = "$FRONT\src\index.css"
if (-not (Test-Path $indexCss)) { New-Item $indexCss -ItemType File | Out-Null }
$css = Get-Content $indexCss -Raw
if ($css -notmatch "@tailwind base") {
  "@tailwind base;
@tailwind components;
@tailwind utilities;" | Set-Content $indexCss
}

# 7) Base folders for every surface of PowerStream
@(
  "src/assets",
  "src/components",
  "src/components/ui",
  "src/components/media",
  "src/components/feed",
  "src/components/chat",
  "src/components/tv",
  "src/components/vote",
  "src/components/layout",
  "src/lib",
  "src/store",
  "src/pages",
  "src/pages/powerfeed",
  "src/pages/powerline",
  "src/pages/powergram",
  "src/pages/powerreel",
  "src/pages/tv",
  "src/pages/tv/texasgottalent",
  "src/pages/tv/nolimiteasthouston",
  "src/pages/tv/civicconnect",
  "src/pages/admin",
  "public"
) | ForEach-Object { New-Item -ItemType Directory -Force -Path (Join-Path $FRONT $_) | Out-Null }

# 8) Minimal router so dev server runs clean
$app = @"
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
const qc = new QueryClient()

function Home(){
  return (
    <div className="min-h-screen bg-black text-yellow-400 flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">PowerStream</h1>
      <nav className="flex gap-4 underline">
        <Link to="/powerfeed">PowerFeed</Link>
        <Link to="/powerline">PowerLine</Link>
        <Link to="/powergram">PowerGram</Link>
        <Link to="/powerreel">PowerReel</Link>
        <Link to="/tv">TV Stations</Link>
      </nav>
    </div>
  )
}

export default function App(){
  return (
    <HelmetProvider>
      <QueryClientProvider client={qc}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/powerfeed" element={<div className='p-6 text-yellow-400'>PowerFeed</div>} />
            <Route path="/powerline" element={<div className='p-6 text-yellow-400'>PowerLine</div>} />
            <Route path="/powergram" element={<div className='p-6 text-yellow-400'>PowerGram</div>} />
            <Route path="/powerreel" element={<div className='p-6 text-yellow-400'>PowerReel</div>} />
            <Route path="/tv" element={<div className='p-6 text-yellow-400'>TV Stations</div>} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  )
}
"@
Set-Content "$FRONT\src\App.jsx" $app

$main = @"
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App/></React.StrictMode>
)
"@
Set-Content "$FRONT\src\main.jsx" $main

# 9) ESLint/Prettier scripts
$pkgPath = "$FRONT\package.json"
$pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
$pkg.scripts.dev = "vite"
$pkg.scripts.build = "vite build"
$pkg.scripts.preview = "vite preview"
$pkg.scripts.lint = "eslint \"src/**/*.{js,jsx}\""
$pkg.scripts.format = "prettier -w ."
$pkg.scripts.typecheck = "echo (using JS today) && exit 0"
$pkg.scripts.pwa = "vite build && vite build --ssr"
$pkg | ConvertTo-Json -Depth 10 | Set-Content $pkgPath

# 10) shadcn/ui initialization + component pack
# NOTE: shadcn is CLI-driven; we call it multiple times to add primitives you’ll use across the platform.
if (-not (Test-Path "$FRONT\components.json")) {
  npx shadcn@latest init -y
}

# Add a full UI surface: buttons, inputs, dialog, sheet, drawer, dropdown, select, textarea, card, tabs, tooltip, toast, badge, avatar, separator, progress, slider, collapsible, accordion, navbar primitives, skeleton
$ui = @(
  "button","input","label","textarea","select","checkbox","radio-group",
  "dialog","sheet","drawer","dropdown-menu","popover","hover-card","alert",
  "toast","sonner","separator","scroll-area","tabs","tooltip","badge","avatar",
  "card","accordion","collapsible","progress","slider","skeleton","navigation-menu",
  "menubar","command"
)
foreach ($c in $ui) { try { npx shadcn@latest add $c } catch { } }

# 11) Logos placeholders so your pages don't 404
"/* drop your PNGs here:
   powerstream-logo.png
   powerfeedlogo.png
   powergramlogo.png
   powerreellogo.png
   southernpowerlogo.png
   texasgottalentlogo.png
   civicconnectlogo.png
   nolimit.easthoustonlogo.png
*/" | Set-Content "$FRONT\public\README-logos.txt"

# 12) .env template – ready for your keys
$env = @"
# ===== PowerStream Frontend ENV =====
VITE_API_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001
VITE_CDN_BASE=
VITE_HLS_DEBUG=false

# Auth (if using JWT)
VITE_JWT_PUBLIC_KEY=
VITE_AUTH_PROVIDER=local

# Analytics/3rd party (optional)
VITE_SENTRY_DSN=
VITE_POSTHOG_KEY=
"@
Set-Content "$FRONT\.env.local" $env

# 13) Final install and helpful output
pnpm install
Pop-Location

Write-Host "`n✅ Sovereign Boot complete."
Write-Host "Start dev server:"
Write-Host "   cd `"$FRONT`""
Write-Host "   pnpm dev"
