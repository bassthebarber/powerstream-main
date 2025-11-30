param(
  [string]$Root = (Join-Path $PSScriptRoot "frontend")
)

# ---- rules (adjust 'stations' to your folder name if needed)
$lowerDirs = @(
  "src","pages","components","layout","styles","lib","utils",
  "pages\auth","pages\network","pages\stations","pages\feed","pages\gallery","pages\tv",
  "public","public\logos","public\media"
)

function IsLowerDir($path){
  foreach($d in $lowerDirs){ if($path.ToLower().EndsWith($d.ToLower())){ return $true } }
  return $false
}

function ShouldBePascal($file){
  $p = $file.FullName.ToLower()
  $isJsx = $file.Extension.ToLower() -eq ".jsx"
  $inComp = $p -match "\\src\\components\\"
  $inLayout = $p -match "\\src\\layout\\"
  $inPages = $p -match "\\src\\pages\\"
  return $isJsx -and ($inComp -or $inLayout -or $inPages)
}
function IsPascalCase([string]$name){ $name -match "^[A-Z][A-Za-z0-9]*\.jsx$" }

function ShouldBeCamel($file){
  $p = $file.FullName.ToLower()
  $ext = $file.Extension.ToLower()
  $isCode = $ext -in ".js",".jsx"
  $inLib  = $p -match "\\src\\lib\\"
  $inUtils= $p -match "\\src\\utils\\"
  return $isCode -and ($inLib -or $inUtils)
}
function IsCamel([string]$name){ $name -match "^[a-z][A-Za-z0-9]*\.(jsx|js)$" }

$src = Join-Path $Root "src"
if(!(Test-Path $src)){ Write-Host "❌ Can't find $src" -ForegroundColor Red; exit 1 }

$viol = @()

# Directories
Get-ChildItem -Path $Root -Recurse -Directory | ForEach-Object {
  if(IsLowerDir $_.FullName){
    $leaf = Split-Path $_.FullName -Leaf
    if($leaf -ne $leaf.ToLower()){
      $viol += [pscustomobject]@{
        Type="dir"
        Current=$_.FullName
        Expected=(Join-Path (Split-Path $_.FullName -Parent) ($leaf.ToLower()))
        Fix="git mv `"$($_.FullName)`" `"$((Join-Path (Split-Path $_.FullName -Parent) ($leaf.ToLower())))`""
      }
    }
  }
}

# Files
Get-ChildItem -Path $src -Recurse -File | ForEach-Object {
  $name = $_.Name
  if(ShouldBePascal $_){
    if(-not (IsPascalCase $name)){
      $base = [IO.Path]::GetFileNameWithoutExtension($name)
      $target = ($base.Substring(0,1).ToUpper()+$base.Substring(1)) + ".jsx"
      $viol += [pscustomobject]@{
        Type="file:component(.jsx)"
        Current=$_.FullName
        Expected=(Join-Path (Split-Path $_.FullName -Parent) $target)
        Fix="git mv `"$($_.FullName)`" `"$((Join-Path (Split-Path $_.FullName -Parent) $target))`""
      }
    }
  } elseif(ShouldBeCamel $_){
    if(-not (IsCamel $name)){
      $base = [IO.Path]::GetFileNameWithoutExtension($name)
      $ext  = $_.Extension.ToLower()
      if($ext -eq ".js" -or $ext -eq ".jsx"){
        $target = ($base.Substring(0,1).ToLower()+$base.Substring(1)) + $ext
        $viol += [pscustomobject]@{
          Type="file:lib/utils"
          Current=$_.FullName
          Expected=(Join-Path (Split-Path $_.FullName -Parent) $target)
          Fix="git mv `"$($_.FullName)`" `"$((Join-Path (Split-Path $_.FullName -Parent) $target))`""
        }
      }
    }
  }
}

if($viol.Count -eq 0){ Write-Host "✅ No casing issues found." -ForegroundColor Green; exit 0 }

Write-Host "`n=== Casing issues found ===`n" -ForegroundColor Yellow
$viol | Select-Object Type, Current, Expected | Format-Table -AutoSize

Write-Host "`n--- Suggested fixes (copy/paste) ---`n" -ForegroundColor Cyan
$viol | ForEach-Object { $_.Fix } | Out-String | Write-Host

Write-Host "`nℹ After renaming, run: npm run dev (restart Vite)`n" -ForegroundColor Yellow
