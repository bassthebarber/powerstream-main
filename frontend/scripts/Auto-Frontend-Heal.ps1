# PowerStream Auto-Frontend-Heal Script
# Fixes common frontend issues and restarts

Write-Host "[*] FRONTEND AUTO-HEAL running..." -ForegroundColor Cyan

$frontendDir = Split-Path -Parent $PSScriptRoot
if (-not $frontendDir) { $frontendDir = "$PSScriptRoot/.." }

# Clear Vite cache
$viteCachePath = Join-Path $frontendDir "node_modules/.vite"
if (Test-Path $viteCachePath) {
    Write-Host "[*] Clearing Vite cache..." -ForegroundColor Yellow
    Remove-Item $viteCachePath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "[OK] Vite cache cleared." -ForegroundColor Green
}

# Kill existing node processes
Write-Host "[*] Stopping existing Node processes..." -ForegroundColor Yellow
taskkill /IM node.exe /F 2>$null | Out-Null

# Wait for processes to terminate
Start-Sleep -Seconds 2

# Restart frontend
Write-Host "[*] Restarting frontend (Vite)..." -ForegroundColor Cyan
$frontendCmd = "cd `"$frontendDir`"; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Normal

Write-Host "[OK] FRONTEND AUTO-HEAL COMPLETE" -ForegroundColor Green



