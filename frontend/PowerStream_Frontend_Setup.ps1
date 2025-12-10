# ===========================
# PowerStream_Frontend_Setup.ps1
# ===========================
# Idempotent Windows setup for UI dev (Vite + React + Tailwind + shadcn/ui)
# Run in PowerShell (Admin) after enabling RemoteSigned for CurrentUser.

$ErrorActionPreference = "Stop"

function Ensure-WinGet {
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Host "❌ winget not found. Please update to Windows 10/11 with Microsoft Store App Installer." -ForegroundColor Red
    exit 1
  }
}

function Install-IfMissing {
  param(
    [string]$PackageId,
    [string]$CheckCmd,
    [string]$DisplayName
  )
  if ($CheckCmd -and (Get-Command $CheckCmd -ErrorAction SilentlyContinue)) {
    Write-Host "✅ $DisplayName already installed."
    return
  }
  Write-Host "⬇️  Installing $DisplayName..."
  winget install --id $PackageId --source winget -e --accept-package-agreements --accept-source-agreements | Out-Null
  Write-Host "✅ $DisplayName installed."
}

function VSCode-Install-Extension {
  param([string]$Ext)
  $code = Get-Command code -ErrorAction SilentlyContinue
  if ($null -eq $code) {
    Write-Host "⚠️ VS Code not on PATH yet; skipping extensions on this run." -ForegroundColor Yellow
    return
  }
  try {
    code --install-extension $Ext --force | Out-Null
    Write-Host "  ↳ ✅ $Ext"
  } catch {
    Write-Host "  ↳ ⚠️ Could not install $Ext (will still proceed)."
  }
}

# 0) Pre-checks
Ensure-WinGet

# 1) Core tools
Install-IfMissing -PackageId "Git.Git" -CheckCmd "git" -DisplayName "Git"
Install-IfMissing -PackageId "OpenJS.NodeJS.LTS" -CheckCmd "node" -DisplayName "Node.js (LTS)"
Install-IfMissing -PackageId "Microsoft.VisualStudioCode" -CheckCmd "code" -DisplayName "VS Code"

# 2) pnpm (global)
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
  Write-Host "✅ pnpm already installed."
} else {
  Write-Host "⬇️  Installing pnpm globally..."
  npm i -g pnpm @antfu/ni
  Write-Host "✅ pnpm installed."
}

# 3) VS Code extensions (frontend must-haves)
Write-Host "📦 Installing VS Code extensions..."
$extensions = @(
  "esbenp.prettier-vscode",
  "dbaeumer.vscode-eslint",
  "bradlc.vscode-tailwindcss",
  "eamodio.gitlens",
  "VisualStudioExptTeam.vscodeintellicode",
  "streetsidesoftware.code-spell-checker",
  "naumovs.color-highlight",
  "usernamehw.errorlens",
  "formulahendry.auto-rename-tag",
  "formulahendry.auto-close-tag",
  "christian-kohler.path-intellisense",
  "mgmcdermott.vscode-language-babel",
  "mikestead.dotenv",
  "rangav.vscode-thunder-client" # lightweight API tester
)
foreach ($e in $extensions) { VSCode-Install-Extension $e }

# 4) Workspace folders
$Root = "$HOME\Documents\PowerStreamMain"
$Frontend = Join-Path $Root "frontend"
$Backend = Join-Path $Root "backend"
New-Item -ItemType Directory -Force -Path $Root, $Frontend, $Backend | Out-Null
Write-Host "📁 Workspace: $Root"

# 5) Create Vite + React app
Push-Location $Frontend
if (-not (Test-Path "$Frontend\package.json")) {
  Write-Host "⚙️  Bootstrapping Vite + React app..."
  pnpm create vite@latest . --template react
  pnpm install
} else {
  Write-Host "✅ Vite project already present; skipping scaffold."
}

