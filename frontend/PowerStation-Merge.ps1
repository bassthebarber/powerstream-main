param(
  [string]$FrontEndRoot = "frontend",
  [switch]$Apply,           # actually write changes
  [switch]$DeleteOld        # after merge + rewrites, delete legacy files
)

# ---------- Paths ----------
$srcRoot   = Join-Path $FrontEndRoot "src"
$stylesDir = Join-Path $srcRoot "styles"
$canonCss  = Join-Path $stylesDir "TVStations.module.css"

# Legacy files we want to merge/remove if present
$legacyCss = @(
  "components\powerstation\PowerStation.module.css",
  "styles\StationView.module.css",
  "styles\station.css",                        # non-module; we’ll merge what we need
  "copilot\plugins\AutoLayoutTVStations.module.css"
) | ForEach-Object { Join-Path $srcRoot $_ }

# Import rewrites: any of these → styles/TVStations.module.css
$rewritePairs = @(
  "\\src\\styles\\StationView\.module\.css$",
  "\\src\\components\\powerstation\\PowerStation\.module\.css$",
  "\\src\\styles\\station\.css$"
)

# ---------- Helpers ----------
function Ensure-Dir($p){ if(!(Test-Path $p)){ New-Item -ItemType Directory -Force -Path $p | Out-Null } }

function Git-Available { return (Get-Command git -ErrorAction SilentlyContinue) -ne $null }
function Git-Prep {
  if(-not (Git-Available)){ return }
  if(-not (Test-Path ".git")){ return }
  $stamp  = (Get-Date).ToString("yyyyMMdd-HHmmss")
  $branch = "fix/station-css-$stamp"
  $tag    = "pre-station-css-$stamp"
  git add -A | Out-Null
  git commit -m "chore: checkpoint before station CSS merge" 2>$null | Out-Null
  git tag $tag
  git checkout -b $branch | Out-Null
  Write-Host "✔ Git branch created: $branch (tag: $tag)" -ForegroundColor Green
}

function Backup-File($path){
  if(Test-Path $path){
    $bak = "$path.bak-" + (Get-Date).ToString("yyyyMMdd-HHmmss")
    Copy-Item $path $bak -Force
    Write-Host "• Backup -> $bak"
  }
}

function Append-With-Header($target, $sourcePath){
  $name = Split-Path $sourcePath -Leaf
  $header = "`n/* ===== merged from $name @ $(Get-Date -Format s) ===== */`n"
  $body   = (Get-Content $sourcePath -Raw)
  Add-Content -Path $target -Value ($header + $body + "`n")
}

# ---------- Start ----------
if(!(Test-Path $srcRoot)){ Write-Host "❌ Not found: $srcRoot" -ForegroundColor Red; exit 1 }
Ensure-Dir $stylesDir

$would = $true; if($Apply){ $would = $false }
Write-Host ($would ? "🔎 DRY RUN (no files will change)" : "🚀 APPLY MODE") -ForegroundColor Cyan

# Create canonical file if missing
if(!(Test-Path $canonCss)){
  if($would){
    Write-Host "Would create $canonCss"
  } else {
    Ensure-Dir $stylesDir
    "@media (prefers-color-scheme: dark) { :root { } }`n/* TVStations canonical stylesheet */`n" | Set-Content $canonCss -NoNewline
    Write-Host "✔ Created $canonCss" -ForegroundColor Green
  }
}

# Git prep (only when applying)
if($Apply){ Git-Prep }

# Merge legacy CSS files
$foundToMerge = @()
foreach($f in $legacyCss){
  if(Test-Path $f){
    $foundToMerge += $f
  }
}

if($foundToMerge.Count -eq 0){
  Write-Host "No legacy station CSS files found to merge."
} else {
  Write-Host "Merging the following into $canonCss:`n  - " + ($foundToMerge -join "`n  - ")
  if($Apply){
    Backup-File $canonCss
    foreach($f in $foundToMerge){ Append-With-Header -target $canonCss -sourcePath $f }
    Write-Host "✔ Merge complete." -ForegroundColor Green
  } else {
    Write-Host "Would append contents to $canonCss"
  }
}

# Rewrite imports across codebase
$codeFiles = Get-ChildItem -Path $srcRoot -Recurse -File -Include *.js,*.jsx,*.ts,*.tsx,*.css
$canonImportRel = "../../styles/TVStations.module.css"   # most station pages are /pages/**; relative path works

$rewrites = 0
foreach($cf in $codeFiles){
  $text = Get-Content $cf.FullName -Raw
  $orig = $text

  foreach($pattern in $rewritePairs){
    # Replace any import path whose tail matches the legacy file with canonical
    $text = $text -replace "(from\s+['""])([^'""]*$pattern)(['""])", "`$1$canonImportRel`$3"
    $text = $text -replace "(import\(\s*['""])([^'""]*$pattern)(['""]\s*\))", "`$1$canonImportRel`$3"
    # Also generic CSS @import
    $text = $text -replace "(@import\s+['""])([^'""]*$pattern)(['""]\s*;)", "`$1$canonImportRel`$3"
  }

  if($text -ne $orig){
    $rewrites++
    if($Apply){ Set-Content -Path $cf.FullName -Value $text -NoNewline }
  }
}

Write-Host ("{0} file(s) " + ($Apply ? "rewritten" : "would be rewritten") + " to import $canonImportRel") -f $rewrites

# Optionally delete legacy files
if($DeleteOld){
  foreach($f in $foundToMerge){
    if($Apply){
      if(Git-Available -and (Test-Path ".git")){
        git rm -f -- "$f" | Out-Null
      } else {
        Remove-Item $f -Force
      }
      Write-Host "✂ Removed $f"
    } else {
      Write-Host "Would delete $f"
    }
  }
}

if($Apply -and (Git-Available) -and (Test-Path ".git")){
  git add -A | Out-Null
  git commit -m "chore(stations): merge legacy station CSS into TVStations.module.css; rewrite imports" | Out-Null
  Write-Host "✔ Changes committed." -ForegroundColor Green
}

Write-Host "`nNext:" -ForegroundColor Yellow
Write-Host "  1) Restart Vite: npm run dev"
Write-Host "  2) Visit /network and each /tv/* page to verify styling."
