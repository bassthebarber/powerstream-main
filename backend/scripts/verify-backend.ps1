# --- Reset & Start PowerStream backend on Windows ---

$ErrorActionPreference = "Continue"
Write-Host "== PowerStream Backend Reset =="

# 1) Go to backend
$backend = Join-Path $PSScriptRoot "backend"
Set-Location $backend

# 2) Ensure logs directories exist
$logs = Join-Path $backend "logs"
$snapshots = Join-Path $logs "snapshots"
if (!(Test-Path $logs)) { New-Item -ItemType Directory -Path $logs | Out-Null }
if (!(Test-Path $snapshots)) { New-Item -ItemType Directory -Path $snapshots | Out-Null }

# 3) Free port 5001 (try two ways)
Write-Host "-> Checking port 5001..."
try {
  $conn = Get-NetTCPConnection -LocalPort 5001 -State Listen -ErrorAction SilentlyContinue
  if ($conn) {
    $pid = $conn.OwningProcess
    Write-Host "   Port 5001 owned by PID $pid. Killing..."
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
  }
} catch {}

# Fallback (if something else is bound quickly)
try {
  $net = (netstat -ano | findstr ":5001") 2>$null
  if ($net) {
    $parts = $net.Trim() -split "\s+"
    $pid2  = $parts[-1]
    if ($pid2 -match '^\d+$') {
      Write-Host "   (fallback) Killing PID $pid2..."
      taskkill /PID $pid2 /F | Out-Null
    }
  }
} catch {}

# 4) Minimal file presence checks (no code parsing)
$mcPath = Join-Path $backend "control-tower\MasterCircuitBoard.js"
if (!(Test-Path $mcPath)) {
  Write-Host "!! Missing MasterCircuitBoard.js at $mcPath" -ForegroundColor Red
  Write-Host "   Create it and run this script again."
  exit 1
}

# 5) Install packages (safe to re-run)
if (!(Test-Path (Join-Path $backend "node_modules"))) {
  Write-Host "-> Installing backend dependencies (first run)..."
  npm install
}

# 6) Start backend (nodemon or node). Prefer npm script if present.
$pkg = Get-Content (Join-Path $backend "package.json") -Raw
$useNodemon = $pkg -match '"dev"\s*:\s*".*nodemon'

$startupLog = Join-Path $logs "startup.log"
"`n==== $(Get-Date -Format s) reset-backend.ps1 starting ====" | Out-File $startupLog -Append -Encoding utf8

if ($useNodemon) {
  Write-Host "-> Starting: npm run dev"
  Start-Process powershell -WorkingDirectory $backend -ArgumentList 'npm run dev'
} else {
  Write-Host "-> Starting: node server.js"
  Start-Process powershell -WorkingDirectory $backend -ArgumentList 'node server.js'
}

# 7) Tail the startup log if your server writes to it (optional). Just show health hint.
Write-Host "`nWhen the server is up, test: http://localhost:5001/api/health"
routes