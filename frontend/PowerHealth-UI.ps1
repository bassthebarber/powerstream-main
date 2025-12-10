param(
  [string]$Root
)

# Resolve root: use param, else PSScriptRoot, else current directory
if ([string]::IsNullOrWhiteSpace($Root)) {
  if ($PSScriptRoot) { $Root = $PSScriptRoot } else { $Root = (Get-Location).Path }
}

try {
  $rootPath = Resolve-Path $Root
} catch {
  Write-Host "❌ Can't resolve root: $Root" -ForegroundColor Red
  exit 1
}

$mustFiles = @(
  "index.html",
  "src/main.jsx",
  "src/App.jsx",
  "src/layout/Header.jsx",
  "src/layout/Layout.jsx",
  "src/styles/global.css",
  "src/pages/Home.jsx",
  "src/pages/Feed.jsx",
  "src/pages/Gram.jsx",
  "src/pages/Reel.jsx",
  "src/pages/PowerLine.jsx",
  "src/pages/network/Network.jsx",
  "src/pages/station/StationPage.jsx",
  "src/pages/auth/SignIn.jsx",
  "src/pages/auth/Register.jsx",
  "src/lib/supabaseClient.jsx"
)

$assets = @(
  "public/logos/powerstream-logo.png",
  "public/media/welcome.mp3" # optional
)

$missing = @()
Write-Host "🔎 Checking required files under $rootPath`n"

foreach ($f in $mustFiles) {
  $p = Join-Path $rootPath $f
  if (Test-Path $p) {
    Write-Host "✅ $f" -ForegroundColor Green
  } else {
    Write-Host "❌ $f" -ForegroundColor Red
    $missing += $f
  }
}

Write-Host "`n🖼 Assets" -ForegroundColor Cyan
foreach ($a in $assets) {
  $p = Join-Path $rootPath $a
  if (Test-Path $p) {
    Write-Host "✅ $a" -ForegroundColor Green
  } else {
    Write-Host "⚠️  $a (optional/missing)" -ForegroundColor Yellow
  }
}

$envPath = Join-Path $rootPath ".env.local"
Write-Host "`n⚙️  ENV (.env.local)" -ForegroundColor Cyan
if (Test-Path $envPath) {
  $envText = Get-Content $envPath -Raw
  foreach ($k in "VITE_SUPABASE_URL","VITE_SUPABASE_ANON_KEY","VITE_WELCOME_MP3") {
    if ($envText -match "^\s*$k=") {
      Write-Host "✅ $k set" -ForegroundColor Green
    } else {
      Write-Host "❌ $k missing" -ForegroundColor Red
    }
  }
} else {
  Write-Host "❌ .env.local not found" -ForegroundColor Red
}

if ($missing.Count -gt 0) {
  Write-Host "`n🚨 Missing files (create these):" -ForegroundColor Yellow
  $missing | ForEach-Object { Write-Host " - $_" }
  exit 2
} else {
  Write-Host "`n🎉 All required files present." -ForegroundColor Green
  exit 0
}
