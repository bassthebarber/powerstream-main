param(
  [string]$Root = (Get-Location).Path
)

function Replace-InFile($path, $replacements){
  if(!(Test-Path $path)){ return $false }
  $text = Get-Content $path -Raw
  $orig = $text

  foreach($rep in $replacements){
    $pattern = $rep.Pattern
    $replace = $rep.Replace
    $text = [regex]::Replace($text, $pattern, $replace, 'IgnoreCase, Multiline')
  }

  if($text -ne $orig){
    Set-Content -Path $path -Value $text -NoNewline
    return $true
  }
  return $false
}

# 1) rename .jjs/.jss -> .js
$renamed = @()
Get-ChildItem -Path (Join-Path $Root "routes") -Recurse -File -Include *.jjs,*.jss -ErrorAction Ignore | %{
  $new = $_.FullName -replace "\.jjs$",".js" -replace "\.jss$",".js"
  Rename-Item -Path $_.FullName -NewName (Split-Path $new -Leaf)
  $renamed += "$($_.FullName) -> $new"
}

# 2) transform CommonJS patterns -> ESM for routes + controllers
$targets = @()
$routesDir = Join-Path $Root "routes"
$ctrlsDir  = Join-Path $Root "controllers"
if(Test-Path $routesDir){ $targets += Get-ChildItem -Path $routesDir -Recurse -File -Include *.js }
if(Test-Path $ctrlsDir){ $targets += Get-ChildItem -Path $ctrlsDir -Recurse -File -Include *.js }

$changed = @()
foreach($file in $targets){
  $path = $file.FullName

  # For route files: express require -> Router import
  $routeReplacements = @(
    @{ Pattern = 'const\s+express\s*=\s*require\(["'']express["'']\);?'; Replace = 'import { Router } from "express";' },
    @{ Pattern = 'const\s+router\s*=\s*express\.Router\(\);?'; Replace = 'const router = Router();' },
    @{ Pattern = 'module\.exports\s*=\s*router\s*;?'; Replace = 'export default router;' }
  )

  # generic requires -> import default (handles ./ relative)
  $genericRequire = @{
    Pattern = 'const\s+([A-Za-z0-9_]+)\s*=\s*require\(["''](\.\/[^"'']+|\.{2}\/[^"'']+)["'']\)\s*;?'
    Replace = 'import $1 from "$2.js";'
  }

  # module.exports = { a, b }
  $namedExports = @{
    Pattern = 'module\.exports\s*=\s*\{\s*([A-Za-z0-9_,\s]+)\s*\}\s*;?'
    Replace = 'export { $1 };'
  }

  $did = $false
  $did = (Replace-InFile $path $routeReplacements) -or $did
  $did = (Replace-InFile $path @($genericRequire)) -or $did
  $did = (Replace-InFile $path @($namedExports)) -or $did

  if($did){ $changed += $path }
}

Write-Host "`nRenamed files:" -ForegroundColor Cyan
if($renamed.Count){ $renamed | % { Write-Host " - $_" } } else { Write-Host " - (none)" }

Write-Host "`nChanged files:" -ForegroundColor Cyan
if($changed.Count){ $changed | % { Write-Host " - $_" } } else { Write-Host " - (none)" }

# 3) reminder: check server.js imports
Write-Host "`n👉 Make sure server.js uses ESM imports, e.g.:" -ForegroundColor Yellow
Write-Host '   import feedRouter from "./routes/feedRoutes.js"'
Write-Host '   app.use("/api/feed", feedRouter)'

# 4) show git status/diff if in a repo
if(Test-Path (Join-Path $Root ".git")){
  Push-Location $Root
  git add -A | Out-Null
  Write-Host "`nGit status:" -ForegroundColor Cyan
  git status --short
  Write-Host "`nGit diff (patch):" -ForegroundColor Cyan
  git diff --staged
  Pop-Location
} else {
  Write-Host "`n(Info) Not a git repo, skipping git diff." -ForegroundColor DarkGray
}
