Write-Host "`n🎬 Lights, Camera, Action — PowerStream path & alias fix" -ForegroundColor Cyan

# 0) Guard: must be run from frontend
if (!(Test-Path "package.json") -or !(Test-Path "src")) {
  Write-Host "❌ Run this inside your frontend folder (where package.json and /src exist)." -ForegroundColor Red
  exit 1
}

# 1) Ensure supabase client exists
$spClient = "src/supabaseClient.js"
if (!(Test-Path $spClient)) {
@"
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
"@ | Set-Content $spClient -Encoding UTF8
  Write-Host "✅ Created $spClient" -ForegroundColor Green
} else {
  Write-Host "✅ Found $spabaseClient" -ForegroundColor Green
}

# 2) Add Vite alias: @ -> /src
$vite = "vite.config.js"
if (Test-Path $vite) {
  $viteText = Get-Content $vite -Raw
  if ($viteText -notmatch "resolve\s*:\s*{") {
    # Basic vite file — add resolve block
    $viteText = $viteText -replace "export default defineConfig\(\{", "import path from 'node:path';`n`nexport default defineConfig({`n  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },"
  } elseif ($viteText -notmatch "alias\s*:\s*\{[^\}]*'@'") {
    # Has resolve but no '@' alias
    $viteText = $viteText -replace "resolve\s*:\s*\{", "resolve: { alias: { '@': require('node:path').resolve(__dirname, 'src') },"
    if ($viteText -notmatch "import path from 'node:path'") {
      $viteText = "import path from 'node:path';`n" + $viteText
    }
  }
  Set-Content $vite $viteText -Encoding UTF8
  Write-Host "🔧 Ensured Vite alias '@' -> /src in vite.config.js" -ForegroundColor Yellow
} else {
@"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:5001' } // adjust if your API port differs
  }
})
"@ | Set-Content $vite -Encoding UTF8
  Write-Host "✅ Created vite.config.js with alias + proxy" -ForegroundColor Green
}

# 3) Add jsconfig.json so the alias works in editor & Vite
$jsconfig = "jsconfig.json"
if (!(Test-Path $jsconfig)) {
@"
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
"@ | Set-Content $jsconfig -Encoding UTF8
  Write-Host "✅ Created jsconfig.json with @/* -> src/*" -ForegroundColor Green
} else {
  Write-Host "✅ Found jsconfig.json" -ForegroundColor Green
}

# 4) Rewrite any supabaseClient imports to use '@/supabaseClient'
#    Scans your whole src tree for ../supabaseClient.js or ../../supabaseClient.js, etc.
$files = Get-ChildItem -Path "src" -Include *.js,*.jsx,*.ts,*.tsx -Recurse
$pattern = "from\s+['""](\.\./)+supabaseClient\.js['""]"
$replacements = 0

foreach ($f in $files) {
  $raw = Get-Content $f.FullName -Raw
  if ($raw -match $pattern) {
    $new = [regex]::Replace($raw, $pattern, "from '@/supabaseClient'")
    if ($new -ne $raw) {
      Set-Content $f.FullName $new -Encoding UTF8
      Write-Host "🔁 Rewrote import in $($f.FullName) → @/supabaseClient" -ForegroundColor Yellow
      $replacements++
    }
  }
}

if ($replacements -eq 0) {
  Write-Host "ℹ️ No relative supabaseClient imports found to rewrite (good or already fixed)." -ForegroundColor DarkGray
} else {
  Write-Host "✅ Rewrote $replacements file(s) to use '@/supabaseClient' alias." -ForegroundColor Green
}

# 5) Ensure .env.local has bucket (optional)
$envLocal = ".env.local"
if (Test-Path $envLocal) {
  $envText = Get-Content $envLocal -Raw
  if ($envText -notmatch "VITE_SUPABASE_BUCKET=") {
    Add-Content $envLocal "`nVITE_SUPABASE_BUCKET=media"
    Write-Host "➕ Added VITE_SUPABASE_BUCKET=media to .env.local" -ForegroundColor Green
  } else {
    Write-Host "✅ .env.local already has VITE_SUPABASE_BUCKET" -ForegroundColor Green
  }
} else {
@"
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_MEDIA_PUBLIC_URL=
VITE_SUPABASE_BUCKET=media
"@ | Set-Content $envLocal -Encoding UTF8
  Write-Host "⚠️ Created .env.local (fill VITE_* values)" -ForegroundColor Yellow
}

Write-Host "`n🎉 Done. Now:" -ForegroundColor Cyan
Write-Host "   1) Close any running dev servers" -ForegroundColor Cyan
Write-Host "   2) Run: npm run dev:all" -ForegroundColor Cyan
Write-Host "   3) If Vite caches behave oddly, run: rd /s /q node_modules\.vite  (Windows) then start again" -ForegroundColor Cyan
