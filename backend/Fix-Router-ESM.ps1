param(
  [string]$Routes = (Join-Path $PSScriptRoot "routes"),
  [switch]$DryRun,
  [switch]$AddHealth
)

function Get-UsesRouter([string]$t){
  return [regex]::IsMatch($t, 'Router\s*\(', 'IgnoreCase, Multiline')
}

# Use double-quoted here-strings so quotes inside patterns are safe.
$reImportRouter = [regex]@"
(?im)^\s*import\s*\{\s*Router\s*\}\s*from\s*[""']express[""']\s*;
"@

$reHasExportDefault = [regex]@"
(?i)export\s+default\s+router\s*;
"@

$reModuleExportsRouter = [regex]@"
(?i)module\.exports\s*=\s*router\s*;
"@

$reHasHealth = [regex]@"
(?i)router\.get\(\s*[""']\/health[""']
"@

function Insert-ImportRouter([string]$text){
  if($reImportRouter.IsMatch($text)){ return $text }

  # Insert after the leading import block if any; otherwise prepend.
  $lines = $text -split "`r?`n"
  $i = 0
  while($i -lt $lines.Length -and $lines[$i] -match '^\s*import\s+'){ $i++ }
  $importLine = 'import { Router } from "express";'

  if($i -eq 0){
    return $importLine + "`r`n" + $text
  } else {
    $before = $lines[0..($i-1)]
    $after  = $lines[$i..($lines.Length-1)]
    return ($before + $importLine + $after) -join "`r`n"
  }
}

function Ensure-ExportDefault([string]$text){
  if($reHasExportDefault.IsMatch($text)){ return $text }
  # Replace CommonJS export if present
  $replaced = $reModuleExportsRouter.Replace($text, 'export default router;')
  if($replaced -ne $text){ return $replaced }
  # Otherwise append ESM default export
  return $text.TrimEnd() + "`r`nexport default router;`r`n"
}

function Ensure-Health([string]$text){
  if($reHasHealth.IsMatch($text)){ return $text }
@"
router.get('/health', (req, res) => {
  const name = (req.baseUrl || '/api').split('/').pop();
  res.json({ ok: true, route: req.baseUrl || '/', name });
});
"@ | Out-String | ForEach-Object {
    $snippet = $_
    if($reHasExportDefault.IsMatch($text)){
      return [regex]::Replace($text, '(?i)export\s+default\s+router\s*;', "$snippet`r`nexport default router;")
    } else {
      return $text + "`r`n$snippet`r`n"
    }
  }
}

if(!(Test-Path $Routes)){
  Write-Host "❌ Routes folder not found: $Routes" -ForegroundColor Red
  exit 1
}

$files = Get-ChildItem -Path $Routes -Recurse -Filter *.js
if(-not $files){ Write-Host "ℹ No .js files found under $Routes" -ForegroundColor Yellow; exit 0 }

$changed = @()
$skipped = @()

foreach($f in $files){
  $raw = Get-Content $f.FullName -Raw
  if(-not (Get-UsesRouter $raw)){ $skipped += $f.FullName; continue }

  $txt = $raw
  $txt = Insert-ImportRouter $txt
  $txt = Ensure-ExportDefault $txt
  if($AddHealth){ $txt = Ensure-Health $txt }

  if($txt -ne $raw){
    if($DryRun){
      Write-Host "DRYRUN: would fix $($f.FullName)" -ForegroundColor Yellow
    } else {
      Set-Content -Path $f.FullName -Value $txt -NoNewline
      Write-Host "✔ Fixed $($f.FullName)" -ForegroundColor Green
      $changed += $f.FullName
    }
  } else {
    $skipped += $f.FullName
  }
}

Write-Host "`n==== Summary ====" -ForegroundColor Cyan
Write-Host ("Changed : {0}" -f $changed.Count)
Write-Host ("Skipped : {0}" -f $skipped.Count)
if($DryRun){ Write-Host "Note: -DryRun set; no files written." -ForegroundColor Yellow }
