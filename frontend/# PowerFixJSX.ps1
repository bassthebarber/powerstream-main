# PowerFixJSX.ps1
# Renames JSX components and fixes import paths automatically (safe version)
# Logs all changes to PowerFixJSX.log

Write-Host "🚀 Starting PowerFixJSX..." -ForegroundColor Cyan
$logFile = "PowerFixJSX.log"
if (Test-Path $logFile) { Remove-Item $logFile } # clear old logs

# Step 1: Rename .js files that contain JSX into .jsx
Get-ChildItem -Recurse -Path "src" -Filter *.js | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "<[a-zA-Z]") {
        $newName = ($_.FullName -replace '\.js$', '.jsx')
        Rename-Item -Path $_.FullName -NewName $newName -Force
        $msg = "🔄 Renamed $($_.Name) → $(Split-Path $newName -Leaf)"
        Write-Host $msg
        Add-Content $logFile $msg
    }
}

# Step 2: Fix all imports to point to .jsx (ONLY inside src)
Get-ChildItem -Recurse -Path "src" -Include *.js,*.jsx | ForEach-Object {
    $path = $_.FullName
    $content = Get-Content $path -Raw

    # PowerShell-safe regex replacements
    $newContent = $content -replace "(\.\/[^\s'\""]+)\.js(['\""])", '$1.jsx$2'
    $newContent = $newContent -replace "(\.\.[^\s'\""]+)\.js(['\""])", '$1.jsx$2'

    if ($newContent -ne $content) {
        Set-Content $path $newContent
        $msg = "✅ Fixed imports in $($_.FullName)"
        Write-Host $msg
        Add-Content $logFile $msg
    }
}

Write-Host "🎉 PowerFixJSX complete! Log saved to $logFile" -ForegroundColor Green
Write-Host "👉 Restart your dev server with: pnpm dev"
