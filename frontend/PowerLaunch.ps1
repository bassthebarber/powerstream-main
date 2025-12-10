# PowerLaunch.ps1 - Final UI & Server Launcher for PowerStream
param(
  [int] $ApiPort = 5001,
  [int] $WebPort = 5173,
  [switch] $CleanInstall
)

$ErrorActionPreference = "Stop"
Write-Host "🔌 PowerStream: Final Launch Sequence Initiated..." -ForegroundColor Cyan

# --- Resolve paths based on this script's location ---
$root        = Split-Path -Parent $PSCommandPath
$frontendDir = Join-Path $root "frontend"
$backendDir  = Join-Path $root "backend"

if (!(Test-Path $frontendDir)) { throw "Cannot find frontend at $frontendDir" }
if (!(Test-Path $backendDir))  { throw "Cannot find backend at  $backendDir" }

# --- Helpers ---
function Get-PortPid([int]$port){
  (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    Select-Object -First 1 -ExpandProperty OwningProcess)
}
function Kill-Port([int]$port){
  $pid = Get-PortPid $port
  if ($pid) {
    Write-Host "🛑 Killing PID $pid on port $port..." -ForegroundColor DarkYellow
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 300
  }
}
function NpmInstallSafe($dir){
  Push-Location $dir
  if ($CleanInstall) {
    Write-Host "🧹 Clean install in $dir" -ForegroundColor DarkYellow
    Remove-Item -Force -ErrorAction Ignore package-lock.json
    Remove-Item -Recurse -Force -ErrorAction Ignore node_modules
  }
  if (Test-Path "package-lock.json") { npm ci } else { npm install }
  Pop-Location
}

# --- Free ports  ---
Kill-Port $ApiPort
Kill-Port $WebPort

# --- Install deps (optional clean) ---
NpmInstallSafe $backendDir
NpmInstallSafe $frontendDir

# --- Start backend ---
Write-Host "🚀 Starting Backend on port $ApiPort..." -ForegroundColor Yellow
Start-Process powershell -WorkingDirectory $backendDir `
  -ArgumentList "npm run dev" -WindowStyle Minimized

Start-Sleep -Seconds 3

# --- Start frontend (Vite dev) ---
Write-Host "🚀 Starting Frontend on port $WebPort..." -ForegroundColor Yellow
Start-Process powershell -WorkingDirectory $frontendDir `
  -ArgumentList "npm run dev -- --port $WebPort --strictPort" -WindowStyle Minimized

Start-Sleep -Seconds 3

# --- Validate logos ---
$logos = @(
  "frontend/public/logos/powerstream-logo.png",
  "frontend/public/logos/southernpowernetworklogo.png",
  "frontend/public/logos/texasgottalentlogo.png",
  "frontend/public/logos/nolimiteasthoustonlogo.png",
  "frontend/public/logos/civicconnectlogo.png",
  "frontend/public/logos/worldwidetv.png",
  "frontend/public/logos/powerfeedlogo.png",
  "frontend/public/logos/PowerGramlogo.png",
  "frontend/public/logos/PowerReelLogo.png",
  "frontend/public/logos/powerlinelogo.png"
)

Write-Host "🧠 Verifying logos..." -ForegroundColor Cyan
foreach ($logo in $logos) {
  $path = Join-Path $root $logo
  if (Test-Path $path) { Write-Host "✅ $logo" -ForegroundColor Green }
  else { Write-Host "❌ Missing $logo" -ForegroundColor Red }
}

# --- Check env keys ---
Write-Host "🔍 Checking frontend/.env.local for Livepeer & Supabase..." -ForegroundColor Cyan
$envPath = Join-Path $frontendDir ".env.local"
if (Test-Path $envPath) {
  $envText = Get-Content $envPath -Raw
  foreach ($k in @("LIVEPEER_API_KEY","VITE_SUPABASE_URL","VITE_SUPABASE_ANON_KEY")) {
    if ($envText -match "^$k=") { Write-Host "✅ $k found" -ForegroundColor Green }
    else { Write-Host "❌ $k missing" -ForegroundColor Red }
  }
} else {
  Write-Host "❌ .env.local not found in frontend!" -ForegroundColor Red
}

# --- Open browser ---
$homeUrl = "http://localhost:$WebPort"
Write-Host "🌐 Opening $homeUrl ..." -ForegroundColor Cyan
Start-Process $homeUrl
Write-Host "`n🎉 PowerStream UI launch complete!" -ForegroundColor Green
Write-Host "📡 Test: PowerFeed, Gram, Reel, TV" -ForegroundColor Yellow
Write-Host "👤 Login via Supabase auth" -ForegroundColor Gray
