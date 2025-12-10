# Fix-Supabase-Imports.ps1
$ErrorActionPreference = 'Stop'
$root = Get-Location

# 0) Make sure the client default-exports supabase
$clientPath = Join-Path $root "frontend\src\lib\supabaseClient.js"
if (-not (Test-Path $clientPath)) {
  New-Item -ItemType Directory -Force -Path (Split-Path $clientPath) | Out-Null
}
$clientText = if (Test-Path $clientPath) { Get-Content $clientPath -Raw } else { "" }
if ($clientText -notmatch 'export\s+default\s+supabase') {
  Set-Content -Path $clientPath -Value @'
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default supabase;
'@
  Write-Host "✓ Ensured default export in src/lib/supabaseClient.js" -ForegroundColor Green
}

# 1) Scan files (skip node_modules)
$files = Get-ChildItem -Recurse -Include *.js,*.jsx,*.ts,*.tsx |
         Where-Object { $_.FullName -notmatch '\\node_modules\\' }

# Regex matches any named-import that includes 'supabase' from a path ending with supabaseClient
$pattern = 'import\s*\{([^}]*)\}\s*from\s*([''"])([^''"]*supabaseClient(?:\.\w+)?)\2\s*;?'

[int]$changed = 0
[int]$found = 0

foreach ($f in $files) {
  $text = Get-Content $f.FullName -Raw
  if ($text -match $pattern) {
    $found++
    Write-Host "Found bad import in: $($f.FullName)" -ForegroundColor Yellow

    $new = [System.Text.RegularExpressions.Regex]::Replace(
      $text,
      $pattern,
      { param($m)
        $nameList = $m.Groups[1].Value
        $quote    = $m.Groups[2].Value
        $path     = $m.Groups[3].Value

        # Build remaining named imports without 'supabase'
        $others = @()
        foreach ($n in ($nameList -split ',')) {
          $t = ($n -replace '\s+', ' ').Trim()
          if ($t -and ($t -ne 'supabase')) { $others += $t }
        }

        if ($others.Count -eq 0) {
          "import supabase from $quote$path$quote;"
        } else {
          $rest = ($others -join ', ')
          "import supabase, { $rest } from $quote$path$quote;"
        }
      },
      [System.Text.RegularExpressions.RegexOptions]::Multiline
    )

    if ($new -ne $text) {
      Copy-Item $f.FullName "$($f.FullName).bak" -ErrorAction SilentlyContinue
      Set-Content -Path $f.FullName -Value $new
      $changed++
      Write-Host "✓ Fixed import in: $($f.FullName)" -ForegroundColor Green
    }
  }
}

if ($found -eq 0) {
  Write-Host "• No named supabase imports found. (Good!)" -ForegroundColor DarkGray
} else {
  Write-Host "✅ Scanned: found $found, fixed $changed." -ForegroundColor Green
}

Write-Host "`nFinal steps:" -ForegroundColor Cyan
Write-Host "1) Stop dev server (Ctrl+C)."
Write-Host "2) Delete Vite cache:  Remove-Item -Recurse -Force .\node_modules\.vite  (ignore errors)"
Write-Host "3) npm run dev"
Write-Host "4) Hard refresh browser (Ctrl+F5)"
