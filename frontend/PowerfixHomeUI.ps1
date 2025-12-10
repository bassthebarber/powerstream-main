# PowerFixHomeUI.ps1
# One-click “make it work” for PowerStream dev

$ErrorActionPreference = "Stop"
Write-Host "`n🚀 Launching PowerStream UI Recovery..." -ForegroundColor Yellow

function Find-Frontend {
  $here = Get-Location
  if (Test-Path "$($here)\frontend\package.json") { return "$($here)\frontend" }
  if (Test-Path "$($here)\package.json" -and (Test-Path "$($here)\src")) { return "$here" }
  throw "Can't find a frontend folder. Run this from the repo root or frontend folder."
}

function Kill-Port {
  param([int]$Port)
  try {
    $lines = netstat -ano | Select-String ":$Port\s+LISTENING"
    foreach ($l in $lines) {
      $pid = ($l.ToString().Trim() -split '\s+')[-1]
      if ($pid -match '^\d+$') {
        Write-Host "🔪 Killing process $pid on port $Port..." -ForegroundColor DarkYellow
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
      }
    }
  } catch {}
}

function Wait-Until-Up {
  param([string]$Url, [int]$TimeoutSec = 60)
  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  while ((Get-Date) -lt $deadline) {
    try {
      $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -Method Head -TimeoutSec 2
      if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { return $true }
    } catch {}
    Start-Sleep -Milliseconds 600
  }
  return $false
}

# 1) Locate frontend & cd
$FE = Find-Frontend
Set-Location $FE
Write-Host "📂 Frontend: $FE" -ForegroundColor Cyan

# 2) Ensure deps
if (-not (Test-Path "node_modules")) {
  Write-Host "📦 Installing dependencies (node_modules missing)..." -ForegroundColor Cyan
  npm install
} else {
  Write-Host "📦 Dependencies present." -ForegroundColor DarkGray
}

# 3) Kill previous Vite on :5173 (or :5174/:5175 just in case)
Kill-Port 5173; Kill-Port 5174; Kill-Port 5175

# 4) Quick asset sanity checks
$missing = @()
$assets = @(
  "public\logos\powerstream-logo.png",
  "public\logos\powerfeedlogo.png",
  "public\logos\PowerGramlogo.png",
  "public\logos\PowerReelLogo.png",
  "public\logos\powerlinelogo.png",
  "public\logos\southernpowernetworklogo.png",
  "public\logos\texasgottalentlogo.png",
  "public\logos\nolimiteasthoustonlogo.png",
  "public\logos\civicconnectlogo.png",
  "public\audio\welcome-voice.mp3",
  "public\tv\stations.json"
)
foreach ($a in $assets) { if (-not (Test-Path $a)) { $missing += $a } }

if ($missing.Count -gt 0) {
  Write-Host "❗ Missing required files:" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
} else {
  Write-Host "✅ Required logos/audio/stations.json found." -ForegroundColor Green
}

# 5) Start dev server in background (write logs to .powerstream-dev.log)
Write-Host "🛠️ Starting Vite (npm run dev)..." -ForegroundColor Cyan
$log = Join-Path $FE ".powerstream-dev.log"
if (Test-Path $log) { Remove-Item $log -Force }
$job = Start-Job -Name "ps-vite" -ScriptBlock {
  npm run dev *>> ".powerstream-dev.log"
}
Start-Sleep -Seconds 1

# 6) Wait for server to be reachable
$ok = Wait-Until-Up -Url "http://localhost:5173" -TimeoutSec 70
if (-not $ok) {
  Write-Host "❌ Vite did not come up on :5173. Tail log below:" -ForegroundColor Red
  if (Test-Path $log) { Get-Content $log -Tail 120 }
  throw "Dev server failed to start."
}

Write-Host "🌐 Opening http://localhost:5173 ..." -ForegroundColor Cyan
try {
  Start-Process "msedge.exe" "http://localhost:5173" -WindowStyle Maximized
} catch {
  Start-Process "http://localhost:5173"
}

Write-Host "🎙️ If the welcome audio doesn’t play, click anywhere once to satisfy autoplay." -ForegroundColor DarkYellow
Write-Host "🏁 PowerFixHomeUI.ps1 Complete.`n" -ForegroundColor Yellow
