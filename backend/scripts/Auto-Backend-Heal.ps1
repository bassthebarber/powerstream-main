# PowerStream Auto-Backend-Heal Script
# Ensures ESM mode, fixes imports, restarts backend

Write-Host "[*] BACKEND AUTO-HEAL starting..." -ForegroundColor Cyan

$backendDir = Split-Path -Parent $PSScriptRoot
if (-not $backendDir) { $backendDir = "$PSScriptRoot/.." }

# Ensure ESM mode in package.json
$pkgPath = Join-Path $backendDir "package.json"
if (Test-Path $pkgPath) {
    $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
    if ($pkg.type -ne "module") {
        Write-Host "[*] Setting type: module in package.json..." -ForegroundColor Yellow
        $pkg | Add-Member -NotePropertyName "type" -NotePropertyValue "module" -Force
        $pkg | ConvertTo-Json -Depth 10 | Set-Content $pkgPath
        Write-Host "[OK] ESM mode enabled." -ForegroundColor Green
    } else {
        Write-Host "[OK] ESM mode already set." -ForegroundColor Green
    }
}

# Kill existing node processes
Write-Host "[*] Stopping existing Node processes..." -ForegroundColor Yellow
taskkill /IM node.exe /F 2>$null | Out-Null

# Wait for processes to terminate
Start-Sleep -Seconds 2

# Restart backend
Write-Host "[*] Restarting backend..." -ForegroundColor Cyan
$backendCmd = "cd `"$backendDir`"; node server.js"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Normal

Write-Host "[OK] BACKEND AUTO-HEAL COMPLETE" -ForegroundColor Green



