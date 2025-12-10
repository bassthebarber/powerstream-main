# ============================================================
# PowerStream AUTO-PORT-HEAL SCRIPT
# ============================================================
# This script automatically:
# 1. Detects processes blocking critical ports (1935, 8000, 5001)
# 2. Kills those processes
# 3. Clears any stale Node.js processes
# 4. Restarts the full PowerStream stack
#
# Usage:
#   .\backend\scripts\AutoPortHeal.ps1
#   OR from backend folder:
#   .\scripts\AutoPortHeal.ps1
# ============================================================

param(
    [switch]$SkipRestart,
    [switch]$BackendOnly,
    [switch]$Verbose
)

$ErrorActionPreference = "SilentlyContinue"

# Get script and project root directories
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Split-Path -Parent $ScriptDir
$ProjectRoot = Split-Path -Parent $BackendDir

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  PowerStream AUTO-PORT-HEAL SCRIPT INITIATED" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Critical ports used by PowerStream
$ports = @(
    @{ Port = 1935; Service = "RTMP Server (NodeMediaServer)" },
    @{ Port = 8000; Service = "HLS/WebSocket Server" },
    @{ Port = 5001; Service = "PowerStream API (Express)" }
)

Write-Host "[*] Checking for processes blocking critical ports..." -ForegroundColor Yellow
Write-Host ""

$killedPids = @()

foreach ($portInfo in $ports) {
    $port = $portInfo.Port
    $service = $portInfo.Service
    
    $connections = netstat -ano | Select-String ":$port\s"
    
    if ($connections) {
        Write-Host "  [X] Port $port ($service) is in use. Resolving..." -ForegroundColor Red
        
        foreach ($line in $connections) {
            $parts = $line.ToString().Trim() -split "\s+"
            $pid = $parts[-1]
            
            if ($pid -match "^\d+$" -and $pid -ne "0" -and $killedPids -notcontains $pid) {
                try {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    $processName = if ($process) { $process.ProcessName } else { "Unknown" }
                    
                    Write-Host "      -> Killing PID $pid ($processName)" -ForegroundColor Yellow
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    $killedPids += $pid
                }
                catch {
                    if ($Verbose) {
                        Write-Host "      -> Could not kill PID $pid (may already be dead)" -ForegroundColor Gray
                    }
                }
            }
        }
    } else {
        Write-Host "  [OK] Port $port ($service) is free." -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "[*] Killing any leftover Node processes..." -ForegroundColor Yellow

# Kill all node.exe processes
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        Write-Host "      -> Killing node.exe PID $($_.Id)" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
}

# Also try taskkill as backup
taskkill /IM node.exe /F 2>$null | Out-Null

Write-Host "  [OK] All stale Node processes cleared." -ForegroundColor Green

# Wait for ports to fully release
Write-Host ""
Write-Host "[*] Waiting for ports to release..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Verify all ports are now free
$allClear = $true
foreach ($portInfo in $ports) {
    $port = $portInfo.Port
    $check = netstat -ano | Select-String ":$port\s.*LISTENING"
    if ($check) {
        Write-Host "  [!] Port $port still in use!" -ForegroundColor Red
        $allClear = $false
    }
}

if (-not $allClear) {
    Write-Host ""
    Write-Host "[!] Some ports are still blocked. Waiting longer..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

Write-Host "  [OK] All ports verified clear." -ForegroundColor Green

# Skip restart if requested
if ($SkipRestart) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "  AUTO-PORT-HEAL COMPLETED (Skip Restart Mode)" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "All ports are now free. Restart services manually when ready." -ForegroundColor White
    exit 0
}

Write-Host ""
Write-Host "[*] Restarting PowerStream services..." -ForegroundColor Cyan
Write-Host ""

# Start Backend (includes NodeMediaServer)
Write-Host "  [>] Starting Backend (API + RTMP + HLS)..." -ForegroundColor Cyan
$backendPath = Join-Path $ProjectRoot "backend"
$backendCmd = "cd `"$backendPath`"; node server.js"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Normal

Start-Sleep -Seconds 4

# Start Frontend (unless BackendOnly)
if (-not $BackendOnly) {
    Write-Host "  [>] Starting Frontend (Vite)..." -ForegroundColor Cyan
    $frontendPath = Join-Path $ProjectRoot "frontend"
    $frontendCmd = "cd `"$frontendPath`"; npm run dev"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Normal
    
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  AUTO-PORT-HEAL COMPLETED SUCCESSFULLY" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  PowerStream Services:" -ForegroundColor White
Write-Host "    - API Server:     http://localhost:5001" -ForegroundColor Gray
Write-Host "    - RTMP Server:    rtmp://localhost:1935/live/<key>" -ForegroundColor Gray
Write-Host "    - HLS Server:     http://localhost:8000/live/<key>/index.m3u8" -ForegroundColor Gray
if (-not $BackendOnly) {
    Write-Host "    - Frontend:       http://localhost:5173" -ForegroundColor Gray
}
Write-Host ""
Write-Host "  PowerStream is ready for:" -ForegroundColor White
Write-Host "    [OK] Live streaming (RTMP/HLS)" -ForegroundColor Green
Write-Host "    [OK] Studio recording & mixdown" -ForegroundColor Green
Write-Host "    [OK] AI Coach & Copilot" -ForegroundColor Green
Write-Host "    [OK] TV stations & VOD" -ForegroundColor Green
Write-Host "    [OK] Real-time chat (PowerLine)" -ForegroundColor Green
Write-Host ""
