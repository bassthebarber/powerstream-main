param(
  [string]$Root = (Join-Path $PSScriptRoot "frontend"),
  [switch]$Apply,
  [switch]$RewriteImports,
  [switch]$IncludeTS
)

# -------- helpers --------
function Get-GitRoot([string]$start){
  $d = Resolve-Path $start
  while ($d -and -not (Test-Path (Join-Path $d ".git"))) {
    $parent = Split-Path $d -Parent
    if ($parent -and ($parent -ne $d)) { $d = $parent } else { $d = $null }
  }
  return $d
}

function Join-RelPath([string]$fromFile, [string]$toFile){
  $from = [uri](Resolve-Path $fromFile).Path
  $to   = [uri](Resolve-Path $toFile).Path
  $rel  = $from.MakeRelativeUri($to).ToString()
  if (-not ($rel.StartsWith(".") -or $rel.StartsWith("/"))) { $rel = "./" + $rel }
  $rel = $rel.Replace("%20"," ").Replace("\","/")
  return $rel
}

# -------- rules --------
$lowerDirs = @(
  "src","pages","components","layout","styles","lib","utils",
  "pages\auth","pages\network","pages\stations","pages\feed","pages\gallery","pages\tv",
  "public","public\logos","public\media"
)

function IsLowerDir($path){
  foreach($d in $lowerDirs){
    if ($path.ToLower().EndsWith($d.ToLower())) { return $true }
  }
  return $false
}

function ShouldBePascal($file){
  $p = $file.FullName.ToLower()
  $ext = $file.Extension.ToLower()
  $useTs = $IncludeTS.IsPresent
  $isReact = $false
  if ($useTs) {
    if (($ext -eq ".jsx") -or ($ext -eq ".tsx")) { $isReact = $true }
  } else {
    if ($ext -eq ".jsx") { $isReact = $true }
  }
  $inComp   = ($p -match "\\src\\components\\")
  $inLayout = ($p -match "\\src\\layout\\")
  $inPages  = ($p -match "\\src\\pages\\")
  return ($isReact -and ($inComp -or $inLayout -or $inPages))
}

function IsPascalCase([string]$name){
  return ($name -match "^[A-Z][A-Za-z0-9]*\.(jsx|tsx)$")
}

function ShouldBeCamel($file){
  $p = $file.FullName.ToLower()
  $ext = $file.Extension.ToLower()
  $useTs = $IncludeTS.IsPresent
  $isCode = $false
  if ($useTs) {
    if ((".js",".jsx",".ts",".tsx") -contains $ext) { $isCode = $true }
  } else {
    if ((".js",".jsx") -contains $ext) { $isCode = $true }
  }
  $inLib   = ($p -match "\\src\\lib\\")
  $inUtils = ($p -match "\\src\\utils\\")
  return ($isCode -and ($inLib -or $inUtils))
}

function IsCamel([string]$name){
  return ($name -match "^[a-z][A-Za-z0-9]*\.(js|jsx|ts|tsx)$")
}

# -------- start --------
$src = Join-Path $Root "src"
if (!(Test-Path $src)) { Write-Host "❌ Can't find $src" -ForegroundColor Red; exit 1 }

$viol = @()

# Directories
Get-ChildItem -Path $Root -Recurse -Directory | ForEach-Object {
  if (IsLowerDir $_.FullName) {
    $leaf = Split-Path $_.FullName -Leaf
    if ($leaf -ne $leaf.ToLower()) {
      $viol += [pscustomobject]@{
        Type="dir"
        Current=$_.FullName
        Expected=(Join-Path (Split-Path $_.FullName -Parent) ($leaf.ToLower()))
      }
    }
  }
}

# Files
Get-ChildItem -Path $src -Recurse -File | ForEach-Object {
  $name = $_.Name
  $ext  = $_.Extension
  if (ShouldBePascal $_) {
    if (-not (IsPascalCase $name)) {
      $base = [IO.Path]::GetFileNameWithoutExtension($name)
      $useTs = $IncludeTS.IsPresent
      $tExt = $ext
      if ($useTs) {
        if ($ext -eq ".js") { $tExt = ".jsx" }
        elseif ($ext -eq ".ts") { $tExt = ".tsx" }
      } else {
        if ($ext -eq ".js") { $tExt = ".jsx" }
      }
      $target = ($base.Substring(0,1).ToUpper() + $base.Substring(1)) + $tExt
      $viol += [pscustomobject]@{
        Type="file:component"
        Current=$_.FullName
        Expected=(Join-Path (Split-Path $_.FullName -Parent) $target)
      }
    }
  } elseif (ShouldBeCamel $_) {
    if (-not (IsCamel $name)) {
      $base = [IO.Path]::GetFileNameWithoutExtension($name)
      $tExt = $ext.ToLower()
      $target = ($base.Substring(0,1).ToLower() + $base.Substring(1)) + $tExt
      $viol += [pscustomobject]@{
        Type="file:lib/utils"
        Current=$_.FullName
        Expected=(Join-Path (Split-Path $_.FullName -Parent) $target)
      }
    }
  }
}

if ($viol.Count -eq 0) {
  Write-Host "✅ No casing issues found." -ForegroundColor Green
  return
}

Write-Host "`n=== Casing issues found ===`n" -ForegroundColor Yellow
$viol | Select-Object Type, Current, Expected | Format-Table -AutoSize

if (-not $Apply) {
  Write-Host "`n💡 Add -Apply to perform renames with git mv." -ForegroundColor Cyan
  return
}

# -------- apply safely (git) --------
$repoRoot = Get-GitRoot $Root
if (-not $repoRoot) { Write-Error "Couldn't find a .git folder up the tree. Run from inside a git repo."; exit 1 }
Push-Location $repoRoot

$stamp  = (Get-Date).ToString("yyyyMMdd-HHmm")
$branch = "fix/casing-$stamp"
$tag    = "pre-casing-$stamp"

git add -A | Out-Null
git commit -m "chore: checkpoint before casing fix" 2>$null | Out-Null
git tag $tag
git checkout -b $branch | Out-Null

foreach ($v in $viol) {
  $dir = Split-Path $v.Expected -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  git mv "$($v.Current)" "$($v.Expected)"
}

if ($RewriteImports) {
  $map = @{}
  foreach ($v in $viol) { $map[$v.Current] = $v.Expected }

  $codeFiles = Get-ChildItem -Path (Join-Path $Root "src") -Recurse -File -Include *.js,*.jsx,*.ts,*.tsx
  foreach ($cf in $codeFiles) {
    $text = Get-Content $cf.FullName -Raw
    $orig = $text

    foreach ($pair in $map.GetEnumerator()) {
      $old = $pair.Key
      $neu = $pair.Value
      if (-not (Test-Path $neu)) { continue }

      $rel = Join-RelPath $cf.FullName $neu

      # static imports: from "..."
      $text = $text -replace '(from\s+["''])([^"''\r\n]+)(["''])', {
        param($m)
        $pre = $m.Groups[1].Value; $p = $m.Groups[2].Value; $suf = $m.Groups[3].Value
        $oldLeaf = Split-Path $old -Leaf
        if ($p.ToLower().EndsWith($oldLeaf.ToLower())) { return "$pre$rel$suf" } else { return $m.Value }
      }

      # dynamic imports: import("...")
      $text = $text -replace '(import\(\s*["''])([^"''\r\n]+)(["'']\s*\))', {
        param($m)
        $pre = $m.Groups[1].Value; $p = $m.Groups[2].Value; $suf = $m.Groups[3].Value
        $oldLeaf = Split-Path $old -Leaf
        if ($p.ToLower().EndsWith($oldLeaf.ToLower())) { return "$pre$rel$suf" } else { return $m.Value }
      }
    }

    if ($text -ne $orig) { Set-Content -Path $cf.FullName -Value $text -NoNewline }
  }
}

git add -A
git commit -m "fix(casing): normalize folders/files + rewrite imports"
Pop-Location

Write-Host "`n✅ Done on branch $branch" -ForegroundColor Green
Write-Host "   Review: git diff main...$branch"
Write-Host "   Rollback: git checkout main; git reset --hard $tag"
Write-Host "   Restart Vite: npm run dev"
