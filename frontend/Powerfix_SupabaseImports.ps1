Write-Host "🔧 PowerStream Supabase Import Fix starting..." -ForegroundColor Cyan

# ------------- CONFIG -------------
$SRC = "frontend/src"   # change if your src lives somewhere else
$CLIENT_REL = "/src/lib/supabaseClient.js"
$ClientFile = Join-Path $SRC "lib\supabaseClient.js"
# ----------------------------------

# Ensure client file exists with correct content
$desiredClient = @'
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default supabase;
'@

$needWrite = $true
if (Test-Path $ClientFile) {
  $existing = Get-Content $ClientFile -Raw
  if ($existing -eq $desiredClient) { $needWrite = $false }
}

if ($needWrite) {
  New-Item -ItemType Directory -Force -Path (Split-Path $ClientFile) | Out-Null
  Set-Content -Path $ClientFile -Value $desiredClient -Encoding UTF8
  Write-Host "✔ Wrote/updated $ClientFile" -ForegroundColor Green
} else {
  Write-Host "✔ Client already correct: $ClientFile" -ForegroundColor Green
}

# Find all .js/.jsx/.ts/.tsx files under src
$files = Get-ChildItem -Path $SRC -Recurse -Include *.js,*.jsx,*.ts,*.tsx

$changed = @()
$badLines = @()

foreach ($f in $files) {
  $text = Get-Content $f.FullName -Raw

  # 1) Replace any named import { supabase } with default import
  $regexNamed = "import\s*\{\s*supabase\s*\}\s*from\s*(['""])(.+?supabaseClient\.js)\1"
  if ($text -match $regexNamed) {
    $new = [regex]::Replace($text, $regexNamed, { param($m) "import supabase from $($m.Groups[1].Value)$($m.Groups[2].Value)$($m.Groups[1].Value)" })
    if ($new -ne $text) {
      Set-Content -Path $f.FullName -Value $new -Encoding UTF8
      $changed += $f.FullName
      $text = $new
    }
  }

  # 2) Normalize any default import path to the canonical one (/src/lib/supabaseClient.js)
  $regexAnyClient = "import\s+supabase\s+from\s+(['""])(.+?supabaseClient\.js)\1"
  if ($text -match $regexAnyClient) {
    $new2 = [regex]::Replace($text, $regexAnyClient, { param($m) "import supabase from `"$CLIENT_REL`"" })
    if ($new2 -ne $text) {
      Set-Content -Path $f.FullName -Value $new2 -Encoding UTF8
      $changed += $f.FullName
      $text = $new2
    }
  }

  # 3) Record any remaining bad imports so we can report them
  if ($text -match "import\s*\{\s*supabase\s*\}\s*from") {
    $badLines += $f.FullName
  }
}

# De-dupe changed list
$changed = $changed | Sort-Object -Unique
$badLines = $badLines | Sort-Object -Unique

Write-Host ""
Write-Host "==== Summary ====" -ForegroundColor Cyan
if ($changed.Count -gt 0) {
  Write-Host "✔ Files updated:" -ForegroundColor Green
  $changed | ForEach-Object { Write-Host "  - $_" }
} else {
  Write-Host "• No files needed changes." -ForegroundColor Yellow
}

if ($badLines.Count -gt 0) {
  Write-Host "`n⚠ Still found named { supabase } imports in:" -ForegroundColor Red
  $badLines | ForEach-Object { Write-Host "  - $_" }
  Write-Host "Please open and change to:  import supabase from `"$CLIENT_REL`""
} else {
  Write-Host "`n✅ No remaining bad imports detected." -ForegroundColor Green
}

Write-Host "`nDone." -ForegroundColor Cyan
