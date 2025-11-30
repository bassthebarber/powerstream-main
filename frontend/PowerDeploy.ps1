param(
  [ValidateSet("dev","production")] [string] $Mode = "production",
  [int] $Port = ($Mode -eq "production" ? 4173 : 5173),
  [switch] $Open
)

$ErrorActionPreference = "Stop"
Write-Host " Deploying PowerStream UI ($Mode)..." -ForegroundColor Cyan

# 1) Basic checks
function Need($cmd) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    throw "Missing requirement: $cmd"
  }
}
Need node
Need npm

# 2) Install deps (faster + consistent)
if (Test-Path package-lock.json) {
  Write-Host "�� Installing dependencies with npm ci..."
  npm ci
} else {
  Write-Host "📦 Installing dependencies with npm install..."
  npm install
}

# 3) Pick script & port
if ($Mode -eq "production") {
  Write-Host "🏗️ Building production bundle..."
  npm run build

  Write-Host "🛰️ Starting preview server on port $Port..."
  # Kill existing preview on that port if any
  $pidOnPort = (Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue).OwningProcess
  if ($pidOnPort) { Write-Host "⚠️ Port $Port in use by PID $pidOnPort — stopping..."; Stop-Process -Id $pidOnPort -Force }
  npx vite preview --port $Port --strictPort
} else {
  Write-Host "🛰️ Starting dev server on port $Port..."
  # Kill existing dev on that port if any
  $pidOnPort = (Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue).OwningProcess
  if ($pidOnPort) { Write-Host "⚠️ Port $Port in use by PID $pidOnPort  stopping..."; Stop-Process -Id $pidOnPort -Force }
  npm run dev -- --port $Port --strictPort
}

# 4) Optionally open
if ($Open) {
  Start-Process "http://localhost:$Port"
  Write-Host " Opened http://localhost:$Port"
}

