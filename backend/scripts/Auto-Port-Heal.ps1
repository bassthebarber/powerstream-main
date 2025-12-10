# PowerStream Auto-Port-Heal Script
# Clears ports 1935, 8000, 5001

Write-Host "[*] AUTO-PORT-HEAL running..." -ForegroundColor Cyan

$ports = @(1935, 8000, 5001)

foreach ($p in $ports) {
    $proc = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
    if ($proc) {
        Write-Host "[!] Port $p is in use - terminating..." -ForegroundColor Yellow
        foreach ($conn in $proc) {
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    } else {
        Write-Host "[OK] Port $p is free." -ForegroundColor Green
    }
}

Write-Host "[OK] All ports cleared." -ForegroundColor Green



