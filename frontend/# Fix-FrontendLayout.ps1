# Fix-FrontendLayout.ps1
# Flattens multiple nested frontends -> .\frontend (single app)
# Creates .backup_yyyyMMddHHmm and a new .\frontend from the chosen app.

$ErrorActionPreference = "Stop"

function Pick-AppFolder {
  Write-Host "`nScanning for React/Vite apps..." -ForegroundColor Cyan
  $candidates = Get-ChildItem -Recurse -File -Filter package.json |
    Where-Object {
      $pkg = Get-Content $_.FullName -Raw
      ($pkg -match '"vite"') -or ($pkg -match '"react"') -or ($pkg -match '"@vitejs')
    } |
    Sort-Object { $_.DirectoryName.Length }  # deepest first (most likely app)

  if (-not $candidates) { throw "No package.json found. Open the correct project root." }

  $i = 0
  $list = @()
  foreach ($c in $candidates) {
    $dir = $c.Directory.FullName
    $hasVite = Test-Path (Join-Path $dir "vite.config.js") -or (Test-Path (Join-Path $dir "vite.config.ts"))
    $hasSrc  = Test-Path (Join-Path $dir "src")
    $hasIdx  = Test-Path (Join-Path $dir "index.html")
    $list += [PSCustomObject]@{
      Index = $i
      Dir   = $dir
      Src   = $hasSrc
      Vite  = $hasVite
      IndexHtml = $hasIdx
    }
    $i++
  }

  $list | Format-Table -AutoSize

  Write-Host "`nPick the app folder INDEX you want to keep (the one with src + index.html + vite.config)." -ForegroundColor Yellow
  $choice = Read-Host "Enter index"
  if ($choice -notmatch '^\d+$' -or [int]$choice -ge $list.Count) { throw "Invalid index." }
  return $list[[int]$choice].Dir
}

function Copy-App($source, $dest) {
  $items = @(
    "src","public","index.html",
    "package.json","package-lock.json","yarn.lock","pnpm-lock.yaml",
    "vite.config.js","vite.config.ts",
    "postcss.config.js","tailwind.config.js",
    "tsconfig.json","jsconfig.json",
    ".eslintrc","eslint.config.js",".npmrc",
    ".env",".env.local",".env.development",".env.production"
  )
  foreach ($it in $items) {
    $p = Join-Path $source $it
    if (Test-Path $p) {
      Write-Host "Copying $it"
      if (Test-Path $p -PathType Container) {
        Copy-Item $p -Destination $dest -Recurse -Force
      } else {
        Copy-Item $p -Destination $dest -Force
      }
    }
  }
}

$root = Get-Location
$backup = Join-Path $root (".backup_{0}" -f (Get-Date -Format "yyyyMMddHHmm"))
$target = Join-Path $root "frontend"

Write-Host "Creating backup: $backup" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $backup | Out-Null

# Backup the whole tree first (safety)
Get-ChildItem -Force | Where-Object { $_.Name -ne (Split-Path $backup -Leaf) } |
  Copy-Item -Destination $backup -Recurse -Force

# Let user pick the real app
$app = Pick-AppFolder
Write-Host "`nSelected app: $app" -ForegroundColor Green

# Clean/prepare target
if (Test-Path $target) {
  Write-Host "Removing existing .\frontend" -ForegroundColor Yellow
  Remove-Item $target -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $target | Out-Null

# Copy app files into final frontend/
Copy-App -source $app -dest $target

Write-Host "`nInstalling dependencies..." -ForegroundColor Cyan
Push-Location $target
if (Test-Path "package-lock.json") { npm ci } else { npm i }
Pop-Location

Write-Host "`nDONE. Single app is now at: $target" -ForegroundColor Green
Write-Host "Backup is at: $backup"
Write-Host "Next: see the alias step I print below."

Write-Host @"
----------------------------------------------------------------
NEXT STEPS
1) Set vite alias (@ -> /src) in frontend/vite.config.* (below)
2) Update your imports to start with @/  (example: import x from '@/components/x')
3) Start dev:  cd frontend ; npm run dev
----------------------------------------------------------------
"@
