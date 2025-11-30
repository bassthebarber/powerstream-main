param(
  [int[]] $Ports = @(5173,4173)  # dev + preview
)

$ErrorActionPreference = "SilentlyContinue"
Write-Host " Unpowering PowerStream UI..." -ForegroundColor Yellow

# kill vite/node serving those ports
foreach ($p in $Ports) {
  $pid = (Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue).OwningProcess
  if ($pid) {
    Write-Host " Killing PID $pid on port $p"
    Stop-Process -Id $pid -Force
  }
}

# extra safety: stop any vite/node that might be hanging
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node.exe" } | Stop-Process -Force -ErrorAction SilentlyContinue

# clean caches
Write-Host "🧹 Cleaning build artifacts..."
Remove-Item -Recurse -Force -ErrorAction Ignore dist
Remove-Item -Recurse -Force -ErrorAction Ignore .vite
Remove-Item -Recurse -Force -ErrorAction Ignore node_modules\.cache\vite

Write-Host " UI powered down & cleaned."
