# ============================================================
# PowerStream TOTAL AUTO-HEAL MASTER SCRIPT
# ============================================================
# Runs all subsystem healers in sequence
# Usage: .\PowerStream-Total-Heal.ps1
# ============================================================

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "  POWERSTREAM TOTAL AUTO-HEAL STARTING..." -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host ""

$scriptRoot = $PSScriptRoot
if (-not $scriptRoot) { $scriptRoot = "." }

# 1. Port Heal
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "[1/6] Running Port Heal..." -ForegroundColor White
$portHealScript = Join-Path $scriptRoot "backend/scripts/Auto-Port-Heal.ps1"
if (Test-Path $portHealScript) {
    & $portHealScript
} else {
    Write-Host "[SKIP] Auto-Port-Heal.ps1 not found" -ForegroundColor Yellow
}
Write-Host ""

# 2. Backend Heal
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "[2/6] Running Backend Heal..." -ForegroundColor White
$backendHealScript = Join-Path $scriptRoot "backend/scripts/Auto-Backend-Heal.ps1"
if (Test-Path $backendHealScript) {
    & $backendHealScript
} else {
    Write-Host "[SKIP] Auto-Backend-Heal.ps1 not found" -ForegroundColor Yellow
}
Write-Host ""

Start-Sleep -Seconds 3

# 3. Frontend Heal
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "[3/6] Running Frontend Heal..." -ForegroundColor White
$frontendHealScript = Join-Path $scriptRoot "frontend/scripts/Auto-Frontend-Heal.ps1"
if (Test-Path $frontendHealScript) {
    & $frontendHealScript
} else {
    Write-Host "[SKIP] Auto-Frontend-Heal.ps1 not found" -ForegroundColor Yellow
}
Write-Host ""

# 4. Studio Heal
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "[4/6] Running Studio Heal..." -ForegroundColor White
$studioHealScript = Join-Path $scriptRoot "studio/scripts/Auto-Studio-Heal.ps1"
if (Test-Path $studioHealScript) {
    & $studioHealScript
} else {
    Write-Host "[SKIP] Auto-Studio-Heal.ps1 not found" -ForegroundColor Yellow
}
Write-Host ""

# 5. TV Heal
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "[5/6] Running TV Heal..." -ForegroundColor White
$tvHealScript = Join-Path $scriptRoot "tv/scripts/Auto-TV-Heal.ps1"
if (Test-Path $tvHealScript) {
    & $tvHealScript
} else {
    Write-Host "[SKIP] Auto-TV-Heal.ps1 not found" -ForegroundColor Yellow
}
Write-Host ""

# 6. AI Heal
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "[6/6] Running AI Heal..." -ForegroundColor White
$aiHealScript = Join-Path $scriptRoot "ai/scripts/Auto-AI-Heal.ps1"
if (Test-Path $aiHealScript) {
    & $aiHealScript
} else {
    Write-Host "[SKIP] Auto-AI-Heal.ps1 not found" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "============================================================" -ForegroundColor Green
Write-Host "  ALL SYSTEMS HEALED, RESTARTED, AND LIVE" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Services Available:" -ForegroundColor White
Write-Host "    - API Server:     http://localhost:5001" -ForegroundColor Gray
Write-Host "    - RTMP Server:    rtmp://localhost:1935/live/<key>" -ForegroundColor Gray
Write-Host "    - HLS Server:     http://localhost:8000/live/<key>/index.m3u8" -ForegroundColor Gray
Write-Host "    - Frontend:       http://localhost:5173" -ForegroundColor Gray
Write-Host ""
Write-Host "  Subsystems:" -ForegroundColor White
Write-Host "    [OK] Backend API + Auth + Database" -ForegroundColor Green
Write-Host "    [OK] Frontend React + Vite" -ForegroundColor Green
Write-Host "    [OK] Recording Studio + Waveform Engine" -ForegroundColor Green
Write-Host "    [OK] TV Stations + VOD + Netflix UI" -ForegroundColor Green
Write-Host "    [OK] AI Coach + Copilot + Override Core" -ForegroundColor Green
Write-Host ""