# 6) Install UI deps (router, tailwind, shadcn, forms, animation, media, chat, auth helpers)
Write-Host "📦 Installing UI libraries..."
pnpm add react-router-dom axios clsx tailwind-merge framer-motion lucide-react \
  @radix-ui/react-slot \
  jotai zustand zod react-hook-form @hookform/resolvers \
  hls.js socket.io-client jwt-decode date-fns

# 7) Dev tools (ESLint/Prettier/Tailwind/PostCSS/types support for JS projects too)
Write-Host "🧰 Installing dev tooling..."
pnpm add -D eslint prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks \
  tailwindcss postcss autoprefixer @types/node @types/react @types/react-dom

# 8) Tailwind init
if (-not (Test-Path "$Frontend\tailwind.config.js")) {
  Write-Host "🎛️  Initializing Tailwind..."
  npx tailwindcss init -p
}

# 9) Configure Tailwind content paths (safe replace)
$tailwindPath = Join-Path $Frontend "tailwind.config.js"
$tailwind = Get-Content $tailwindPath -Raw
if ($tailwind -notmatch "content:") {
  $tailwind = $tailwind -replace "module\.exports = \{", "module.exports = {`n  content: ['./index.html','./src/**/*.{js,jsx,ts,tsx}'],"
  Set-Content $tailwindPath $tailwind
}
Write-Host "✅ Tailwind config updated."

# 10) Inject Tailwind base into index.css if missing
$indexCss = Join-Path $Frontend "src\index.css"
if (-not (Test-Path $indexCss)) { New-Item $indexCss -ItemType File | Out-Null }
$cssContent = Get-Content $indexCss -Raw
if ($cssContent -notmatch "@tailwind base") {
  "@tailwind base;
@tailwind components;
@tailwind utilities;" | Set-Content $indexCss
  Write-Host "✅ Tailwind directives added to src/index.css"
}

# 11) Add helpful npm scripts
$pkgPath = Join-Path $Frontend "package.json"
$pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
$pkg.scripts.dev = "vite"
$pkg.scripts.build = "vite build"
$pkg.scripts.preview = "vite preview"
$pkg.scripts.lint = "eslint \"src/**/*.{js,jsx}\""
$pkg.scripts.format = "prettier -w ."
$pkg | ConvertTo-Json -Depth 10 | Set-Content $pkgPath
Write-Host "✅ package.json scripts set."

# 12) Create base folders for your apps/sections
$dirs = @(
  "src/components",
  "src/pages",
  "src/pages/powerfeed",
  "src/pages/powerline",
  "src/pages/powergram",
  "src/pages/powerreel",
  "src/pages/tv",
  "src/pages/tv/texasgottalent",
  "src/pages/tv/nolimiteasthouston",
  "src/pages/tv/civicconnect",
  "src/lib",
  "src/store",
  "src/assets"
)
foreach ($d in $dirs) { New-Item -ItemType Directory -Force -Path (Join-Path $Frontend $d) | Out-Null }

# 13) Drop a super-minimal router so the dev server starts cleanly
$appPath = Join-Path $Frontend "src\App.jsx"
$appBoiler = @"
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-black text-yellow-400 flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">PowerStream UI</h1>
      <nav className="flex gap-4 underline">
        <Link to="/powerfeed">PowerFeed</Link>
        <Link to="/powerline">PowerLine</Link>
        <Link to="/powergram">PowerGram</Link>
        <Link to="/powerreel">PowerReel</Link>
        <Link to="/tv">TV Stations</Link>
      </nav>
    </div>
  );
}

export default function App() {
  return (
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
  );
}
"@
Set-Content $appPath $appBoiler

# 14) Ensure main.jsx imports App and CSS
$mainPath = Join-Path $Frontend "src\main.jsx"
$mainBoiler = @"
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
"@
Set-Content $mainPath $mainBoiler

# 15) Final install and start
pnpm install
Write-Host "`n✅ Setup complete. To start developing:"
Write-Host "   cd `"$Frontend`""
Write-Host "   pnpm dev"
Pop-Location
